const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
/*console.log('=== STRIPE KEY DEBUG ===');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0);
console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) : 'N/A');
console.log('Full key (hidden):', process.env.STRIPE_SECRET_KEY ? 'sk_test_...' : 'MISSING');
console.log('=========================');*/

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is missing in .env file!');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // or a more recent one like '2025-12-15' if you want the latest features
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://techmock-dva6.vercel.app', 'https://www.techmocks.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Special raw body parser for Stripe webhook ONLY
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith('/api/payment/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Connection Successful:', success);
  }
});

// Temporary storage for OTPs with expiry
const otpStorage = {};

// Middleware for Admin Authorization
const verifyAdmin = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    // Fetch user role from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', verified.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }

    next();
  } catch (err) {
    console.error('Error in verifyAdmin:', err);
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Middleware for User Authorization
const verifyUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// Generate OTP with expiry
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    otpStorage[email] = { otp, expiry: expiryTime };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = otpStorage[email];
    if (!storedOtp || storedOtp.expiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpStorage[email].verified = true;
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
});

// Registration Route
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!otpStorage[email]?.verified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, is_verified: true, role: 'user' }])
      .select('id')
      .single();

    if (error) throw error;

    delete otpStorage[email];

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password, role')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    res.status(200).json({ email, role: user.role || 'user', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Add Mock Test
app.post('/api/admin/add-mock-test', verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, timeLimit, questions, pricingType, price } = req.body;

    console.log('Incoming Mock Test Data:', req.body);

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid title and at least one question.' });
    }

    if (!pricingType || !['free', 'paid'].includes(pricingType)) {
      return res.status(400).json({ message: 'Invalid pricingType. Allowed values: free, paid.' });
    }

    if (pricingType === 'paid' && (!price || isNaN(price) || Number(price) <= 0)) {
      return res.status(400).json({ message: 'Please provide a valid price for paid mock tests.' });
    }

    const { data, error } = await supabase
      .from('mock_tests')
      .insert([{
        title,
        description,
        category,
        time_limit: timeLimit,
        questions: questions,
        pricing_type: pricingType,
        price: pricingType === 'paid' ? Number(price) : 0,
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('Mock Test Saved Successfully:', data);

    res.status(201).json({ message: 'Mock test added successfully!', mockTest: data });
  } catch (error) {
    console.error('Error adding mock test:', error);
    res.status(500).json({ message: 'Error adding mock test', error: error.message });
  }
});

