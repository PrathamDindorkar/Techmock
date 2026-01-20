import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  Box, TextField, Button, Typography, Container, Avatar, Tab, Tabs,
  Paper, Grid, IconButton, InputAdornment, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Switch, Collapse,
  Snackbar, Divider, Select, MenuItem, FormControl, InputLabel, Tooltip,
  CircularProgress, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  FileUpload as FileUploadIcon,
  Save as SaveIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';

const AnimatedContainer = styled(motion.div)({
  width: '100%'
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-3px)'
  }
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  borderRadius: 8,
  border: '1px solid #e0e0e0',
  position: 'relative',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  minWidth: 120,
  transition: 'all 0.2s ease',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: 'rgba(63, 81, 181, 0.08)',
    borderRadius: '8px 8px 0 0'
  }
}));

const AdminPortal = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);

  // State for manual and auto generate test
  const [creationMode, setCreationMode] = useState('manual');

  // State for auto generate test
  const [autoCategory, setAutoCategory] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [autoTitle, setAutoTitle] = useState('');
  const [autoDescription, setAutoDescription] = useState('');
  const [autoTimeLimit, setAutoTimeLimit] = useState(30);
  const [autoPricingType, setAutoPricingType] = useState('free');
  const [autoPrice, setAutoPrice] = useState('');
  const [generating, setGenerating] = useState(false);

  // State for mock test creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', explaination: '' }]);
  const [adminDetails, setAdminDetails] = useState({ name: '', email: '', profileImage: '' });

  // State for mock test editing
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  // State for pricing
  const [pricingType, setPricingType] = useState('free');
  const [price, setPrice] = useState('');

  // State for mock test search
  const [mockTests, setMockTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);

  // State for user management
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userEditDialogOpen, setUserEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State for Coupons
  const [coupons, setCoupons] = useState([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Navigation
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role === 'admin') {
      fetchAdminDetails();
      if (activeTab === 1) {
        fetchMockTests();
      } else if (activeTab === 2) {
        fetchUsers();
      } else if (activeTab === 3) {           // ← NEW
        fetchCoupons();
      }
    }
  }, [role, activeTab]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const fetchAdminDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: token },
      });
      setAdminDetails(response.data);
    } catch (error) {
      console.error('Error fetching admin details:', error);
      showSnackbar('Failed to load admin profile', 'error');
    }
  };

  const fetchMockTests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/admin/mock-tests`, {
        headers: { Authorization: token },
      });
      setMockTests(response.data);

      // Extract unique categories for filtering
      const categories = [...new Set(response.data.map(test => test.category))];
      setAvailableCategories(categories);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching mock tests:', error);
      showSnackbar('Failed to load mock tests', 'error');
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { Authorization: token },
      });
      setUsers(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to load users', 'error');
      setIsLoading(false);
    }
  };

  const handleEditTest = (test) => {
    setEditingTest({
      ...test,
      timeLimit: test.time_limit || test.timeLimit,
      price: test.price || 0,
      pricingType: test.pricing_type || 'free'
    });
    setEditDialogOpen(true);
  };

  const handleUpdateTest = async () => {
    if (!editingTest.title || !editingTest.category || !editingTest.timeLimit) {
      showSnackbar('Title, Category, and Time Limit are required!', 'error');
      return;
    }

    if (editingTest.questions.length === 0) {
      showSnackbar('At least one question is required!', 'error');
      return;
    }

    const invalidQuestions = editingTest.questions.filter(q =>
      !q.questionText || q.options.some(opt => !opt) || !q.correctAnswer
    );

    if (invalidQuestions.length > 0) {
      showSnackbar('All questions must have text, four options, and correct answer!', 'error');
      return;
    }

    if (editingTest.pricingType === 'paid' && (!editingTest.price || editingTest.price <= 0)) {
      showSnackbar('Please enter a valid price for paid test', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${backendUrl}/api/admin/edit-mock-test/${editingTest.id}`,
        {
          title: editingTest.title,
          description: editingTest.description,
          category: editingTest.category,
          timeLimit: Number(editingTest.timeLimit),
          questions: editingTest.questions,
          pricingType: editingTest.pricingType,
          price: editingTest.pricingType === 'paid' ? Number(editingTest.price) : 0
        },
        { headers: { Authorization: token } }
      );

      showSnackbar('Mock test updated successfully!', 'success');
      setEditDialogOpen(false);
      setEditingTest(null);
      fetchMockTests(); // Refresh list
    } catch (error) {
      console.error('Error updating mock test:', error);
      showSnackbar(error.response?.data?.message || 'Failed to update mock test', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (role !== 'admin') {
    return <Navigate to="/hello" />;
  }

  const addQuestionInEdit = () => {
    setEditingTest({
      ...editingTest,
      questions: [...editingTest.questions, {
        questionText: '', options: ['', '', '', ''], correctAnswer: '', explaination: ''
      }]
    });
  };

  const removeQuestionInEdit = (index) => {
    setEditingTest({
      ...editingTest,
      questions: editingTest.questions.filter((_, i) => i !== index)
    });
  };

  const handleQuestionChangeInEdit = (index, field, value) => {
    const updated = [...editingTest.questions];
    updated[index][field] = value;
    setEditingTest({ ...editingTest, questions: updated });
  };

  const handleOptionChangeInEdit = (qIndex, oIndex, value) => {
    const updated = [...editingTest.questions];
    updated[qIndex].options[oIndex] = value;
    setEditingTest({ ...editingTest, questions: updated });
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', explaination: '' }]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handlePricingTypeChange = (event) => {
    setPricingType(event.target.value);
    if (event.target.value === 'free') {
      setPrice('');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(sheet);

        if (excelData.length > 0) {
          const firstRow = excelData[0];
          setTitle(firstRow.Title || '');
          setDescription(firstRow.Description || '');
          setCategory(firstRow.Category || '');
          setTimeLimit(firstRow.TimeLimit || '');

          const uploadedQuestions = excelData.map((row) => {
            const question = {
              questionText: row.Question || '',
              options: [
                row.Option1 || '',
                row.Option2 || '',
                row.Option3 || '',
                row.Option4 || ''
              ],
              correctAnswer: row.Answer || '',
              explaination: row.Explaination || ''
            };
            return question;
          });

          const validQuestions = uploadedQuestions.filter(q =>
            q.questionText &&
            q.options.every(opt => opt !== '') &&
            q.correctAnswer
          );

          if (validQuestions.length > 0) {
            setQuestions(validQuestions);
            showSnackbar(`Successfully processed ${validQuestions.length} questions!`, 'success');
          } else {
            showSnackbar('No valid questions were found in the uploaded file.', 'warning');
          }
        } else {
          showSnackbar('Excel file is empty or invalid!', 'error');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing the Excel file:', error);
        showSnackbar('Failed to read the Excel file. Please ensure it is properly formatted.', 'error');
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const handleAutoGenerate = async () => {
    if (!autoTitle || !autoCategory || numQuestions < 1) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }

    if (autoPricingType === 'paid' && (!autoPrice || autoPrice <= 0)) {
      showSnackbar('Enter a valid price', 'error');
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${backendUrl}/api/admin/generate-mock-test`,
        {
          title: autoTitle,
          description: autoDescription,
          category: autoCategory,
          timeLimit: Number(autoTimeLimit),
          numQuestions: Number(numQuestions),
          pricingType: autoPricingType,
          price: autoPricingType === 'paid' ? Number(autoPrice) : 0
        },
        { headers: { Authorization: token } }
      );

      showSnackbar('Mock test generated successfully!', 'success');

      // Reset form
      setAutoTitle('');
      setAutoDescription('');
      setAutoCategory('');
      setAutoTimeLimit(30);
      setNumQuestions(10);
      setAutoPricingType('free');
      setAutoPrice('');

      // Switch to manage tab to see it
      setActiveTab(1);
      setTimeout(() => fetchMockTests(), 600);

    } catch (error) {
      console.error('Error generating mock test:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to generate mock test. Not enough questions in this category?',
        'error'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!title || !category || !timeLimit) {
      showSnackbar('Title, Category, and Time Limit are required fields!', 'error');
      return;
    }

    if (questions.length === 0) {
      showSnackbar('At least one question is required!', 'error');
      return;
    }

    const invalidQuestions = questions.filter(q =>
      !q.questionText ||
      q.options.some(opt => !opt) ||
      !q.correctAnswer
    );

    if (invalidQuestions.length > 0) {
      showSnackbar('All questions must have text, four options, and a correct answer!', 'error');
      return;
    }

    // Validate price if paid option is selected
    if (pricingType === 'paid' && (!price || isNaN(price) || Number(price) <= 0)) {
      showSnackbar('Please enter a valid price for the paid test', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/admin/add-mock-test`,
        {
          title,
          description,
          category,
          timeLimit: Number(timeLimit),
          questions,
          pricingType,
          price: pricingType === 'paid' ? Number(price) : 0
        },
        { headers: { Authorization: token } }
      );
      showSnackbar('Mock test added successfully!', 'success');
      console.log('Submitting:', { pricingType, price });

      // Reset form after successful submission
      setTitle('');
      setDescription('');
      setCategory('');
      setTimeLimit('');
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', explaination: '' }]);
      setPricingType('free');
      setPrice('');
      setIsLoading(false);

      // Switch to the search tab to show the newly added test
      setActiveTab(1);
      setTimeout(() => {
        fetchMockTests();
      }, 500);

    } catch (error) {
      console.error('Error adding mock test', error);
      showSnackbar('Failed to add mock test. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this mock test?')) {
      // Log for debugging
      console.log('Attempting to delete test with ID:', testId);
      if (!testId) {
        console.error('Delete failed: testId is missing or invalid');
        showSnackbar('Cannot delete: Invalid test ID', 'error');
        return;
      }

      // Per-row loading (you can tie this to a state if needed for UI spinner on button)
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/admin/mock-tests/${testId}`, {
          headers: { Authorization: token }
        });
        console.log('Delete response:', response.data); // Log success
        showSnackbar(response.data.message || 'Mock test deleted successfully!', 'success');

        // Optimistically remove from local state before full refresh
        setMockTests(prev => prev.filter(test => test.id !== testId));

        // Then refresh full list
        await fetchMockTests();
      } catch (error) {
        // Enhanced logging for debugging
        console.error('Full error object in delete:', error);
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request config URL:', error.config?.url);
        showSnackbar(
          error.response?.data?.message || `Failed to delete mock test (Status: ${error.response?.status}). Check console for details.`,
          'error'
        );
      }
    }
  };

  const handleViewTest = (test) => {
    setSelectedTest(test);
    setTestDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/api/admin/users/${selectedUser._id}`, selectedUser, {
        headers: { Authorization: token }
      });
      showSnackbar('User updated successfully!', 'success');
      setUserEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showSnackbar('Failed to update user', 'error');
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
          headers: { Authorization: token }
        });
        showSnackbar('User deleted successfully!', 'success');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showSnackbar('Failed to delete user', 'error');
        setIsLoading(false);
      }
    }
  };

  const fetchCoupons = async () => {
    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/admin/coupons`, {
        headers: { Authorization: token },
      });
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showSnackbar('Failed to load coupon codes', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      showSnackbar('Coupon code is required', 'error');
      return;
    }

    const discountNum = Number(newCouponDiscount);
    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      showSnackbar('Please enter valid discount percentage (1-100)', 'error');
      return;
    }

    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/admin/coupons`,
        {
          code: newCouponCode.trim().toUpperCase(),
          discount: discountNum
        },
        { headers: { Authorization: token } }
      );

      showSnackbar('Coupon created successfully!', 'success');
      setNewCouponCode('');
      setNewCouponDiscount('');
      fetchCoupons(); // refresh list
    } catch (error) {
      console.error('Error creating coupon:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to create coupon',
        'error'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/admin/coupons/${couponId}`, {
        headers: { Authorization: token }
      });

      showSnackbar('Coupon deleted successfully!', 'success');
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showSnackbar('Failed to delete coupon', 'error');
    }
  };

  const filteredMockTests = mockTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? test.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AnimatedContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Admin Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Avatar
              src={adminDetails.profileImage}
              alt={adminDetails.name}
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
              }}
            />
          </motion.div>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Admin Portal
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                {adminDetails.name} | {adminDetails.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs Navigation */}
        <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <StyledTab label="Create Mock Test" icon={<AddIcon />} iconPosition="start" />
            <StyledTab label="Manage Mock Tests" icon={<SearchIcon />} iconPosition="start" />
            <StyledTab label="User Management" icon={<PersonIcon />} iconPosition="start" />
            <StyledTab label="Coupon Codes" icon={<LocalOfferIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <StyledPaper elevation={3}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  Create New Mock Test
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Mode Switch */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Creation Mode
                  </Typography>
                  <RadioGroup
                    row
                    value={creationMode}
                    onChange={(e) => setCreationMode(e.target.value)}
                  >
                    <FormControlLabel value="manual" control={<Radio />} label="Manual Entry (Add Questions)" />
                    <FormControlLabel value="auto" control={<Radio />} label="Auto Generate (From Existing Questions)" />
                  </RadioGroup>
                  {creationMode === 'auto' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      The system will randomly select questions from existing mock tests in the selected category.
                    </Alert>
                  )}
                </Paper>

                {/* ====== AUTO GENERATE MODE ====== */}
                {creationMode === 'auto' && (
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Test Title"
                          value={autoTitle}
                          onChange={(e) => setAutoTitle(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Category (Source)"
                          value={autoCategory}
                          onChange={(e) => setAutoCategory(e.target.value)}
                          required
                          helperText="Questions will be pulled from this category"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Number of Questions"
                          type="number"
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                          inputProps={{ min: 1, max: 100 }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Time Limit (minutes)"
                          type="number"
                          value={autoTimeLimit}
                          onChange={(e) => setAutoTimeLimit(e.target.value)}
                          inputProps={{ min: 1 }}
                          required
                        />
                      </Grid>

                      {/* Pricing */}
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            Pricing Options
                          </Typography>
                          <RadioGroup
                            value={autoPricingType}
                            onChange={(e) => {
                              setAutoPricingType(e.target.value);
                              if (e.target.value === 'free') setAutoPrice('');
                            }}
                          >
                            <FormControlLabel value="free" control={<Radio />} label="Free" />
                            <FormControlLabel value="paid" control={<Radio />} label="Paid" />
                          </RadioGroup>
                          <Collapse in={autoPricingType === 'paid'}>
                            <TextField
                              fullWidth
                              label="Price (₹)"
                              type="number"
                              value={autoPrice}
                              onChange={(e) => setAutoPrice(e.target.value)}
                              sx={{ mt: 2 }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                inputProps: { min: 1 }
                              }}
                            />
                          </Collapse>
                        </Paper>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description (Optional)"
                          multiline
                          rows={4}
                          value={autoDescription}
                          onChange={(e) => setAutoDescription(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleAutoGenerate}
                        disabled={generating || !autoTitle || !autoCategory || !numQuestions}
                        startIcon={generating ? <CircularProgress size={20} /> : <AddIcon />}
                      >
                        {generating ? 'Generating...' : 'Generate Mock Test'}
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* ====== MANUAL MODE (Existing Form) ====== */}
                {creationMode === 'manual' && (
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <StyledPaper elevation={3}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                          Create New Mock Test
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Test Title"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              required
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EditIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Category"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              required
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <FilterIcon color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Time Limit (in minutes)"
                              type="number"
                              value={timeLimit}
                              onChange={(e) => setTimeLimit(e.target.value)}
                              inputProps={{ min: 1 }}
                              required
                              variant="outlined"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              component="label"
                              fullWidth
                              startIcon={<FileUploadIcon />}
                              sx={{ height: '56px' }}
                            >
                              Upload Excel File
                              <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                            </Button>
                          </Grid>

                          {/* Pricing Options */}
                          <Grid item xs={12} sm={6}>
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PaymentIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight="medium">
                                  Pricing Options
                                </Typography>
                              </Box>
                              <RadioGroup
                                value={pricingType}
                                onChange={handlePricingTypeChange}
                                sx={{ ml: 1 }}
                              >
                                <FormControlLabel value="free" control={<Radio />} label="Free" />
                                <FormControlLabel value="paid" control={<Radio />} label="Paid" />
                              </RadioGroup>

                              <Collapse in={pricingType === 'paid'}>
                                <TextField
                                  fullWidth
                                  label="Price (₹)"
                                  type="number"
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                  sx={{ mt: 1 }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                    inputProps: { min: 1 }
                                  }}
                                  placeholder="Enter amount in rupees"
                                  required={pricingType === 'paid'}
                                />
                              </Collapse>
                            </Paper>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              multiline
                              rows={6}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" color="primary" gutterBottom>
                            Questions
                          </Typography>

                          {questions.map((q, qIndex) => (
                            <motion.div
                              key={qIndex}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: qIndex * 0.1 }}
                            >
                              <QuestionCard elevation={1}>
                                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => removeQuestion(qIndex)}
                                    disabled={questions.length === 1}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>

                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                  Question {qIndex + 1}
                                </Typography>

                                <TextField
                                  fullWidth
                                  label="Question Text"
                                  value={q.questionText}
                                  onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                  variant="outlined"
                                  required
                                  sx={{ mb: 2 }}
                                />

                                <Grid container spacing={2}>
                                  {q.options.map((option, oIndex) => (
                                    <Grid item xs={12} sm={6} key={oIndex}>
                                      <TextField
                                        fullWidth
                                        label={`Option ${oIndex + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                        variant="outlined"
                                        required
                                        size="small"
                                      />
                                    </Grid>
                                  ))}

                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Correct Answer"
                                      value={q.correctAnswer}
                                      onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                      variant="outlined"
                                      required
                                      size="small"
                                      helperText="Enter exactly as written in the options"
                                    />
                                  </Grid>

                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Explanation (Optional)"
                                      value={q.explaination || ''}
                                      onChange={(e) => handleQuestionChange(qIndex, 'explaination', e.target.value)}
                                      variant="outlined"
                                      size="small"
                                    />
                                  </Grid>
                                </Grid>
                              </QuestionCard>
                            </motion.div>
                          ))}

                          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                              variant="outlined"
                              onClick={addQuestion}
                              startIcon={<AddIcon />}
                            >
                              Add Question
                            </Button>

                            <Button
                              variant="contained"
                              color="primary"
                              onClick={handleSubmit}
                              startIcon={<SaveIcon />}
                              disabled={isLoading}
                              sx={{ ml: 'auto' }}
                            >
                              {isLoading ? <CircularProgress size={24} /> : 'Save Mock Test'}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </StyledPaper>
                  </motion.div>
                )}
              </Box>
            </StyledPaper>
          </motion.div>
        )}

        {/* Mock Test Search Tab */}
        {activeTab === 1 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <StyledPaper elevation={3}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  Manage Mock Tests
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Search Mock Tests"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Filter by Category</InputLabel>
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Filter by Category"
                      >
                        <MenuItem value="">
                          <em>All Categories</em>
                        </MenuItem>
                        {availableCategories.map((cat, index) => (
                          <MenuItem key={index} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={fetchMockTests}
                      startIcon={<RefreshIcon />}
                      sx={{ height: '56px' }}
                    >
                      Refresh
                    </Button>
                  </Grid>
                </Grid>

                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredMockTests.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No mock tests found. {searchQuery || categoryFilter ? 'Try changing your search criteria.' : ''}
                  </Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Time Limit</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredMockTests.map((test) => {
                          const timeValue = Number(test.time_limit || test.timeLimit || 0);
                          const priceValue = Number(test.price || 0);
                          const isFree = test.pricingType === 'free' || priceValue === 0;
                          const displayText = timeValue === 1 ? '1 minute' : `${timeValue} minutes`; // Handle singular/plural for better UX

                          return (
                            <TableRow key={test.id} hover>
                              <TableCell>{test.title}</TableCell>
                              <TableCell>
                                <Chip label={test.category} size="small" color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{displayText}</span>
                              </TableCell>
                              <TableCell>{test.questions?.length || 0}
                              </TableCell>
                              <TableCell>{isFree ? <Chip label="Free" size="small" color="success" /> : <Chip label={`₹${priceValue}`} size="small" color="secondary" />}
                              </TableCell>
                              <TableCell>{new Date(test.createdAt || test.created_at).toLocaleDateString()}</TableCell>
                              <TableCell align="center"><Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="View Details">
                                  <IconButton size="small" color="primary" onClick={() => handleViewTest(test)}>
                                    <SearchIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit Test">
                                  <IconButton size="small" color="secondary" onClick={() => handleEditTest(test)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Test">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteTest(test.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </StyledPaper>

            {/* Dialog for viewing test details */}
            <Dialog
              open={testDialogOpen}
              onClose={() => setTestDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              {selectedTest && (
                <>
                  <DialogTitle>
                    <Typography variant="h6">{selectedTest.title}</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {selectedTest.category} | {selectedTest.timeLimit} minutes
                    </Typography>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedTest.description || "No description provided."}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Pricing
                      </Typography>
                      <Chip
                        label={selectedTest.pricingType === 'free' ? 'Free' : `₹${selectedTest.price}`}
                        color={selectedTest.pricingType === 'free' ? 'success' : 'secondary'}
                        size="small"
                      />
                    </Box>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Questions ({selectedTest.questions.length})
                    </Typography>
                    {selectedTest.questions.map((q, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {index + 1}. {q.questionText}
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {q.options.map((option, oIndex) => (
                            <Grid item xs={12} sm={6} key={oIndex}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: option === q.correctAnswer ? 'success.main' : 'text.primary',
                                  fontWeight: option === q.correctAnswer ? 'bold' : 'normal'
                                }}
                              >
                                {String.fromCharCode(65 + oIndex)}. {option}
                                {option === q.correctAnswer && ' ✓'}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                        {q.explaination && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <b>Explanation:</b> {q.explaination}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
            {/* Edit Mock Test Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="lg" fullWidth>
              <DialogTitle>
                <Typography variant="h6" color="primary">Edit Mock Test</Typography>
              </DialogTitle>
              <DialogContent dividers>
                {editingTest && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Test Title" required
                          value={editingTest.title}
                          onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Category" required
                          value={editingTest.category}
                          onChange={(e) => setEditingTest({ ...editingTest, category: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Time Limit (minutes)" type="number" required
                          value={editingTest.timeLimit}
                          onChange={(e) => setEditingTest({ ...editingTest, timeLimit: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Description" multiline rows={4}
                          value={editingTest.description || ''}
                          onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                        />
                      </Grid>

                      {/* Pricing */}
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Pricing</Typography>
                          <RadioGroup
                            value={editingTest.pricingType}
                            onChange={(e) => setEditingTest({ ...editingTest, pricingType: e.target.value, price: e.target.value === 'free' ? 0 : editingTest.price })}
                          >
                            <FormControlLabel value="free" control={<Radio />} label="Free" />
                            <FormControlLabel value="paid" control={<Radio />} label="Paid" />
                          </RadioGroup>
                          {editingTest.pricingType === 'paid' && (
                            <TextField
                              fullWidth label="Price (₹)" type="number" sx={{ mt: 2 }}
                              value={editingTest.price}
                              onChange={(e) => setEditingTest({ ...editingTest, price: e.target.value })}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Questions</Typography>
                    {editingTest.questions.map((q, qIndex) => (
                      <QuestionCard key={qIndex} elevation={2} sx={{ mb: 3 }}>
                        <IconButton
                          color="error" size="small"
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => removeQuestionInEdit(qIndex)}
                          disabled={editingTest.questions.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>

                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Question {qIndex + 1}
                        </Typography>

                        <TextField
                          fullWidth label="Question Text" required sx={{ mb: 2 }}
                          value={q.questionText}
                          onChange={(e) => handleQuestionChangeInEdit(qIndex, 'questionText', e.target.value)}
                        />

                        <Grid container spacing={2}>
                          {q.options.map((opt, oIndex) => (
                            <Grid item xs={12} sm={6} key={oIndex}>
                              <TextField
                                fullWidth label={`Option ${oIndex + 1}`} required size="small"
                                value={opt}
                                onChange={(e) => handleOptionChangeInEdit(qIndex, oIndex, e.target.value)}
                              />
                            </Grid>
                          ))}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth label="Correct Answer" required size="small"
                              value={q.correctAnswer}
                              onChange={(e) => handleQuestionChangeInEdit(qIndex, 'correctAnswer', e.target.value)}
                              helperText="Must match one of the options exactly"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth label="Explanation (Optional)" size="small"
                              value={q.explaination || ''}
                              onChange={(e) => handleQuestionChangeInEdit(qIndex, 'explaination', e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </QuestionCard>
                    ))}

                    <Button variant="outlined" startIcon={<AddIcon />} onClick={addQuestionInEdit} sx={{ mt: 2 }}>
                      Add Question
                    </Button>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateTest}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Update Test
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        )}

        {/* User Management Tab */}
        {activeTab === 2 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <StyledPaper elevation={3}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  User Management
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Search Users"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={fetchUsers}
                      startIcon={<RefreshIcon />}
                      sx={{ height: '56px' }}
                    >
                      Refresh User List
                    </Button>
                  </Grid>
                </Grid>

                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredUsers.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No users found. {userSearchQuery ? 'Try changing your search criteria.' : ''}
                  </Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  src={user.profileImage}
                                  alt={user.name}
                                  sx={{ width: 30, height: 30, mr: 1 }}
                                />
                                {user.name}
                              </Box>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                color={user.role === 'admin' ? 'secondary' : 'primary'}
                              />
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={user.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                color={user.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Edit User">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete User">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteUser(user._id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </StyledPaper>

            {/* Dialog for editing user */}
            <Dialog
              open={userEditDialogOpen}
              onClose={() => setUserEditDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              {selectedUser && (
                <>
                  <DialogTitle>
                    <Typography variant="h6">Edit User</Typography>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                          src={selectedUser.profileImage}
                          alt={selectedUser.name}
                          sx={{ width: 80, height: 80 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Name"
                          value={selectedUser.name}
                          onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={selectedUser.email}
                          onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                          variant="outlined"
                          type="email"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={selectedUser.role}
                            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                            label="Role"
                          >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" component="fieldset">
                          <Typography variant="body2" gutterBottom>Account Status</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={selectedUser.isActive}
                                onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                                color="primary"
                              />
                            }
                            label={selectedUser.isActive ? "Active" : "Inactive"}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setUserEditDialogOpen(false)}>Cancel</Button>
                    <Button
                      onClick={handleSaveUser}
                      variant="contained"
                      color="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </motion.div>
        )}
        {activeTab === 3 && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <StyledPaper elevation={3}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  Coupon Code Management
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Create New Coupon Form */}
                <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
                  <Typography variant="h6" gutterBottom>
                    Create New Coupon
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Coupon Code"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="SUMMER2025"
                        helperText="Will be converted to uppercase automatically"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">CODE:</InputAdornment>,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Discount (%)"
                        type="number"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 1, max: 100 }
                        }}
                        placeholder="20"
                      />
                    </Grid>

                    <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={handleCreateCoupon}
                        disabled={couponLoading}
                        startIcon={couponLoading ? <CircularProgress size={20} /> : <AddIcon />}
                        sx={{ height: '56px' }}
                      >
                        Create Coupon
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Coupon List */}
                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Existing Coupons
                </Typography>

                {couponLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                    <CircularProgress />
                  </Box>
                ) : coupons.length === 0 ? (
                  <Alert severity="info">
                    No coupon codes created yet.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Code</strong></TableCell>
                          <TableCell align="center"><strong>Discount</strong></TableCell>
                          <TableCell><strong>Created At</strong></TableCell>
                          <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id} hover>
                            <TableCell>
                              <Chip
                                label={coupon.code}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${coupon.discount}%`}
                                color="success"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(coupon.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Delete Coupon">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </StyledPaper>
          </motion.div>
        )}
      </AnimatedContainer>
    </Container>
  );
};

export default AdminPortal;