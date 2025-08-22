import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Box, TextField, Button, Typography, Container, Avatar, Tab, Tabs, 
  Paper, Grid, Card, CardContent, IconButton, InputAdornment, Alert,
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
  ArrowDropDown as ArrowDropDownIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

// Styled components for animations and styling
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
  
  // State for mock test creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', explaination: '' }]);
  const [adminDetails, setAdminDetails] = useState({ name: '', email: '', profileImage: '' });
  
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (role !== 'admin') {
    return <Navigate to="/hello" />;
  }

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
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`${backendUrl}/api/admin/mock-tests/${testId}`, {
          headers: { Authorization: token }
        });
        showSnackbar(response.data.message || 'Mock test deleted successfully!', 'success');
        fetchMockTests();
      } catch (error) {
        console.error('Error deleting mock test:', error);
        showSnackbar(
          error.response?.data?.message || 'Failed to delete mock test. Please try again.',
          'error'
        );
      } finally {
        setIsLoading(false);
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
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
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
                        {filteredMockTests.map((test) => (
                          <TableRow key={test._id} hover>
                            <TableCell>{test.title}</TableCell>
                            <TableCell>
                              <Chip label={test.category} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell>{test.timeLimit} min</TableCell>
                            <TableCell>{test.questions.length}</TableCell>
                            <TableCell>
                              {test.pricingType === 'free' ? (
                                <Chip label="Free" size="small" color="success" />
                              ) : (
                                <Chip label={`₹${test.price}`} size="small" color="secondary" />
                              )}
                            </TableCell>
                            <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="View Details">
                                <IconButton 
                                    size="small" 
                                    color="primary"
                                    onClick={() => handleViewTest(test)}
                                  >
                                    <SearchIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Test">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleDeleteTest(test._id)}
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
                          onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                          variant="outlined" 
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          fullWidth 
                          label="Email" 
                          value={selectedUser.email} 
                          onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                          variant="outlined" 
                          type="email"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Role</InputLabel>
                          <Select
                            value={selectedUser.role}
                            onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
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
                                onChange={(e) => setSelectedUser({...selectedUser, isActive: e.target.checked})}
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
      </AnimatedContainer>
    </Container>
  );
};

export default AdminPortal;