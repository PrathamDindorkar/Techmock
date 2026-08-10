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

// Allowed currencies
const ALLOWED_CURRENCIES = ['EUR', 'GBP', 'INR', 'USD'];

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY is missing in .env file!');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // or a more recent one like '2025-12-15' if you want the latest features
});

const app = express();
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

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://techmock-dva6.vercel.app', 'https://www.techmocks.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

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
    const {
      title,
      description,
      category,
      timeLimit,
      questions,
      pricingType,
      prices = {},   // ← NEW: object, not a single price number
    } = req.body;

    console.log('Incoming Mock Test Data:', req.body);

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid title and at least one question.' });
    }

    if (!pricingType || !['free', 'paid'].includes(pricingType)) {
      return res.status(400).json({ message: 'Invalid pricingType. Allowed values: free, paid.' });
    }

    if (pricingType === 'paid') {
      if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0) {
        return res.status(400).json({ message: 'Paid test requires at least one price in prices object.' });
      }
      // Validate each currency price
      for (const [curr, amt] of Object.entries(prices)) {
        if (typeof amt !== 'number' || amt <= 0) {
          return res.status(400).json({ message: `Invalid price for ${curr}: must be a positive number.` });
        }
      }
      // INR is required
      if (!prices.INR || prices.INR <= 0) {
        return res.status(400).json({ message: 'INR price is required for paid tests.' });
      }
    }

    const { data, error } = await supabase
      .from('mock_tests')
      .insert([{
        title,
        description,
        category,
        time_limit: timeLimit,
        questions: questions,          // stored as JSONB
        pricing_type: pricingType,
        prices: pricingType === 'paid' ? prices : {},  // ← stored as JSONB object
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

// Apply Coupon - Validate and return discount
app.post('/api/user/apply-coupon', verifyUser, async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Valid coupon code is required' });
  }

  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('code, discount')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();  // Use maybeSingle instead of single to avoid error on no rows

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: 'Server error while validating coupon' });
    }

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    // You can add more checks here in future (expiry date, usage limit, etc.)
    // For now - just return the discount value

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount
      }
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ==================== COUPON MANAGEMENT (ADMIN) ====================

// GET all coupons (for admin list)
app.get('/api/admin/coupons', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// POST - Create new coupon
app.post('/api/admin/coupons', verifyAdmin, async (req, res) => {
  const { code, discount } = req.body;

  if (!code || !discount) {
    return res.status(400).json({ message: 'Code and discount percentage are required' });
  }

  const discountNum = Number(discount);
  if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
    return res.status(400).json({ message: 'Discount must be a number between 1 and 100' });
  }

  try {
    // Check if code already exists (case-insensitive)
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ message: 'This coupon code already exists' });
    }

    const { error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        discount: discountNum,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (err) {
    console.error('Error creating coupon:', err);
    res.status(500).json({ message: 'Failed to create coupon' });
  }
});