// User: Checkout
app.post('/api/user/checkout', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('id, mock_test_id, price')
      .eq('user_id', userId);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Move cart items to purchased_tests
    const purchasedTests = cartItems.map(item => ({
      user_id: userId,
      mock_test_id: item.mock_test_id,
    }));

    const { error: insertError } = await supabase
      .from('purchased_tests')
      .insert(purchasedTests);

    if (insertError) throw insertError;

    // Clear cart
    const { error: deleteError } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    res.status(200).json({
      message: 'Checkout successful',
      purchasedTests: cartItems.map(item => item.mock_test_id),
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});

// Stripe: Create PaymentIntent
// Stripe: Create PaymentIntent (UPDATED - DYNAMIC CURRENCY)
// Stripe: Create PaymentIntent (Fixed to GBP for PayPal support)
app.post('/api/payment/create-intent', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('price')  // Only need price (base INR)
      .eq('user_id', userId);

    if (error) throw error;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const baseTotalINR = cartItems.reduce((sum, item) => sum + item.price, 0);

    if (baseTotalINR <= 0) {
      return res.status(400).json({ message: 'No paid items in cart' });
    }

    // Convert INR → GBP using a reliable rate source
    // Using exchangerate.host (free, no key needed)
    const rateRes = await fetch('https://api.exchangerate.host/latest?base=INR&symbols=GBP');
    const rateData = await rateRes.json();
    const inrToGbpRate = rateData.rates?.GBP || 0.0095; // fallback rate ~ Jan 2026

    const amountGBP = baseTotalINR * inrToGbpRate;
    const amountInPence = Math.round(amountGBP * 100); // Stripe uses subunits

    // Stripe minimum for GBP is £0.30 (~30 pence)
    if (amountInPence < 30) {
      return res.status(400).json({ message: 'Amount too small for payment' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',  // Fixed to GBP → enables PayPal
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: userId.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
});

// Stripe: Webhook (fulfill order on successful payment + send confirmation email)
// Stripe: Webhook (fulfill order on successful payment + send confirmation email)
app.post('/api/payment/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

// Acknowledge receipt immediately with 200
  res.json({ received: true });

  // Now process asynchronously (no risk of timeout)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.user_id;

    if (!userId) {
      console.error('No user_id in metadata');
      return;
    }
    try {
      // 1. Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (!userError && userData) {
        userName = userData.name || 'User';
        userEmail = userData.email || '';
      }

      // 2. Fetch purchased items (primary source after fulfillment)
      const { data: purchased, error: purchasedError } = await supabase
        .from('purchased_tests')
        .select('mock_test_id, mock_tests(title, price)')
        .eq('user_id', userId)
        .order('id', { ascending: false }) // Get recent ones
        .limit(10); // Safety limit

      cartItems = purchased || [];

      // Fallback to cart if no purchased yet (rare, but for timing issues)
      if (cartItems.length === 0) {
        const { data: fallbackCart, error: fallbackError } = await supabase
          .from('cart')
          .select('mock_test_id, mock_tests(title, price)')
          .eq('user_id', userId);

        if (!fallbackError && fallbackCart) cartItems = fallbackCart;
      }

      if (cartItems.length === 0) {
        console.log('No items to fulfill for user:', userId);
        return res.status(200).json({ received: true });
      }

      // Extract details
      purchasedTestTitles = cartItems.map(item => item.mock_tests?.title || 'Untitled Test');
      totalAmountINR = cartItems.reduce((sum, item) => sum + (item.mock_tests?.price || 0), 0);

      // 3. Fulfill (idempotent - upsert to avoid duplicates)
      const purchasedTests = cartItems.map(item => ({
        user_id: userId,
        mock_test_id: item.mock_test_id,
      }));

      await supabase.from('purchased_tests').upsert(purchasedTests, {
        onConflict: 'user_id, mock_test_id',
        ignoreDuplicates: true,
      });

      // 4. Always clear cart (safe)
      await supabase.from('cart').delete().eq('user_id', userId);

      console.log(`Order fulfilled for user ${userId} (${userEmail})`);

      // 5. Send email if possible
      if (userEmail) {
        const amountGBP = (paymentIntent.amount_received / 100).toFixed(2);
        const amountDisplay = totalAmountINR.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

        const mailOptions = {
          from: `"TechMocks" <${process.env.EMAIL_USER}>`,
          to: userEmail,
          subject: 'Payment Successful – Your Mock Tests are Unlocked! 🎉',
          text: `Hello ${userName},

Thank you for your purchase on TechMocks!

Your payment of approximately ${amountDisplay} (₹${totalAmountINR}) has been successfully processed via card/wallet.

The following mock tests are now unlocked in your account:
${purchasedTestTitles.map(t => `• ${t}`).join('\n')}

You can access them anytime from your profile.

Keep practicing and ace your interviews!

Best regards,
The TechMocks Team
https://www.techmocks.com`,

          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #ffffff;">
              <h2 style="color: #27ae60; text-align: center;">Payment Successful! 🎉</h2>
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Thank you for your purchase on <strong>TechMocks</strong>!</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ~${amountDisplay} (charged as £${amountGBP} GBP)</p>
                <p style="margin: 8px 0;"><strong>Payment Method:</strong> Card / Wallet (via Stripe)</p>
              </div>

              <p><strong>Your purchased mock tests:</strong></p>
              <ul style="background: #f0f8ff; padding: 15px; border-radius: 8px;">
                ${purchasedTestTitles.map(title => `<li style="margin: 8px 0;">${title}</li>`).join('')}
              </ul>

              <p>All tests are now <strong>unlocked</strong> and ready in your dashboard.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.techmocks.com" style="background: #3399cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to My Dashboard</a>
              </div>

              <p>Keep up the amazing work! 💪</p>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
                Best regards,<br>
                <strong>The TechMocks Team</strong><br>
                <a href="https://www.techmocks.com" style="color: #3498db; text-decoration: none;">www.techmocks.com</a>
              </p>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Success email sent to ${userEmail}`);
        } catch (emailErr) {
          console.error('Failed to send Stripe success email:', emailErr);
        }
      }

    } catch (err) {
      console.error('Error fulfilling Stripe order:', err);
    }
  }

  res.json({ received: true });
});

// ||||||||||||||||| RAZORPAY ENDPOINT |||||||||||||||||||||||
// Razorpay: Create Order
// Razorpay: Create Order (FIXED receipt length)
app.post('/api/payment/razorpay/create-order', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('price')
      .eq('user_id', userId);

    if (error) throw error;

    const totalINR = cartItems.reduce((sum, item) => sum + item.price, 0);
    if (totalINR !== amount) {
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    // SAFE SHORT RECEIPT (max ~30 chars, works with UUIDs too)
    const shortId = Math.random().toString(36).substring(2, 10); // e.g., "a1b2c3d4"
    const receipt = `rec_${shortId}_${Date.now().toString().slice(-8)}`; 
    // Example: rec_a1b2c3d4_00000000 → ~25 chars

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: receipt, // Now guaranteed < 40 chars
    });

    res.json({ order });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// Razorpay: Verify Payment & Fulfill
app.post('/api/payment/razorpay/verify', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  try {
    // Fetch user email for receipt email
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    // Move cart to purchased_tests and clear cart
    const { data: cartItems } = await supabase
      .from('cart')
      .select('mock_test_id')
      .eq('user_id', userId);

    if (cartItems && cartItems.length > 0) {
      await supabase
        .from('purchased_tests')
        .insert(cartItems.map((item) => ({ user_id: userId, mock_test_id: item.mock_test_id })));

      await supabase.from('cart').delete().eq('user_id', userId);
    }

    // Send success email
    if (user?.email) {
      const mailOptions = {
        from: `"TechMocks" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Payment Successful – Your Mock Tests are Unlocked! 🎉',
        text: `Hello ${user.name || 'User'},

Thank you for your purchase on TechMocks!

Your payment of ₹${(
          cartItems.reduce((s, i) => s + i.price, 0) || 0
        ).toFixed(2)} via UPI has been successfully processed.

All mock tests in your cart are now unlocked and available in your profile.

Keep practicing and ace your interviews!

Best regards,
The TechMocks Team
https://www.techmocks.com`,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #27ae60;">Payment Successful! 🎉</h2>
            <p>Hello <strong>${user.name || 'User'}</strong>,</p>
            <p>Thank you for your purchase on <strong>TechMocks</strong>!</p>
            <p>Your UPI payment of <strong>₹${(
              cartItems.reduce((s, i) => s + i.price, 0) || 0
            ).toFixed(2)}</strong> has been successfully processed.</p>
            <p>All mock tests in your cart are now <strong>unlocked</strong> and ready to attempt.</p>
            <div style="text-align:center; margin:30px 0;">
              <a href="https://www.techmocks.com" style="background:#3399cc; color:white; padding:12px 24px; text-decoration:none; border-radius:6px;">Go to Dashboard</a>
            </div>
            <p>Keep up the great work!</p>
            <hr style="border-top:1px solid #eee; margin:30px 0;" />
            <p style="color:#7f8c8d; font-size:14px; text-align:center;">
              Best regards,<br><strong>TechMocks Team</strong>
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Razorpay success email sent');
      } catch (emailErr) {
        console.error('Failed to send Razorpay success email:', emailErr);
      }
    }

    res.json({ message: 'Payment verified and order fulfilled' });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});
// User: Add to Cart (UPDATED)
app.post('/api/user/cart/add', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { mockTestId, currency = 'INR' } = req.body; // Accept currency from frontend

  try {
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id, price, pricing_type')
      .eq('id', mockTestId)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    if (mockTest.pricing_type !== 'paid') {
      return res.status(400).json({ message: 'This test is free and cannot be added to cart' });
    }

    const { data: existingItem } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', mockTestId)
      .single();

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }

    const { data, error } = await supabase
      .from('cart')
      .insert([{
        user_id: userId,
        mock_test_id: mockTestId,
        price: mockTest.price,           // Base price in INR
        currency: currency.toUpperCase() // Store user's selected currency
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Item added to cart successfully', cartItem: data });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
});

// User: Remove from Cart
app.delete('/api/user/cart/remove/:mockTestId', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { mockTestId } = req.params;

  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('mock_test_id', mockTestId);

    if (error) throw error;

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
});

// User: Get Cart (UPDATED - include currency)
app.get('/api/user/cart', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('cart')
      .select('id, mock_test_id, price, currency, mock_tests(title, description, pricing_type, price)')
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ cart: data });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
});

