const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validation function for a single question
const validateQuestion = (question) => {
  if (!question.questionText || typeof question.questionText !== 'string') {
    throw new Error('questionText is required and must be a string');
  }
  if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
    throw new Error('options is required and must be a non-empty array');
  }
  if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
    throw new Error('correctAnswer is required and must be a string');
  }
  if (question.explanation && typeof question.explanation !== 'string') {
    throw new Error('explanation must be a string if provided');
  }
  return true;
};

// Validation function for mock test data
const validateMockTest = (data) => {
  const { title, category, timeLimit, questions, pricingType, price, active, createdBy } = data;

  if (!title || typeof title !== 'string') {
    throw new Error('title is required and must be a string');
  }
  if (!category || typeof category !== 'string') {
    throw new Error('category is required and must be a string');
  }
  if (!timeLimit || typeof timeLimit !== 'number' || timeLimit <= 0) {
    throw new Error('timeLimit is required and must be a positive number');
  }
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('questions is required and must be a non-empty array');
  }
  if (!pricingType || !['free', 'paid'].includes(pricingType)) {
    throw new Error("pricingType is required and must be 'free' or 'paid'");
  }
  if (pricingType === 'paid' && (!price || typeof price !== 'number' || price <= 0)) {
    throw new Error('price is required and must be greater than 0 for paid tests');
  }
  if (active !== undefined && typeof active !== 'boolean') {
    throw new Error('active must be a boolean if provided');
  }
  if (createdBy && typeof createdBy !== 'string') {
    throw new Error('createdBy must be a valid UUID string if provided');
  }

  // Validate each question
  questions.forEach((question, index) => {
    try {
      validateQuestion(question);
    } catch (error) {
      throw new Error(`Invalid question at index ${index}: ${error.message}`);
    }
  });

  return true;
};

// MockTest utility object
const MockTest = {
  // Create a new mock test
  async create(data) {
    try {
      console.log('Saving Mock Test:', data); // Debugging log
      validateMockTest(data);

      const { title, description, category, timeLimit, questions, pricingType, price, active, createdBy } = data;

      const { data: result, error } = await supabase
        .from('mock_tests')
        .insert([{
          title,
          description,
          category,
          time_limit: timeLimit,
          questions,
          pricing_type: pricingType,
          price: pricingType === 'paid' ? Number(price) : 0,
          active: active !== undefined ? active : true,
          created_by: createdBy || null,
        }])
        .select()
        .single();

      if (error) throw error;

      return result;
    } catch (error) {
      console.error('Error creating mock test:', error);
      throw error;
    }
  },

  // Find a mock test by ID
  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new Error('Mock test not found');
      }

      return data;
    } catch (error) {
      console.error('Error finding mock test:', error);
      throw error;
    }
  },

  // Update a mock test by ID
  async findByIdAndUpdate(id, updateData) {
    try {
      console.log('Updating Mock Test:', { id, updateData }); // Debugging log
      validateMockTest(updateData);

      const { title, description, category, timeLimit, questions, pricingType, price, active, createdBy } = updateData;

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
          active: active !== undefined ? active : true,
          created_by: createdBy || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        throw new Error('Mock test not found');
      }

      return data;
    } catch (error) {
      console.error('Error updating mock test:', error);
      throw error;
    }
  },

  // Find all mock tests
  async find() {
    try {
      const { data, error } = await supabase
        .from('mock_tests')
        .select('*');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error finding mock tests:', error);
      throw error;
    }
  },

  // Delete a mock test by ID
  async findByIdAndDelete(id) {
    try {
      const { data: mockTest, error: mockTestError } = await supabase
        .from('mock_tests')
        .select('id')
        .eq('id', id)
        .single();

      if (mockTestError || !mockTest) {
        throw new Error('Mock test not found');
      }

      // Delete related records due to foreign key constraints
      await supabase.from('cart').delete().eq('mock_test_id', id);
      await supabase.from('purchased_tests').delete().eq('mock_test_id', id);
      await supabase.from('submissions').delete().eq('mock_test_id', id);

      const { error } = await supabase
        .from('mock_tests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { message: 'Mock test deleted successfully' };
    } catch (error) {
      console.error('Error deleting mock test:', error);
      throw error;
    }
  },
};

module.exports = MockTest;