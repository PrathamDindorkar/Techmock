import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  CardActionArea,
  CardMedia,
  useTheme,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading.json';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);
const MotionAccordion = motion(Accordion);

const AllMocks = () => {
  const [mockTests, setMockTests] = useState({});
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [expandedCategory, setExpandedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [purchasedTests, setPurchasedTests] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Category colors for light and dark modes
  const getCategoryColors = () => ({
    'Science': isDarkMode 
      ? 'linear-gradient(135deg, #433773 0%, #2c2243 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Mathematics': isDarkMode 
      ? 'linear-gradient(135deg, #154b5c 0%, #2e758c 100%)' 
      : 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    'Languages': isDarkMode 
      ? 'linear-gradient(135deg, #94353a 0%, #7a4352 100%)' 
      : 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'History': isDarkMode 
      ? 'linear-gradient(135deg, #8c6b2a 0%, #8c5525 100%)' 
      : 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'General Knowledge': isDarkMode 
      ? 'linear-gradient(135deg, #2c466b 0%, #315a7c 100%)' 
      : 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  });
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const categoryColors = getCategoryColors();
  const defaultCategoryColor = isDarkMode 
    ? 'linear-gradient(135deg, #333740 0%, #252932 100%)' 
    : 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)';

  // Function to fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const mockResponse = await axios.get(`${backendUrl}/api/admin/get-all-mocks`);
      setMockTests(mockResponse.data);
      
      if (Object.keys(mockResponse.data).length > 0) {
        setExpandedCategory(Object.keys(mockResponse.data)[0]);
      }

      const token = localStorage.getItem('token');
      if (token) {
        const [cartResponse, profileResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/cart`, {
            headers: { Authorization: token }
          }),
          axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: token }
          })
        ]);

        setCartItems(cartResponse.data.cart.map(item => ({
          id: item.mockTestId._id,
          title: item.mockTestId.title,
          price: item.price
        })));
        console.log('Profile Response:', profileResponse.data); // Debug log
        setPurchasedTests(profileResponse.data.purchasedTests.map(test => test._id));
        console.log('Purchased Tests:', profileResponse.data.purchasedTests.map(test => test._id)); // Debug log
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        setAlertMessage('Session expired. Please log in again.');
        setAlertSeverity('warning');
        setAlertOpen(true);
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when location changes (after checkout)
  useEffect(() => {
    fetchData();
  }, [location.pathname]); // Re-fetch when route changes

  const hasUserPurchased = (mockId) => {
    const mockTest = findMockById(mockId);
    const isPurchased = mockTest && (mockTest.pricingType === 'free' || purchasedTests.includes(mockId));
    console.log(`Checking if ${mockId} is purchased:`, { isFree: mockTest?.pricingType === 'free', isInPurchased: purchasedTests.includes(mockId), result: isPurchased });
    return isPurchased;
  };

  const findMockById = (mockId) => {
    for (const category in mockTests) {
      const mock = mockTests[category].find(m => m.id === mockId);
      if (mock) {
        console.log(`Found mock ${mockId}:`, mock); // Add this log
        return mock;
      }
    }
    return null;
  };

  const isInCart = (mockId) => {
    return cartItems.some(item => item.id === mockId);
  };

  const handleCardClick = (mockId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertMessage('Please log in to access mock tests!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    
    const mockTest = findMockById(mockId);
    if (!mockTest) {
      setAlertMessage('Test not found!');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    
    const canAccess = hasUserPurchased(mockId);
    console.log(`Attempting to access ${mockId}, canAccess: ${canAccess}`);
    if (canAccess) {
      navigate(`/mock-test/${mockId}`);
    } else {
      setAlertMessage('Please purchase this test to access it!');
      setAlertSeverity('warning');
      setAlertOpen(true);
    }
  };

  const handleAddToCart = async (mockId, event) => {
    event.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertMessage('Please log in to add items to cart!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    
    const mockTest = findMockById(mockId);
    if (!mockTest) {
      setAlertMessage('Test not found!');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    
    if (isInCart(mockId)) {
      setAlertMessage('This item is already in your cart!');
      setAlertSeverity('info');
      setAlertOpen(true);
      return;
    }

    setCartLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/cart/add`,
        { mockTestId: mockId },
        { headers: { Authorization: token } }
      );

      const newCartItem = { id: mockId, title: mockTest.title, price: mockTest.price || 0 };
      setCartItems([...cartItems, newCartItem]);
      setAlertMessage('Added to cart successfully!');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to add to cart');
      setAlertSeverity('error');
      setAlertOpen(true);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setCartLoading(false);
    }
  };

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? category : '');
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <Chip icon={<EmojiEventsIcon />} label="Easy" size="small" color="success" />;
      case 'medium': return <Chip icon={<EmojiEventsIcon />} label="Medium" size="small" color="primary" />;
      case 'hard': return <Chip icon={<EmojiEventsIcon />} label="Hard" size="small" color="error" />;
      default: return null;
    }
  };

  const getPriceDisplay = (mock) => {
    if (mock.pricingType === "free") {
      return <Chip icon={<MonetizationOnIcon />} label="Free" size="small" color="success" />;
    } else if (mock.pricingType === "paid" && mock.price) {
      return <Chip icon={<MonetizationOnIcon />} label={`₹${mock.price}`} size="small" color="secondary" />;
    }
    return null;
  };

  const getAccessIndicator = (mock) => {
    if (hasUserPurchased(mock.id)) {
      return null;
    }
    return (
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%', p: 1 }}>
        <LockIcon sx={{ color: 'white', fontSize: 20 }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <Lottie options={defaultOptions} height={200} width={200} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>Loading Mock Tests...</Typography>
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { when: "beforeChildren", staggerChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, delay: 0.1 } },
    hover: { scale: 1.05, boxShadow: isDarkMode ? "0px 10px 30px rgba(0, 0, 0, 0.4)" : "0px 10px 30px rgba(0, 0, 0, 0.2)", transition: { type: "spring", stiffness: 300 } }
  };

  // Get gradient based on theme mode
  const headerGradient = isDarkMode 
    ? 'linear-gradient(90deg, #4568b0 0%, #264075 100%)' 
    : 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)';

  return (
    <MotionContainer initial="hidden" animate="visible" variants={containerVariants} maxWidth="lg">
      <Box sx={{ textAlign: 'center' }}>
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
          <Typography variant="h3" sx={{ 
            mt: 5, 
            mb: 3, 
            fontWeight: 700, 
            background: headerGradient, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            color: theme.palette.text.primary // Fallback for browsers that don't support background-clip
          }}>
            Prepare with Our Mock Tests
          </Typography>
        </motion.div>
      </Box>
      
      <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 5, maxWidth: '800px', mx: 'auto' }}>
        Enhance your skills with our comprehensive collection of mock tests categorized by subject area
      </Typography>

      <Box sx={{ mt: 4, mb: 8 }}>
        {Object.keys(mockTests).length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.8)' : '#f5f5f5', 
            borderRadius: 2 
          }}>
            <Typography variant="h5" color="text.primary">No mock tests available at the moment</Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>Please check back later for new content</Typography>
          </Box>
        ) : (
          Object.keys(mockTests).map((category, index) => (
            <MotionAccordion 
              key={category} 
              expanded={expandedCategory === category} 
              onChange={handleAccordionChange(category)} 
              sx={{ 
                mb: 3, 
                borderRadius: '12px', 
                overflow: 'hidden', 
                '&:before': { display: 'none' }, 
                boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.08)',
                backgroundColor: theme.palette.background.paper,
              }} 
              variants={itemVariants}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.getContrastText('#667eea') }} />} 
                sx={{ 
                  background: categoryColors[category] || defaultCategoryColor, 
                  color: theme.palette.getContrastText('#667eea'), 
                  '& .MuiAccordionSummary-content': { 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  } 
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{category}</Typography>
                <Chip 
                  label={`${mockTests[category].length} Tests`} 
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'inherit', 
                    fontWeight: 500 
                  }} 
                />
              </AccordionSummary>
              <AccordionDetails sx={{ 
                p: 3, 
                backgroundColor: isDarkMode ? theme.palette.background.paper : '#f9fafc' 
              }}>
                <Grid container spacing={3}>
                  {mockTests[category].map((mock) => (
                    <Grid item xs={12} sm={6} md={4} key={mock.id}>
                      <MotionCard 
                        variants={cardVariants} 
                        whileHover="hover" 
                        initial="hidden" 
                        animate="visible" 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          borderRadius: '12px', 
                          overflow: 'hidden', 
                          transition: 'all 0.3s ease', 
                          position: 'relative',
                          backgroundColor: theme.palette.background.paper,
                          boxShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.2)' : undefined,
                        }}
                      >
                        {getAccessIndicator(mock)}
                        <CardActionArea onClick={() => handleCardClick(mock.id)} sx={{ flexGrow: 1 }}>
                          <CardMedia 
                            component="div" 
                            sx={{ 
                              height: 140, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' 
                            }}
                          >
                            <AssignmentIcon sx={{ fontSize: 60, opacity: 0.7, color: theme.palette.primary.main }} />
                          </CardMedia>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>{mock.title}</Typography>
                              {mock.pricingType === "paid" && !hasUserPurchased(mock.id) && (
                                <IconButton 
                                  color={isInCart(mock.id) ? "secondary" : "primary"} 
                                  onClick={(e) => handleAddToCart(mock.id, e)} 
                                  disabled={isInCart(mock.id) || cartLoading} 
                                  size="small"
                                >
                                  {cartLoading && !isInCart(mock.id) ? <CircularProgress size={24} /> : <AddShoppingCartIcon />}
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{mock.description}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                              <Box>{mock.difficulty && getDifficultyIcon(mock.difficulty)}</Box>
                              <Box>{getPriceDisplay(mock)}</Box>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">{mock.timeLimit} min</Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </MotionCard>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </MotionAccordion>
          ))
        )}
      </Box>

      <Snackbar 
        open={alertOpen} 
        autoHideDuration={4000} 
        onClose={() => setAlertOpen(false)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={alertSeverity} 
          onClose={() => setAlertOpen(false)} 
          variant="filled" 
          elevation={6} 
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default AllMocks;