// User: Clear Cart
app.delete('/api/user/cart/clear', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Cart cleared successfully', cart: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
});

// Admin: Edit Mock Test
app.put('/api/admin/edit-mock-test/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, category, timeLimit, questions, pricingType, price } = req.body;

  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .update({
        title,
        description,
        category,
        time_limit: timeLimit,
        questions,
        pricing_type: pricingType,
        price: pricingType === 'paid' ? Number(price) : 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    res.status(200).json({ message: 'Mock test updated successfully!', mockTest: data });
  } catch (error) {
    console.error('Error updating mock test:', error);
    res.status(500).json({ message: 'Error updating mock test', error: error.message });
  }
});

// Fetch All Mock Tests
app.get('/api/admin/mock-tests', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({ message: 'Error fetching mock tests', error: error.message });
  }
});

// Fetch Test Details for Mock Test
app.get('/api/mock-test/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ message: 'Error fetching test', error: error.message });
  }
});

// Fetch User Submission for a Specific Mock Test
app.get('/api/mock-test/:id/submission', verifyUser, async (req, res) => {
  const { id } = req.params; // mockTestId
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .eq('mock_test_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'No submission found for this test' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
  }
});

// Change Password
app.put('/api/user/change-password', verifyUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
});

// Fetch User Profile
app.get('/api/user/profile', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch purchased tests with mock test details
    const { data: purchasedTests, error: purchasedError } = await supabase
      .from('purchased_tests')
      .select(`
        mock_test_id,
        mock_tests (
          id,
          title,
          description,
          category,
          pricing_type,
          time_limit,
          questions
        )
      `)
      .eq('user_id', userId);

    if (purchasedError) {
      throw purchasedError;
    }

    // Transform and handle empty or missing data
    const transformedPurchasedTests = (purchasedTests || []).map(test => ({
      _id: test.mock_test_id,
      id: test.mock_tests.id, // Include mock_tests.id for consistency
      title: test.mock_tests.title || 'Untitled Test',
      description: test.mock_tests.description || 'No description available',
      category: test.mock_tests.category || 'Uncategorized',
      pricingType: test.mock_tests.pricing_type || 'free', // Default to 'free' if missing
      timeLimit: test.mock_tests.time_limit || 10, // Default to 10 minutes if missing
      questions: test.mock_tests.questions || [],
    }));

    res.status(200).json({
      name: user.name,
      email: user.email,
      purchasedTests: transformedPurchasedTests,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
});

// Update User Profile
app.put('/api/user/profile', verifyUser, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('name, email')
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: data,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Fetch All Submissions for User
app.get('/api/submissions', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('mock_test_id, answers, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
});

// Admin: Get All Mock Tests (Grouped by Category)
app.get('/api/admin/get-all-mocks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('id, title, description, category, pricing_type, price, time_limit');

    if (error) throw error;

    const groupedData = data.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push({
        id: test.id,
        title: test.title,
        description: test.description,
        pricingType: test.pricing_type,
        price: test.price,
        timeLimit: test.time_limit,
      });
      return acc;
    }, {});

    res.status(200).json(groupedData);
  } catch (error) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({ message: 'Error fetching mock tests', error: error.message });
  }
});

