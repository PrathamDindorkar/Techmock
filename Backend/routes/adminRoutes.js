const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MockTest = require('../models/MockTest'); // Import the updated MockTest module
require('dotenv').config();

// Middleware for verifying admin
const verifyAdmin = (req, res, next) => {
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

// Add Mock Test
router.post('/add-mock-test', verifyAdmin, async (req, res) => {
  const { title, description, category, timeLimit, questions, pricingType, price, active } = req.body;

  try {
    const mockTestData = {
      title,
      description,
      category,
      timeLimit,
      questions,
      pricingType,
      price,
      active,
      createdBy: req.user.id, // Set createdBy to the authenticated admin's user ID
    };

    const newMockTest = await MockTest.create(mockTestData);
    res.status(201).json({ message: 'Mock test added successfully!', mockTest: newMockTest });
  } catch (error) {
    console.error('Error adding mock test:', error);
    res.status(500).json({ message: 'Error adding mock test', error: error.message });
  }
});

// Edit Mock Test
router.put('/edit-mock-test/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, category, timeLimit, questions, pricingType, price, active } = req.body;

  try {
    const mockTestData = {
      title,
      description,
      category,
      timeLimit,
      questions,
      pricingType,
      price,
      active,
      createdBy: req.user.id, // Update createdBy if needed
    };

    const updatedMockTest = await MockTest.findByIdAndUpdate(id, mockTestData);
    res.status(200).json({ message: 'Mock test updated successfully!', mockTest: updatedMockTest });
  } catch (error) {
    console.error('Error updating mock test:', error);
    res.status(500).json({ message: 'Error updating mock test', error: error.message });
  }
});

// Fetch All Mock Tests
router.get('/mock-tests', async (req, res) => {
  try {
    const mockTests = await MockTest.find();
    res.status(200).json(mockTests);
  } catch (error) {
    console.error('Error fetching mock tests:', error);
    res.status(500).json({ message: 'Error fetching mock tests', error: error.message });
  }
});

// Delete Mock Test (optional, if you want to add it)
router.delete('/mock-tests/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await MockTest.findByIdAndDelete(id);
    res.status(200).json({ message: 'Mock test deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock test:', error);
    res.status(500).json({ message: 'Error deleting mock test', error: error.message });
  }
});

// FOR TESTING PUPOSES ONLY

// Fetch all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, is_verified, created_at');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update a user
router.put('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, is_verified } = req.body;

  try {
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', id)
      .single();

    if (existingError || !existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== existingUser.email) {
      const { data: emailCheck, error: emailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (emailCheck) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      if (emailError && emailError.code !== 'PGRST116') {
        throw emailError;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (is_verified !== undefined) updateData.is_verified = is_verified;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'User updated successfully', user: data });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete a user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});
module.exports = router;