// DELETE - Remove coupon
app.delete('/api/admin/coupons/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

// Stripe: Create PaymentIntent
// Stripe: Create PaymentIntent (UPDATED - DYNAMIC CURRENCY)
// Stripe: Create PaymentIntent (Fixed to GBP for PayPal support)
app.post('/api/payment/create-intent', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { currency = 'inr', coupon_code } = req.body; // 'inr', 'gbp', 'eur', 'usd'

  try {
    // Fetch cart items
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('price')
      .eq('user_id', userId);

    if (error) throw error;
    if (!cartItems?.length) return res.status(400).json({ message: 'Cart is empty' });

    let total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Apply coupon if provided
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('discount')
        .eq('code', coupon_code.toUpperCase())
        .single();

      if (coupon) {
        total = total * (1 - coupon.discount / 100);
      }
    }

    const finalAmount = Math.max(0, Math.round(total * 100)); // to smallest unit

    if (finalAmount < 50) { // Stripe minimum ~0.50 in most currencies
      return res.status(400).json({ message: 'Amount too small for payment' });
    }

    // Map frontend currency to Stripe-supported lowercase
    const stripeCurrency = currency.toLowerCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: stripeCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: { user_id: userId.toString(), coupon_code: coupon_code || '' },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Create intent error:', error);
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

  // Acknowledge immediately
  res.json({ received: true });

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.user_id;

    if (!userId) {
      console.error('No user_id in metadata');
      return;
    }

    let userName = 'User';
    let userEmail = '';
    let purchasedTestTitles = [];
    let totalAmountINR = 0;
    let cartItems = [];

    try {
      // 1. Fetch user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (!userError && userData) {
        userName = userData.name || 'User';
        userEmail = userData.email || '';
      }

      // 2. Fetch items
      const { data: purchased, error: purchasedError } = await supabase
        .from('purchased_tests')
        .select('mock_test_id, mock_tests(title, price)')
        .eq('user_id', userId)
        .order('id', { ascending: false })
        .limit(10);

      cartItems = purchased || [];

      if (cartItems.length === 0) {
        const { data: fallbackCart } = await supabase
          .from('cart')
          .select('mock_test_id, mock_tests(title, price)')
          .eq('user_id', userId);
        if (fallbackCart) cartItems = fallbackCart;
      }

      if (cartItems.length === 0) {
        console.log('No items found for user:', userId);
        return;
      }

      purchasedTestTitles = cartItems.map(item => item.mock_tests?.title || 'Untitled Test');
      totalAmountINR = cartItems.reduce((sum, item) => sum + (item.mock_tests?.price || 0), 0);

      // 3. Fulfill order
      const purchasedTests = cartItems.map(item => ({
        user_id: userId,
        mock_test_id: item.mock_test_id,
      }));

      await supabase.from('purchased_tests').upsert(purchasedTests, {
        onConflict: 'user_id, mock_test_id',
        ignoreDuplicates: true,
      });

      await supabase.from('cart').delete().eq('user_id', userId);

      console.log(`Order fulfilled for user ${userId}`);

      // 4. Send email
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

The following mock tests are now unlocked:
${purchasedTestTitles.map(t => `• ${t}`).join('\n')}

Best regards,
The TechMocks Team
https://www.techmocks.com`,

          html: `Hello,
          Thanks for Purchasing the Test. The Mock Test has been unlocked`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Stripe success email sent to ${userEmail}`);
      }
    } catch (err) {
      console.error('Error processing Stripe webhook:', err);
    }
  }
});

// ||||||||||||||||| RAZORPAY ENDPOINT |||||||||||||||||||||||
// Razorpay: Create Order
app.post('/api/payment/razorpay/create-order', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { amount, coupon_code } = req.body;
 
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
 
  try {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('price, item_type')
      .eq('user_id', userId);
 
    if (error) throw error;
 
    let originalTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    let finalAmount = originalTotal;
 
    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('discount')
        .eq('code', coupon_code.toUpperCase())
        .single();
 
      if (couponError || !coupon) return res.status(400).json({ message: 'Invalid coupon' });
      finalAmount = Math.round(originalTotal * (1 - coupon.discount / 100));
    }
 
    if (finalAmount !== amount) return res.status(400).json({ message: 'Amount mismatch' });
 
    const shortId = Math.random().toString(36).substring(2, 10);
    const receipt = `rec_${shortId}_${Date.now().toString().slice(-8)}`;
 
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt,
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
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, coupon_code } = req.body;
 
  const crypto = require('crypto');
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
 
  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }
 
  try {
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();
 
    // Fetch full cart with both item types
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select(`
        mock_test_id,
        interview_id,
        item_type,
        mock_tests!left ( title ),
        interviews!left ( title )
      `)
      .eq('user_id', userId);
 
    if (cartError) throw cartError;
 
    const mockTestItems  = cartItems.filter(i => i.item_type === 'mock_test'  && i.mock_test_id);
    const interviewItems = cartItems.filter(i => i.item_type === 'interview'  && i.interview_id);
 
    // Fulfill mock tests — insert into purchased_tests with mock_test_id set
    if (mockTestItems.length > 0) {
      const purchases = mockTestItems.map(i => ({
        user_id:      userId,
        mock_test_id: i.mock_test_id,
        interview_id: null,
      }));
      const { error: uErr } = await supabase
        .from('purchased_tests')
        .upsert(purchases, { onConflict: 'user_id, mock_test_id', ignoreDuplicates: true });
      if (uErr) throw uErr;
    }
 
    // Fulfill interviews — insert into purchased_tests with interview_id set
    if (interviewItems.length > 0) {
      const purchases = interviewItems.map(i => ({
        user_id:      userId,
        mock_test_id: null,
        interview_id: i.interview_id,
      }));
      // Use ignoreDuplicates via the partial unique index
      const { error: iErr } = await supabase
        .from('purchased_tests')
        .insert(purchases);
      // Ignore duplicate violations gracefully
      if (iErr && !iErr.message?.includes('duplicate')) throw iErr;
    }
 
    // Clear entire cart
    await supabase.from('cart').delete().eq('user_id', userId);
 
    // Send confirmation email
    if (user?.email) {
      const allTitles = [
        ...mockTestItems.map(i => i.mock_tests?.title  || 'Mock Test'),
        ...interviewItems.map(i => i.interviews?.title || 'Interview'),
      ];
 
      await transporter.sendMail({
        from: `"TechMocks" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Payment Successful – Your purchases are now unlocked! 🎉',
        text: `Hello ${user.name || 'User'},\n\nYour payment was successful!\n\nUnlocked:\n${allTitles.map(t => `• ${t}`).join('\n')}\n\nBest regards,\nThe TechMocks Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c6af7;">Payment Successful! 🎉</h2>
            <p>Hello ${user.name || 'User'},</p>
            <p>The following items are now unlocked for you:</p>
            <ul>${allTitles.map(t => `<li style="margin: 8px 0; font-weight: 500;">${t}</li>`).join('')}</ul>
            <p style="margin-top: 24px;">
              <a href="https://www.techmocks.com/hello"
                 style="background:#7c6af7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                Go to Dashboard →
              </a>
            </p>
          </div>
        `,
      });
    }
 
    res.json({ message: 'Payment verified and order fulfilled' });
  } catch (error) {
    console.error('[Razorpay Verify] Error:', error.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// User: Add to Cart (UPDATED)
app.post('/api/user/cart/add', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { mockTestId, currency = 'INR' } = req.body;
  const selectedCurrency = currency.toUpperCase().trim();

  try {
    const { data: mockTest, error: mockError } = await supabase
      .from('mock_tests')
      .select('id, pricing_type, prices')
      .eq('id', mockTestId)
      .single();

    if (mockError || !mockTest) return res.status(404).json({ message: 'Mock test not found' });

    if (mockTest.pricing_type !== 'paid') {
      return res.status(400).json({ message: 'This test is free — cannot add to cart' });
    }

    const prices = mockTest.prices || {};

    let finalPrice = prices[selectedCurrency];

    if (!finalPrice || finalPrice <= 0) {
      // Strict fallback: only within allowed currencies
      
      if (!ALLOWED_CURRENCIES.includes(selectedCurrency)) {
        return res.status(400).json({ message: `Currency ${selectedCurrency} not supported` });
      }
      finalPrice = prices.INR || prices.USD || 0;
      if (finalPrice <= 0) {
        return res.status(400).json({ message: 'No valid price in supported currencies' });
      }
      console.log(`Fallback applied to ${finalPrice} for ${mockTestId}`);
    }

    const { data: existing } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', mockTestId)
      .maybeSingle();

    if (existing) return res.status(409).json({ message: 'Already in cart' });

    const { data: newItem, error: insertError } = await supabase
      .from('cart')
      .insert([{
        user_id: userId,
        mock_test_id: mockTestId,
        price: finalPrice,
        currency: selectedCurrency,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(200).json({ message: 'Added to cart', cartItem: newItem });
  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ message: 'Failed to add to cart', error: err.message });
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
      .select(`
        id,
        mock_test_id,
        interview_id,
        item_type,
        price,
        currency,
        mock_tests!left (
          title,
          description,
          pricing_type
        ),
        interviews!left (
          title,
          description,
          pricing_type,
          job_role,
          duration_minutes
        )
      `)
      .eq('user_id', userId);
 
    if (error) throw error;
    res.status(200).json({ cart: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// add a paid interview to the cart
app.post('/api/user/cart/add-interview', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { interviewId, currency = 'INR' } = req.body;
  const selectedCurrency = currency.toUpperCase().trim();
 
  try {
    const { data: interview, error: ivErr } = await supabase
      .from('interviews')
      .select('id, pricing_type, prices')
      .eq('id', interviewId)
      .single();
 
    if (ivErr || !interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.pricing_type !== 'paid') {
      return res.status(400).json({ message: 'This interview is free — no purchase needed' });
    }
 
    const prices = interview.prices || {};
    let finalPrice = prices[selectedCurrency];
    if (!finalPrice || finalPrice <= 0) {
      finalPrice = prices.INR || prices.USD || 0;
      if (finalPrice <= 0) return res.status(400).json({ message: 'No valid price found' });
    }
 
    // Already in cart?
    const { data: existing } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .eq('interview_id', interviewId)
      .eq('item_type', 'interview')
      .maybeSingle();
 
    if (existing) return res.status(409).json({ message: 'Interview already in cart' });
 
    // Already purchased?
    const { data: purchased } = await supabase
      .from('purchased_tests')
      .select('id')
      .eq('user_id', userId)
      .eq('interview_id', interviewId)
      .maybeSingle();
 
    if (purchased) return res.status(409).json({ message: 'Interview already purchased' });
 
    const { data: newItem, error: insertError } = await supabase
      .from('cart')
      .insert([{
        user_id:      userId,
        interview_id: interviewId,
        mock_test_id: null,
        item_type:    'interview',
        price:        finalPrice,
        currency:     selectedCurrency,
        created_at:   new Date().toISOString(),
      }])
      .select()
      .single();
 
    if (insertError) throw insertError;
    res.status(200).json({ message: 'Interview added to cart', cartItem: newItem });
  } catch (err) {
    console.error('Cart add interview error:', err);
    res.status(500).json({ message: 'Failed to add interview to cart', error: err.message });
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
  const {
    title,
    description,
    category,
    timeLimit,
    questions,
    pricingType,
    prices,               // ← NEW – object { INR: ..., USD: ... }
  } = req.body;

  try {
    const updatePayload = {
      title,
      description,
      category,
      time_limit: timeLimit,
      questions,
      pricing_type: pricingType,
    };

    if (pricingType === 'paid') {
      if (!prices || Object.keys(prices).length === 0) {
        return res.status(400).json({ message: 'Paid test requires prices object with at least one currency' });
      }
      // Optional validation
      for (const [curr, amt] of Object.entries(prices)) {
        if (typeof amt !== 'number' || amt <= 0) {
          return res.status(400).json({ message: `Invalid price for ${curr}` });
        }
      }
      updatePayload.prices = prices;
    } else {
      updatePayload.prices = {};   // clear prices for free tests
    }

    const { data, error } = await supabase
      .from('mock_tests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    res.status(200).json({ message: 'Mock test updated', mockTest: data });
  } catch (error) {
    console.error('Error updating mock test:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch All Mock Tests
app.get('/api/admin/mock-tests', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select(`
        id,
        title,
        description,
        category,
        pricing_type,
        prices,
        time_limit,
        questions,
        created_at,
        active,
        created_by
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Return questions as-is (JSONB array from Supabase is already parsed).
    // Compute questionCount as a convenience field for any future use.
    const formatted = data.map(test => ({
      ...test,
      questionCount: Array.isArray(test.questions) ? test.questions.length : 0,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching admin mock tests:', error);
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
      .select('name, email, role')
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
      role: user.role || 'user',
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
      .select(`
        id,
        title,
        description,
        category,
        pricing_type,
        prices,
        time_limit,
        questions,
        created_at,
        active
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(200).json({});
    }

    const groupedData = data.reduce((acc, test) => {
      const category = test.category || 'Uncategorized';

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        id: test.id,
        title: test.title,
        description: test.description,
        pricingType: test.pricing_type,
        prices: test.prices || {},
        timeLimit: test.time_limit,
        questions: test.questions?.length || 0,   // only count — safer & smaller payload
        // createdAt: test.created_at,            // add back only if frontend actually needs it
      });

      return acc;
    }, {});

    // Optional: sort categories alphabetically
    const sortedGrouped = {};
    Object.keys(groupedData)
      .sort()
      .forEach(key => {
        sortedGrouped[key] = groupedData[key];
      });

    res.status(200).json(sortedGrouped);
  } catch (error) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({
      message: 'Error fetching mock tests',
      error: error.message
    });
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
        mock_tests!left(
          title,
          category,
          pricing_type,
          prices          
        )
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
      return res.status(500).json({
        message: 'Error fetching purchased tests',
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Transform data – now safely using prices
    const transformedPurchasedTests = data.map(purchase => ({
      id: purchase.id,
      userName: purchase.users?.name || 'Unknown',
      userEmail: purchase.users?.email || 'N/A',
      mockTestTitle: purchase.mock_tests?.title || 'Untitled Test',
      category: purchase.mock_tests?.category || 'Uncategorized',
      pricingType: purchase.mock_tests?.pricing_type || 'free',

      // Removed invalid .price – use prices instead
      prices: purchase.mock_tests?.prices || {},  // full prices object for flexibility

      priceDisplay: purchase.mock_tests?.pricing_type === 'free'
        ? 'FREE'
        : purchase.mock_tests?.prices && Object.keys(purchase.mock_tests.prices).length > 0
          ? // Try INR first, then any other currency
          purchase.mock_tests.prices.INR
            ? `₹${purchase.mock_tests.prices.INR}`
            : `${Object.keys(purchase.mock_tests.prices)[0]} ${Object.values(purchase.mock_tests.prices)[0]}`
          : purchase.mock_tests?.pricing_type === 'paid'
            ? 'PAID (price missing)'
            : 'N/A',

      purchaseDate: purchase.purchased_at,
    }));

    res.status(200).json(transformedPurchasedTests);
  } catch (error) {
    console.error('Unexpected error fetching purchased tests:', error);
    res.status(500).json({
      message: 'Unexpected error fetching purchased tests',
      error: error.message
    });
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
  const { answers, autoSubmitted, reason } = req.body;
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
      console.error('Mock test fetch error:', mockTestError);
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

    // Save submission - check existing first
    const { data: existingSubmission, error: existingError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', id)
      .maybeSingle();

    console.log('Existing submission check:', { existingSubmission, existingError });

    let submission;

    // Store metadata about auto-submission in the answers JSON itself
    const submissionAnswers = {
      ...answers,
      _meta: {
        autoSubmitted: autoSubmitted || false,
        reason: reason || null,
        submittedAt: new Date().toISOString()
      }
    };

    if (existingSubmission) {
      console.log('Updating existing submission:', existingSubmission.id);
      const { data, error } = await supabase
        .from('submissions')
        .update({
          answers: submissionAnswers,
          created_at: new Date().toISOString()
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      if (error) {
        console.error('Update submission error:', error);
        throw error;
      }
      submission = data;
    } else {
      console.log('Creating new submission');
      const { data, error } = await supabase
        .from('submissions')
        .insert([{
          user_id: userId,
          mock_test_id: id,
          answers: submissionAnswers
        }])
        .select()
        .single();

      if (error) {
        console.error('Insert submission error:', error);
        throw error;
      }
      submission = data;
    }

    console.log('Submission saved successfully:', submission.id);

    // Award points and badges - wrap each in try-catch
    try {
      if (typeof updateUserRank === 'function') {
        await updateUserRank(userId, pointsEarned);
        console.log('User rank updated');
      }
    } catch (rankError) {
      console.error('Error updating user rank:', rankError);
    }

    try {
      if (typeof awardBadge === 'function') {
        if (accuracy >= 80) {
          await awardBadge(userId, 'High Achiever', 'Scored 80% or above on a mock test', '🏆');
        }
        if (correctAnswers === totalQuestions) {
          await awardBadge(userId, 'Perfect Score', 'Achieved 100% on a mock test', '🌟');
        }
        console.log('Badges awarded based on performance');
      }
    } catch (badgeError) {
      console.error('Error awarding badges:', badgeError);
    }

    try {
      const { count, error: countError } = await supabase
        .from('submissions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (!countError && count >= 5 && typeof awardBadge === 'function') {
        await awardBadge(userId, 'Dedicated Learner', 'Completed 5 mock tests', '📚');
        console.log('Dedicated Learner badge awarded');
      }
    } catch (countBadgeError) {
      console.error('Error awarding count badge:', countBadgeError);
    }

    // ====================== SEND EMAIL ======================
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (!userError && user?.email) {
        const userName = user.name || 'Student';
        const testTitle = mockTest.title;
        const submissionNote = autoSubmitted ? `\n\nNote: This test was automatically submitted due to: ${reason}` : '';

        const mailOptions = {
          from: `"TechMocks" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Your Results: ${testTitle}`,
          text: `Hello ${userName},

You've successfully completed the mock test: ${testTitle}

Your Performance:
• Correct Answers: ${correctAnswers} out of ${totalQuestions}
• Accuracy: ${accuracy}%
• Points Earned: ${pointsEarned}${submissionNote}

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

              ${autoSubmitted ? `<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Note:</strong> This test was automatically submitted due to: ${reason}</p>
              </div>` : ''}

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

        if (typeof transporter !== 'undefined' && transporter.sendMail) {
          await transporter.sendMail(mailOptions);
          console.log('Score email sent successfully to:', user.email);
        } else {
          console.warn('Email transporter not configured - skipping email');
        }
      }
    } catch (emailError) {
      console.error('Failed to send email (non-fatal):', emailError);
    }

    // ====================== SUCCESS RESPONSE ======================
    console.log('Sending success response');
    return res.status(201).json({
      message: 'Submission successful',
      score: {
        correctAnswers,
        totalQuestions,
        accuracy,
        pointsEarned,
      },
      submission: {
        ...submission,
        // Don't expose the _meta in the response, keep it clean
        answers: answers
      },
      autoSubmitted: autoSubmitted || false,
      reason: reason || null
    });

  } catch (error) {
    console.error('Error during submission:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      message: 'Failed to submit test',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

  const {
    title,
    description,
    category,
    timeLimit,
    numQuestions,
    pricingType = 'free',
    prices = {},           // ← NEW: object like { INR: 49, USD: 4.99, ... }
  } = req.body;

  // Validation
  if (!title || !category || !timeLimit || !numQuestions || numQuestions < 1) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  if (pricingType === 'paid') {
    if (Object.keys(prices).length === 0) {
      return res.status(400).json({ message: 'Paid test must have at least one price in prices object' });
    }
    // Optional: validate currencies & values
    for (const [curr, amt] of Object.entries(prices)) {
      if (typeof amt !== 'number' || amt <= 0) {
        return res.status(400).json({ message: `Invalid price for ${curr}: must be positive number` });
      }
      // You can add allowed currencies list check here later
    }
  }

  try {
    // ... (your existing logic to collect & select questions remains the same)

    const { data, error: insertError } = await supabase
      .from('mock_tests')
      .insert({
        title,
        description: description || null,
        category,
        time_limit: Number(timeLimit),
        questions: selectedQuestions,
        pricing_type: pricingType,
        prices: pricingType === 'paid' ? prices : {},   // ← key change
        created_by: req.user.id,
        active: true
      })
      .select()
      .single();

    if (insertError) {
      // ... handle error
    }

    res.json({
      message: 'Mock test generated successfully!',
      test: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate mock test' });
  }
});

// ────────────────────────────────────────────────
//               COMMUNITY ENDPOINTS (FIXED FOR YOUR SCHEMA)
// ────────────────────────────────────────────────

// 1. Get all posts (includes counts and "my_reaction")
app.get('/api/community/posts', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  let currentUserId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      currentUserId = decoded.id;
    } catch (err) {
      console.log('Invalid token for guest view');
    }
  }

  try {
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        users!community_posts_user_id_fkey (
          name
        ),
        community_comments (id),
        community_reactions (user_id, reaction_type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const formattedPosts = posts.map(post => {
      const reactions = post.community_reactions || [];
      const likes = reactions.filter(r => r.reaction_type === 'like').length;
      const dislikes = reactions.filter(r => r.reaction_type === 'dislike').length;

      const myReaction = currentUserId
        ? reactions.find(r => r.user_id === currentUserId)?.reaction_type
        : null;

      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        userName: post.users?.name || 'Anonymous',
        commentCount: post.community_comments?.length || 0,
        likes,
        dislikes,
        myReaction
      };
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Post
app.post('/api/community/posts', verifyUser, async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: req.user.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        user_id,
        users!community_posts_user_id_fkey (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    res.status(201).json({
      ...data,
      userName: data.users?.name || 'Anonymous'
    });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. React (Like/Dislike Toggle)
app.post('/api/community/posts/:postId/react', verifyUser, async (req, res) => {
  const { postId } = req.params;
  const { type } = req.body;

  if (!['like', 'dislike'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "like" or "dislike"' });
  }

  try {
    const { data: existing } = await supabase
      .from('community_reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (existing) {
      if (existing.reaction_type === type) {
        // Remove if clicking the same button
        const { error } = await supabase
          .from('community_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Switch if clicking the other button
        const { error } = await supabase
          .from('community_reactions')
          .update({ reaction_type: type })
          .eq('id', existing.id);

        if (error) throw error;
      }
    } else {
      // Create new reaction
      const { error } = await supabase
        .from('community_reactions')
        .insert({
          post_id: postId,
          user_id: req.user.id,
          reaction_type: type
        });

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error reacting:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Comments for a post
app.get('/api/community/posts/:postId/comments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('community_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users!community_comments_user_id_fkey (
          name
        )
      `)
      .eq('post_id', req.params.postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const formattedComments = data.map(comment => ({
      ...comment,
      users: { name: comment.users?.name || 'Anonymous' }
    }));

    res.json(formattedComments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Post a Comment
app.post('/api/community/posts/:postId/comments', verifyUser, async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: req.params.postId,
        user_id: req.user.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        user_id,
        users!community_comments_user_id_fkey (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      throw error;
    }

    res.json({
      ...data,
      users: { name: data.users?.name || 'Anonymous' }
    });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Assign mock test to user + send email
app.post('/api/admin/assign-mock-test', verifyAdmin, async (req, res) => {
  const { userId, mockTestId } = req.body;

  if (!userId || !mockTestId) {
    return res.status(400).json({ message: 'userId and mockTestId are required' });
  }

  try {
    // 1. Check if already assigned
    const { data: existing } = await supabase
      .from('user_mock_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', mockTestId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'This mock test is already assigned to the user' });
    }

    // 2. Insert assignment
    const { error: assignError } = await supabase
      .from('user_mock_assignments')
      .insert({
        user_id: userId,
        mock_test_id: mockTestId,
        assigned_by: req.user.id,
      });

    if (assignError) throw assignError;

    // 3. Fetch user & mock test details for email
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    const { data: mock } = await supabase
      .from('mock_tests')
      .select('title, description, category, questions, time_limit, pricing_type')
      .eq('id', mockTestId)
      .single();

    if (!user?.email || !mock) {
      console.warn('Could not fetch user or mock details for email');
      return res.status(201).json({ message: 'Assignment created (email skipped)' });
    }

    // 4. Send nice email
    const questionCount = mock.questions?.length || 0;
    const directLink = `https://www.techmocks.com/mock-test/${mockTestId}`;

    const mailOptions = {
      from: `"TechMocks Admin" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `New Mock Test Assigned: ${mock.title}`,
      text: `Hello ${user.name || 'there'},

An administrator has assigned you a new mock test:

→ ${mock.title}
→ Category: ${mock.category || 'General'}
→ ${questionCount} questions
→ Time limit: ${mock.time_limit || '?'} minutes

Start the test here: ${directLink}

Good luck — you've got this! 🚀

Best regards,
TechMocks Team
https://www.techmocks.com`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af;">New Mock Test Assigned!</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>An administrator has just assigned you the following mock test:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af;">${mock.title}</h3>
            <p style="margin: 8px 0;"><strong>Category:</strong> ${mock.category || 'General'}</p>
            <p style="margin: 8px 0;"><strong>Questions:</strong> ${questionCount}</p>
            <p style="margin: 8px 0;"><strong>Time limit:</strong> ${mock.time_limit || '?'} minutes</p>
          </div>

          <p style="margin: 24px 0;">
            <a href="${directLink}" 
               style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Start Mock Test Now →
            </a>
          </p>

          <p style="color: #4b5563; font-size: 14px;">
            If the button doesn't work, copy-paste this link:<br>
            <a href="${directLink}">${directLink}</a>
          </p>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

          <p style="color: #6b7280; font-size: 13px; text-align: center;">
            This is an automated message from TechMocks<br>
            <a href="https://www.techmocks.com">www.techmocks.com</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Assignment email sent to ${user.email}`);

    res.status(201).json({ message: 'Mock test assigned successfully and email sent' });
  } catch (err) {
    console.error('Assign mock test error:', err);
    res.status(500).json({ message: 'Failed to assign mock test', error: err.message });
  }
});

// AI Interview Routes->

// ====================== INTERVIEW ROUTES ======================

// GET /api/interviews - Available interviews for users
app.get('/api/interviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('interviews')
      .select(`*, interview_questions (*)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
 
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Failed to fetch interviews', error: error.message });
  }
});

// POST /api/interviews - Admin creates interview (Updated)
app.post('/api/interviews', verifyAdmin, async (req, res) => {
  const {
    title, description, job_role, experience_level,
    duration_minutes = 30, questions,
    pricing_type = 'free', prices = {},
  } = req.body;

  if (!title || !job_role || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Title, job_role and questions array are required' });
  }

  // Pricing validation
  if (!['free', 'paid'].includes(pricing_type)) {
    return res.status(400).json({ message: 'pricing_type must be free or paid' });
  }

  let finalPrices = {};

  if (pricing_type === 'paid') {
    if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0) {
      return res.status(400).json({ message: 'Paid interview requires prices object' });
    }

    for (const [curr, amt] of Object.entries(prices)) {
      if (!ALLOWED_CURRENCIES.includes(curr)) {
        return res.status(400).json({ message: `Currency ${curr} not allowed. Allowed: ${ALLOWED_CURRENCIES.join(', ')}` });
      }
      if (typeof amt !== 'number' || amt <= 0) {
        return res.status(400).json({ message: `Invalid price for ${curr}` });
      }
    }

    // INR is mandatory for paid interviews (as per your existing pattern)
    if (!prices.INR || prices.INR <= 0) {
      return res.status(400).json({ message: 'INR price is required for paid interviews' });
    }

    finalPrices = prices;
  }

  try {
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        title,
        description,
        job_role,
        experience_level: experience_level || 'intermediate',
        duration_minutes,
        total_questions: questions.length,
        created_by: req.user.id,
        pricing_type,
        prices: finalPrices,
      })
      .select()
      .single();

    if (interviewError) throw interviewError;

    // Insert questions
    const questionsToInsert = questions.map((q, index) => ({
      interview_id: interview.id,
      question_text: q.question_text || q,
      question_type: q.question_type || 'behavioral',
      order_index: index,
    }));

    const { error: qError } = await supabase
      .from('interview_questions')
      .insert(questionsToInsert);

    if (qError) throw qError;

    res.status(201).json({ message: 'Interview created successfully', interview });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ message: 'Failed to create interview', error: error.message });
  }
});

// Admin: Delete Interview
app.delete('/api/interviews/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', id)
      .single();

    if (interviewError || !interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    await supabase.from('interview_questions').delete().eq('interview_id', id);

    await supabase.from('cart').delete().eq('interview_id', id);

    await supabase.from('purchased_tests').delete().eq('interview_id', id);

    await supabase.from('user_mock_assignments').delete().eq('interview_id', id);

    await supabase.from('user_interview_attempts').delete().eq('interview_id', id);

    // Delete the interview 
    const { error } = await supabase.from('interviews').delete().eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({ message: 'Error deleting interview', error: error.message });
  }
});

// PUT /api/interviews/:id - Admin edits interview
app.put('/api/interviews/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title, description, job_role, experience_level,
    duration_minutes = 30, questions,
    pricing_type = 'free', prices = {},
  } = req.body;

  if (!title || !job_role || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'Title, job_role and questions array are required' });
  }

  // Pricing validation
  if (!['free', 'paid'].includes(pricing_type)) {
    return res.status(400).json({ message: 'pricing_type must be free or paid' });
  }

  let finalPrices = {};

  if (pricing_type === 'paid') {
    if (!prices || typeof prices !== 'object' || Object.keys(prices).length === 0) {
      return res.status(400).json({ message: 'Paid interview requires prices object' });
    }

    for (const [curr, amt] of Object.entries(prices)) {
      if (!ALLOWED_CURRENCIES.includes(curr)) {
        return res.status(400).json({ message: `Currency ${curr} not allowed. Allowed: ${ALLOWED_CURRENCIES.join(', ')}` });
      }
      if (typeof amt !== 'number' || amt <= 0) {
        return res.status(400).json({ message: `Invalid price for ${curr}` });
      }
    }

    if (!prices.INR || prices.INR <= 0) {
      return res.status(400).json({ message: 'INR price is required for paid interviews' });
    }

    finalPrices = prices;
  }

  try {
    // Confirm interview exists
    const { data: existing, error: existingError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', id)
      .single();

    if (existingError || !existing) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Update interview core fields
    const { data: interview, error: updateError } = await supabase
      .from('interviews')
      .update({
        title,
        description,
        job_role,
        experience_level: experience_level || 'intermediate',
        duration_minutes,
        total_questions: questions.length,
        pricing_type,
        prices: pricing_type === 'paid' ? finalPrices : {},
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Replace questions: delete old ones, insert the new set
    const { error: deleteQError } = await supabase
      .from('interview_questions')
      .delete()
      .eq('interview_id', id);

    if (deleteQError) throw deleteQError;

    const questionsToInsert = questions.map((q, index) => ({
      interview_id: id,
      question_text: q.question_text || q,
      question_type: q.question_type || 'behavioral',
      order_index: index,
    }));

    const { error: insertQError } = await supabase
      .from('interview_questions')
      .insert(questionsToInsert);

    if (insertQError) throw insertQError;

    res.status(200).json({ message: 'Interview updated successfully', interview });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ message: 'Failed to update interview', error: error.message });
  }
});

// GET /api/interview-attempts 
app.get('/api/interview-attempts', verifyUser, async (req, res) => {
  try {
    let query = supabase
      .from('user_interview_attempts')
      .select(`
        *,
        interviews (
          title, 
          job_role,
          interview_questions (question_text)
        )
      `)
      .order('started_at', { ascending: false });

    // Non-admins can only see their own attempts
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch attempts', 
      error: error.message 
    });
  }
});

// POST /api/interview-attempts/start
app.post('/api/interview-attempts/start', verifyUser, async (req, res) => {
  const { interview_id } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('user_interview_attempts')
      .insert({
        user_id: userId,
        interview_id,
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Start attempt error:', error);
    res.status(500).json({ message: 'Failed to start interview', error: error.message });
  }
});

// ====================== GEMINI LLM EVALUATION ======================
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/interview-attempts/:id/complete
app.post('/api/interview-attempts/:id/complete', verifyUser, async (req, res) => {
  const { id } = req.params;
  const { transcript, proctor_violations = 0 } = req.body;
  const userId = req.user.id;

  if (!transcript || !Array.isArray(transcript)) {
    return res.status(400).json({ message: 'Transcript is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a professional technical interviewer. Evaluate the candidate's performance fairly.

${transcript.map((t, i) => `
Question ${i+1}: ${t.question}
Answer: ${t.answer || "No answer given"}
`).join('\n---\n')}

Return **only** valid JSON in this exact format:
{
  "overall_score": number (0-100),
  "summary": "Short overall performance summary",
  "strengths": "Key strengths observed",
  "weaknesses": "Areas needing improvement",
  "suggestions": "Actionable suggestions",
  "per_question": [
    {
      "question": "question text",
      "score": number,
      "feedback": "detailed feedback"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const ai_feedback = JSON.parse(responseText);

    const { data, error } = await supabase
      .from('user_interview_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        transcript,
        ai_feedback,
        overall_score: ai_feedback.overall_score,
        proctor_violations
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Interview completed',
      ai_feedback,
      overall_score: ai_feedback.overall_score
    });

  } catch (err) {
    console.error('Gemini Evaluation Error:', err);
    res.status(500).json({ message: 'Failed to evaluate interview', error: err.message });
  }
});

app.post('/api/ai/recommend-mocks', verifyUser, async (req, res) => {
  const { mockSummary, purchasedIds } = req.body;
 
  if (!mockSummary || !Array.isArray(mockSummary)) {
    return res.status(400).json({ message: 'mockSummary array is required' });
  }
 
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
 
    const prompt = `You are an expert learning advisor on a mock-test platform called TechMocks.
 
Here is the full list of available mock tests (JSON):
${JSON.stringify(mockSummary, null, 2)}
 
The user has already purchased or completed these test IDs:
${JSON.stringify(purchasedIds || [])}
 
Task: Pick the 6 best mock tests for this user to attempt next. Consider:
- Variety across categories
- Progression from easier to harder
- Prioritise tests not yet purchased (but include 1-2 purchased ones if they are foundational)
- Give preference to free tests if possible
 
Return ONLY valid JSON — no markdown, no explanation outside the array:
[
  {
    "mockId": "string (must match an id from the list above)",
    "reason": "string (1 short sentence, max 12 words, why this test is recommended)",
    "priority": number (1-6, where 1 = most important)
  }
]`;
 
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    const recommendations = JSON.parse(responseText);
 
    if (!Array.isArray(recommendations)) {
      return res.status(500).json({ message: 'Unexpected AI response format' });
    }
 
    res.json({ recommendations });
  } catch (err) {
    console.error('AI recommendation error:', err);
    res.status(500).json({ message: 'Failed to generate recommendations', error: err.message });
  }
});

// Purchased Interviews
app.get('/api/admin/purchased-interviews', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('purchased_tests')
      .select(`
        id,
        user_id,
        interview_id,
        purchased_at,
        users ( name, email ),
        interviews!purchased_tests_interview_id_fkey (
          title, job_role, pricing_type, prices
        )
      `)
      .not('interview_id', 'is', null)
      .order('purchased_at', { ascending: false });
 
    if (error) throw error;
 
    const formatted = (data || []).map(row => ({
      id:             row.id,
      userName:       row.users?.name         || 'Unknown',
      userEmail:      row.users?.email        || 'N/A',
      interviewTitle: row.interviews?.title   || 'Untitled',
      jobRole:        row.interviews?.job_role || 'N/A',
      pricingType:    row.interviews?.pricing_type || 'paid',
      priceDisplay:   row.interviews?.prices?.INR
        ? `₹${row.interviews.prices.INR}`
        : 'N/A',
      purchaseDate: row.purchased_at,
    }));
 
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching purchased interviews:', err);
    res.status(500).json({ message: 'Failed to fetch purchased interviews', error: err.message });
  }
});

// Assign Interviews to users
app.post('/api/admin/assign-interview', verifyAdmin, async (req, res) => {
  const { userId, interviewId } = req.body;
 
  if (!userId || !interviewId) {
    return res.status(400).json({ message: 'userId and interviewId are required' });
  }
 
  try {
    // Check already assigned
    const { data: existing } = await supabase
      .from('user_mock_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('interview_id', interviewId)
      .maybeSingle();
 
    if (existing) {
      return res.status(400).json({ message: 'This interview is already assigned to the user' });
    }
 
    // Insert using interview_id column; mock_test_id stays null
    const { error: assignError } = await supabase
      .from('user_mock_assignments')
      .insert({
        user_id:      userId,
        interview_id: interviewId,
        mock_test_id: null,
        assigned_by:  req.user.id,
      });
 
    if (assignError) throw assignError;
 
    // Fetch details for email
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();
 
    const { data: interview } = await supabase
      .from('interviews')
      .select('title, description, job_role, duration_minutes, interview_questions(id)')
      .eq('id', interviewId)
      .single();
 
    if (!user?.email || !interview) {
      return res.status(201).json({ message: 'Assignment created (email skipped)' });
    }
 
    const questionCount = interview.interview_questions?.length || 0;
    const directLink    = `https://www.techmocks.com/interview`;
 
    await transporter.sendMail({
      from:    `"TechMocks Admin" <${process.env.EMAIL_USER}>`,
      to:       user.email,
      subject: `New Interview Assigned: ${interview.title}`,
      text: `Hello ${user.name || 'there'},\n\nAn administrator has assigned you a new AI Mock Interview:\n\n→ ${interview.title}\n→ Role: ${interview.job_role}\n→ ${questionCount} questions · ${interview.duration_minutes} minutes\n\nStart here: ${directLink}\n\nGood luck! 🚀\n\nTechMocks Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c6af7;">New Mock Interview Assigned!</h2>
          <p>Hello ${user.name || 'there'},</p>
          <p>An administrator has just assigned you the following AI mock interview:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 12px 0; color: #7c6af7;">${interview.title}</h3>
            <p style="margin: 8px 0;"><strong>Role:</strong> ${interview.job_role}</p>
            <p style="margin: 8px 0;"><strong>Questions:</strong> ${questionCount}</p>
            <p style="margin: 8px 0;"><strong>Duration:</strong> ${interview.duration_minutes} minutes</p>
          </div>
          <p>
            <a href="${directLink}"
               style="background:#7c6af7;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              Start Mock Interview →
            </a>
          </p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0;" />
          <p style="color:#6b7280;font-size:13px;text-align:center;">
            TechMocks — <a href="https://www.techmocks.com">www.techmocks.com</a>
          </p>
        </div>
      `,
    });
 
    res.status(201).json({ message: 'Interview assigned successfully and email sent' });
  } catch (err) {
    console.error('Assign interview error:', err);
    res.status(500).json({ message: 'Failed to assign interview', error: err.message });
  }
});

// List all Interviews
app.get('/api/admin/interview-assignments', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_mock_assignments')
      .select(`
        id, assigned_at,
        users!user_mock_assignments_user_id_fkey ( name, email ),
        interviews!user_mock_assignments_interview_id_fkey ( title, job_role )
      `)
      .not('interview_id', 'is', null)
      .order('assigned_at', { ascending: false });
 
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching interview assignments:', err);
    res.status(500).json({ message: 'Failed to fetch interview assignments', error: err.message });
  }
});

// Purchased Interviews
app.get('/api/user/purchased-interviews', verifyUser, async (req, res) => {
  const userId = req.user.id;
  try {
    // Rows in purchased_tests where interview_id is set
    const { data: purchased, error: pErr } = await supabase
      .from('purchased_tests')
      .select(`
        interview_id,
        purchased_at,
        interviews!purchased_tests_interview_id_fkey (
          id, title, description, job_role,
          experience_level, duration_minutes,
          pricing_type, is_active,
          interview_questions (*)
        )
      `)
      .eq('user_id', userId)
      .not('interview_id', 'is', null);
 
    if (pErr) throw pErr;
 
    // Rows in user_mock_assignments where interview_id is set
    const { data: assigned, error: aErr } = await supabase
      .from('user_mock_assignments')
      .select(`
        interview_id,
        assigned_at,
        interviews!user_mock_assignments_interview_id_fkey (
          id, title, description, job_role,
          experience_level, duration_minutes,
          pricing_type, is_active,
          interview_questions (*)
        )
      `)
      .eq('user_id', userId)
      .not('interview_id', 'is', null);
 
    if (aErr) throw aErr;
 
    // Merge, deduplicate by interview_id
    const seen = new Set();
    const merged = [];
 
    for (const row of [...(purchased || []), ...(assigned || [])]) {
      if (!row.interviews) continue;
      const ivId = row.interview_id;
      if (!seen.has(ivId)) {
        seen.add(ivId);
        merged.push({
          ...row.interviews,
          acquired_at: row.purchased_at || row.assigned_at,
          source: row.purchased_at ? 'purchased' : 'assigned',
        });
      }
    }
 
    res.json(merged);
  } catch (err) {
    console.error('Error fetching purchased interviews:', err);
    res.status(500).json({ message: 'Failed to fetch purchased interviews', error: err.message });
  }
});

// Delete Interviews from the cart
app.delete('/api/user/cart/remove-interview/:interviewId', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { interviewId } = req.params;
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
      .eq('interview_id', interviewId)
      .eq('item_type', 'interview');
 
    if (error) throw error;
    res.status(200).json({ message: 'Interview removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove interview from cart', error: error.message });
  }
});

app.get('/api/interviews/:id/access', verifyUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
 
  try {
    const { data: interview, error: ivErr } = await supabase
      .from('interviews')
      .select('id, pricing_type')
      .eq('id', id)
      .single();
 
    if (ivErr || !interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.pricing_type === 'free') return res.json({ hasAccess: true });
 
    // Check purchased_tests table (interview_id column)
    const { data: purchased } = await supabase
      .from('purchased_tests')
      .select('id')
      .eq('user_id', userId)
      .eq('interview_id', id)
      .maybeSingle();
 
    if (purchased) return res.json({ hasAccess: true });
 
    // Check user_mock_assignments table (interview_id column)
    const { data: assigned } = await supabase
      .from('user_mock_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('interview_id', id)
      .maybeSingle();
 
    res.json({ hasAccess: !!assigned });
  } catch (err) {
    console.error('Access check error:', err);
    res.status(500).json({ message: 'Failed to check access', error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));