// Admin: Delete Mock Test
app.delete('/api/admin/mock-tests/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id')
      .eq('id', id)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    // Delete related cart items
    await supabase.from('cart').delete().eq('mock_test_id', id);

    // Delete related purchased tests
    await supabase.from('purchased_tests').delete().eq('mock_test_id', id);

    // Delete related submissions
    await supabase.from('submissions').delete().eq('mock_test_id', id);

    // Delete the mock test
    const { error } = await supabase.from('mock_tests').delete().eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Mock test deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock test:', error);
    res.status(500).json({ message: 'Error deleting mock test', error: error.message });
  }
});

// Reset Password Route
app.put('/api/auth/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Check if OTP is verified for this email
    const storedOtp = otpStorage[email];
    if (!storedOtp || !storedOtp.verified) {
      return res.status(400).json({ message: 'Please verify OTP before resetting password' });
    }

    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (error) throw error;

    // Clear OTP storage for this email
    delete otpStorage[email];

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// Admin: Get All Users
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, created_at, profile_image');

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Transform data to match frontend expectations
    const transformedUsers = data.map(user => ({
      _id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role || 'user',
      isActive: user.is_active !== undefined ? user.is_active : true,
      createdAt: user.created_at,
      profileImage: user.profile_image || '',
    }));

    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error('Unexpected error fetching users:', error);
    res.status(500).json({ message: 'Unexpected error fetching users', error: error.message });
  }
});

