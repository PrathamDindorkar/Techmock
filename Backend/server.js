const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
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

// Razorpay: Create Order
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/payment/order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ error: 'Amount must be at least ₹1' });
    }

    const amountInPaise = Math.round(amount * 100);
    console.log('Creating order with amount (paise):', amountInPaise);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log('Order Created:', order);
    res.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Razorpay: Verify Payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    console.log('Generated Signature:', generatedSignature);
    console.log('Received Signature:', razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

// User: Add to Cart
app.post('/api/user/cart/add', verifyUser, async (req, res) => {
  const userId = req.user.id;
  const { mockTestId } = req.body;

  try {
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id, price')
      .eq('id', mockTestId)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    const { data: existingItem, error: cartError } = await supabase
      .from('cart')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', mockTestId)
      .single();

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }
    if (cartError && cartError.code !== 'PGRST116') {
      throw cartError;
    }

    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: userId, mock_test_id: mockTestId, price: mockTest.price }])
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

// User: Get Cart
app.get('/api/user/cart', verifyUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('cart')
      .select('id, mock_test_id, price, mock_tests(title, description, pricing_type, price)')
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

// Update submission endpoint to award badges and points
app.post('/api/mock-test/:id/submit', verifyUser, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  try {
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id, questions')
      .eq('id', id)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    mockTest.questions.forEach((question, index) => {
      const userAnswer = answers[index.toString()];
      if (userAnswer && userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()) {
        correctAnswers++;
      }
    });
    const accuracy = Math.round((correctAnswers / mockTest.questions.length) * 100);

    // Save submission
    const { data: existingSubmission, error: existingError } = await supabase
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

    // Award badges based on performance
    const pointsEarned = correctAnswers * 10; // 10 points per correct answer
    await updateUserRank(userId, pointsEarned);

    if (accuracy >= 80) {
      await awardBadge(userId, 'High Achiever', 'Scored 80% or above on a mock test', '🏆');
    }
    if (correctAnswers === mockTest.questions.length) {
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

    res.status(201).json({ message: 'Submission successful', submission });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ message: 'Failed to submit test', error: error.message });
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

    // Collect and deduplicate questions using questionText as unique key
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