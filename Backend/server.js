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
app.use(cors());

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
    if (verified.email !== 'prathamdindorkar67@gmail.com') {
      return res.status(403).json({ message: 'Forbidden: Admin only' });
    }
    req.user = verified;
    next();
  } catch (err) {
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
      .insert([{ name, email, password: hashedPassword, is_verified: true }])
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
      .select('id, email, password')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const role = email === 'prathamdindorkar67@gmail.com' ? 'admin' : 'user';
    const token = jwt.sign({ id: user.id, email, role }, process.env.JWT_SECRET, { expiresIn: '2d' });

    res.status(200).json({ email, role, token });
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

// Submit Mock Test Answers
app.post('/api/mock-test/:id/submit', verifyUser, async (req, res) => {
  const { id } = req.params; // mockTestId
  const { answers } = req.body;
  const userId = req.user.id;

  try {
    const { data: mockTest, error: mockTestError } = await supabase
      .from('mock_tests')
      .select('id')
      .eq('id', id)
      .single();

    if (mockTestError || !mockTest) {
      return res.status(404).json({ message: 'Mock test not found' });
    }

    // Check if submission exists
    const { data: existingSubmission, error: existingError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('mock_test_id', id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw existingError;
    }

    let submission;
    if (existingSubmission) {
      // Update existing submission
      const { data, error } = await supabase
        .from('submissions')
        .update({ answers, created_at: new Date() }) // Update with new answers and timestamp
        .eq('id', existingSubmission.id)
        .select()
        .single();
      if (error) throw error;
      submission = data;
    } else {
      // Create new submission
      const { data, error } = await supabase
        .from('submissions')
        .insert([{ user_id: userId, mock_test_id: id, answers }])
        .select()
        .single();
      if (error) throw error;
      submission = data;
    }

    res.status(201).json({ message: 'Submission successful', submission });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ message: 'Failed to submit test', error: error.message });
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));