// Admin: Update User
app.put('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, name, email, role, is_active, created_at, profile_image')
      .single();

    if (error) throw error;

    const transformedUser = {
      _id: data.id,
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      isActive: data.is_active,
      createdAt: data.created_at,
      profileImage: data.profile_image || '',
    };

    res.status(200).json({
      message: 'User updated successfully',
      user: transformedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Admin: Delete User
app.delete('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Admin: Get All Purchased Tests with Filter and Sort
app.get('/api/admin/purchased-tests', verifyAdmin, async (req, res) => {
  try {
    const { category, sortBy = 'purchased_at', sortOrder = 'desc', userEmail } = req.query;

    let query = supabase
      .from('purchased_tests')
      .select(`
        id,
        user_id,
        mock_test_id,
        purchased_at,
        users (name, email),
        mock_tests (title, category, pricing_type, price)
      `);

    // Apply filters
    if (category) {
      query = query.eq('mock_tests.category', category);
    }
    if (userEmail) {
      query = query.ilike('users.email', `%${userEmail}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching purchased tests:', error);
      return res.status(500).json({ message: 'Error fetching purchased tests', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Transform data to match frontend expectations
    const transformedPurchasedTests = data.map(purchase => ({
      id: purchase.id,
      userName: purchase.users?.name || 'Unknown',
      userEmail: purchase.users?.email || 'N/A',
      mockTestTitle: purchase.mock_tests?.title || 'Untitled Test',
      category: purchase.mock_tests?.category || 'Uncategorized',
      pricingType: purchase.mock_tests?.pricing_type || 'free',
      price: purchase.mock_tests?.price || 0,
      purchaseDate: purchase.purchased_at,
    }));

    res.status(200).json(transformedPurchasedTests);
  } catch (error) {
    console.error('Unexpected error fetching purchased tests:', error);
    res.status(500).json({ message: 'Unexpected error fetching purchased tests', error: error.message });
  }
});

// Admin: Get All Submissions
app.get('/api/admin/submissions', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        user_id,
        mock_test_id,
        answers,
        created_at,
        users (name, email),
        mock_tests (title, category)
      `);

    if (error) {
      console.error('Error fetching submissions:', error);
      return res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Transform data to match frontend expectations
    const transformedSubmissions = data.map(submission => ({
      id: submission.id,
      userName: submission.users?.name || 'Unknown',
      userEmail: submission.users?.email || 'N/A',
      mockTestTitle: submission.mock_tests?.title || 'Untitled Test',
      category: submission.mock_tests?.category || 'Uncategorized',
      mock_test_id: submission.mock_test_id,
      answers: submission.answers || {},
      created_at: submission.created_at,
    }));

    res.status(200).json(transformedSubmissions);
  } catch (error) {
    console.error('Unexpected error fetching submissions:', error);
    res.status(500).json({ message: 'Unexpected error fetching submissions', error: error.message });
  }
});

// Admin: Delete Submission
app.delete('/api/admin/submissions/:submissionId', verifyAdmin, async (req, res) => {
  const { submissionId } = req.params;

  try {
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('id')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId);

    if (error) throw error;

    res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ message: 'Error deleting submission', error: error.message });
  }
});

// <<<<<<<<<<---------   USER RANK & BADGE SYSTEM     -------->>>>>>>>

// Middleware to update user rank based on points
const updateUserRank = async (userId, pointsToAdd) => {
  try {
    const { data: currentRank, error } = await supabase
      .from('user_ranks')
      .select('points')
      .eq('user_id', userId)
      .single();

    let newPoints = pointsToAdd;
    if (currentRank) {
      newPoints += currentRank.points;
    }

    let rank = 'Beginner';
    if (newPoints >= 1000) rank = 'Master';
    else if (newPoints >= 500) rank = 'Expert';
    else if (newPoints >= 200) rank = 'Advanced';
    else if (newPoints >= 50) rank = 'Intermediate';

    const { error: updateError } = await supabase
      .from('user_ranks')
      .upsert({
        user_id: userId,
        rank,
        points: newPoints,
        updated_at: new Date()
      });

    if (updateError) throw updateError;

    return { rank, points: newPoints };
  } catch (error) {
    console.error('Error updating user rank:', error);
    throw error;
  }
};

// Award badge to user
const awardBadge = async (userId, badgeName, badgeDescription, badgeIcon) => {
  try {
    const { data: existingBadge, error: checkError } = await supabase
      .from('badges')
      .select('id')
      .eq('user_id', userId)
      .eq('name', badgeName)
      .single();

    if (existingBadge) return null; // Badge already awarded

    const { data, error } = await supabase
      .from('badges')
      .insert({
        user_id: userId,
        name: badgeName,
        description: badgeDescription,
        icon: badgeIcon,
        earned_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
};

// Test Submission, Badges and Awards, Email Notification after Submission
app.post('/api/mock-test/:id/submit', verifyUser, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  let correctAnswers = 0;
  let totalQuestions = 0;
  let accuracy = 0;
  let pointsEarned = 0;

  try {
    // Fetch mock test with title included
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id, title, questions')
      .eq('id', id)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    totalQuestions = mockTest.questions.length;

    // Calculate score
    mockTest.questions.forEach((question, index) => {
      const userAnswer = answers[index.toString()];
      if (userAnswer && userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()) {
        correctAnswers++;
      }
    });

    accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    pointsEarned = correctAnswers * 10;

    // Save submission
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', id)
      .single();

    let submission;
    if (existingSubmission) {
      const { data, error } = await supabase
        .from('submissions')
        .update({ answers, created_at: new Date() })
        .eq('id', existingSubmission.id)
        .select()
        .single();
      if (error) throw error;
      submission = data;
    } else {
      const { data, error } = await supabase
        .from('submissions')
        .insert([{ user_id: userId, mock_test_id: id, answers }])
        .select()
        .single();
      if (error) throw error;
      submission = data;
    }

    // Award points and badges
    await updateUserRank(userId, pointsEarned);

    if (accuracy >= 80) {
      await awardBadge(userId, 'High Achiever', 'Scored 80% or above on a mock test', '🏆');
    }
    if (correctAnswers === totalQuestions) {
      await awardBadge(userId, 'Perfect Score', 'Achieved 100% on a mock test', '🌟');
    }

    const { count, error: countError } = await supabase
      .from('submissions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    if (countError) throw countError;
    if (count >= 5) {
      await awardBadge(userId, 'Dedicated Learner', 'Completed 5 mock tests', '📚');
    }

    // ====================== SEND EMAIL ======================
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (!userError && user?.email) {
      const userName = user.name;
      const testTitle = mockTest.title;

      const mailOptions = {
        from: `"TechMocks" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your Results: ${testTitle}`,
        text: `Hello ${userName},

You've successfully completed the mock test: ${testTitle}

Your Performance:
• Correct Answers: ${correctAnswers} out of ${totalQuestions}
• Accuracy: ${accuracy}%
• Points Earned: ${pointsEarned}

Keep practicing and improving! 🚀

Best regards,
The TechMocks Team
https://www.techmocks.com`.trim(),

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #ffffff;">
            <h2 style="color: #2c3e50;">Hello ${userName},</h2>
            <p>You've successfully completed the mock test:</p>
            <h3 style="color: #3498db;">${testTitle}</h3>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 10px 0; font-size: 16px;"><strong>Correct Answers:</strong> ${correctAnswers} / ${totalQuestions}</p>
              <p style="margin: 10px 0; font-size: 18px; color: #27ae60;"><strong>Accuracy: ${accuracy}%</strong></p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>Points Earned:</strong> ${pointsEarned}</p>
            </div>

            <p>Keep up the great work! You're doing amazing. 💪</p>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />

            <p style="color: #7f8c8d; font-size: 14px; text-align: center;">
              Best regards,<br>
              <strong>The TechMocks Team</strong><br>
              <a href="https://www.techmocks.com" style="color: #3498db; text-decoration: none;">www.techmocks.com</a>
            </p>
          </div>
        `.trim(),
      };

      // Separate try-catch so email failure NEVER breaks submission
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Score email sent Successfully`);
      } catch (emailError) {
        console.error('Failed to Send Email', emailError);
      }
    }

    // ====================== SUCCESS RESPONSE ======================
    res.status(201).json({
      message: 'Submission successful',
      score: {
        correctAnswers,
        totalQuestions,
        accuracy,
        pointsEarned,
      },
      submission,
    });

  } catch (error) {
    console.error('Error during submission:', error);
    res.status(500).json({
      message: 'Failed to submit test',
      error: error.message,
    });
  }
});

// Fetch user badges
app.get('/api/user/badges', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('badges')
      .select('name, description, icon, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Failed to fetch badges', error: error.message });
  }
});

// Fetch user rank
app.get('/api/user/rank', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('user_ranks')
      .select('rank, points')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.status(200).json(data || { rank: 'Beginner', points: 0 });
  } catch (error) {
    console.error('Error fetching rank:', error);
    res.status(500).json({ message: 'Failed to fetch rank', error: error.message });
  }
});

// Generate Mock Test Automatically
app.post('/api/admin/generate-mock-test', verifyUser, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

  const { title, description, category, timeLimit, numQuestions, pricingType, price } = req.body;

  // Basic validation
  if (!title || !category || !timeLimit || !numQuestions || numQuestions < 1) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    // Fetch all mock tests in the same category
    const { data: existingTests, error: fetchError } = await supabase
      .from('mock_tests')
      .select('questions')
      .eq('category', category)
      // Optional: exclude a test with same title to avoid self-duplication during edits
      .neq('title', title);

    if (fetchError) throw fetchError;

    if (!existingTests || existingTests.length === 0) {
      return res.status(400).json({
        message: `No existing mock tests found in category "${category}"`
      });
    }

    const questionMap = new Map(); // key: questionText (normalized), value: question object

    existingTests.forEach(test => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach(q => {
          if (q && q.questionText) {
            // Normalize question text: trim and lowercase for better matching
            const key = q.questionText.trim().toLowerCase();

            // Only add if not already present (keeps first occurrence)
            if (!questionMap.has(key)) {
              questionMap.set(key, q);
            }
          }
        });
      }
    });

    const uniqueQuestions = Array.from(questionMap.values());

    if (uniqueQuestions.length < numQuestions) {
      return res.status(400).json({
        message: `Only ${uniqueQuestions.length} unique questions available in "${category}". Requested: ${numQuestions}.`,
        available: uniqueQuestions.length,
        requested: numQuestions
      });
    }

    // Shuffle and select N unique questions
    const shuffled = [...uniqueQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, numQuestions);

    // Insert the new mock test
    const { data, error: insertError } = await supabase
      .from('mock_tests')
      .insert({
        title,
        description: description || null,
        category,
        time_limit: Number(timeLimit),
        questions: selectedQuestions,
        pricing_type: pricingType || 'free',
        price: pricingType === 'paid' ? Number(price) || 0 : 0,
        created_by: req.user.id,
        active: true
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique violation (e.g., title already exists)
        return res.status(409).json({ message: 'A mock test with this title already exists.' });
      }
      throw insertError;
    }

    res.json({
      message: 'Mock test generated successfully with unique questions!',
      test: data
    });

  } catch (err) {
    console.error('Error generating mock test:', err);
    res.status(500).json({ message: 'Failed to generate mock test. Please try again.' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));