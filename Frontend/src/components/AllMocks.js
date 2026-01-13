import React, { useState, useEffect, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz'; // Added this
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading.json';
import countryToCurrency from 'country-to-currency';

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
  const [userCurrency, setUserCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);

  // ── Filters ──
  const [priceFilter, setPriceFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const PROGRAMMING_LANGUAGES = [
    'Java', 'Python', 'JavaScript', 'C++', 'React', 'Node.js', 'Go',
    'TypeScript', 'PHP', 'C#', 'Ruby', 'Swift', 'Kotlin'
  ];

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

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const mockResponse = await axios.get(`${backendUrl}/api/admin/get-all-mocks`);
      let data = mockResponse.data;

      // Group programming languages
      const languagesGroup = {};
      PROGRAMMING_LANGUAGES.forEach(lang => {
        if (data[lang]) {
          languagesGroup[lang] = data[lang];
          delete data[lang];
        }
      });

      if (Object.keys(languagesGroup).length > 0) {
        data['Languages'] = languagesGroup;
      }

      setMockTests(data);

      if (Object.keys(data).length > 0) {
        setExpandedCategory(Object.keys(data)[0]);
      }

      const token = localStorage.getItem('token');
      if (token) {
        const [cartResponse, profileResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/cart`, { headers: { Authorization: token } }),
          axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: token } }),
        ]);

        setCartItems(
          (cartResponse.data?.cart || []).map(item => ({
            id: item.mockTestId?._id || item.mockTestId?.id,
            title: item.mockTestId?.title || 'Untitled',
            price: item.price || 0,
          }))
        );

        setPurchasedTests(
          (profileResponse.data?.purchasedTests || []).map(test => test._id)
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        setAlertMessage('Session expired. Please log in again.');
        setAlertSeverity('warning');
        setAlertOpen(true);
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setAlertMessage('Failed to load mock tests. Please try again.');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Currency detection
  useEffect(() => {
    const getUserCurrency = async () => {
      try {
        const geoRes = await axios.get('https://ipapi.co/json/');
        const countryCode = geoRes.data.country_code || 'IN';
        const currency = countryToCurrency[countryCode] || 'INR';
        setUserCurrency(currency);

        if (currency === 'INR') {
          setExchangeRate(1);
          return;
        }

        const rateRes = await axios.get(
          `https://api.frankfurter.app/latest?from=INR&to=${currency}`
        );
        const rate = rateRes.data?.rates?.[currency] || 1;
        setExchangeRate(rate);
      } catch (err) {
        console.error('Currency fetch failed:', err);
        setUserCurrency('INR');
        setExchangeRate(1);
      }
    };

    getUserCurrency();
  }, []);

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const typeParam = params.get("type");

  if (typeParam === "free") {
    setPriceFilter("free");
  }
}, [location.search]);

  // ── Available categories for filter ──
  const availableCategories = useMemo(() => {
    const cats = ['all', ...Object.keys(mockTests)];
    return cats;
  }, [mockTests]);

  // ── Filtered & Prepared data for rendering ──
  const filteredData = useMemo(() => {
    const result = {};

    Object.entries(mockTests).forEach(([category, tests]) => {
      if (categoryFilter !== 'all' && category !== categoryFilter) return;

      if (category === 'Languages') {
        const filteredSub = {};
        Object.entries(tests).forEach(([lang, mocks]) => {
          const filteredMocks = mocks.filter(mock => {
            if (priceFilter === 'all') return true;
            if (priceFilter === 'free') return mock.pricingType === 'free';
            if (priceFilter === 'paid') return mock.pricingType === 'paid';
            return true;
          });

          if (filteredMocks.length > 0) {
            filteredSub[lang] = filteredMocks;
          }
        });

        if (Object.keys(filteredSub).length > 0) {
          result[category] = filteredSub;
        }
      } else {
        const filteredMocks = tests.filter(mock => {
          if (priceFilter === 'all') return true;
          if (priceFilter === 'free') return mock.pricingType === 'free';
          if (priceFilter === 'paid') return mock.pricingType === 'paid';
          return true;
        });

        if (filteredMocks.length > 0) {
          result[category] = filteredMocks;
        }
      }
    });

    return result;
  }, [mockTests, priceFilter, categoryFilter]);

  const hasUserPurchased = (mockId) => {
    const mock = findMockById(mockId);
    return mock && (mock.pricingType === 'free' || purchasedTests.includes(mockId));
  };

  const findMockById = (mockId) => {
    for (const cat in mockTests) {
      if (cat === 'Languages') {
        for (const lang in mockTests[cat]) {
          const found = mockTests[cat][lang].find(m => m._id === mockId || m.id === mockId);
          if (found) return found;
        }
      } else {
        const found = mockTests[cat].find(m => m._id === mockId || m.id === mockId);
        if (found) return found;
      }
    }
    return null;
  };

  const isInCart = (mockId) => cartItems.some(item => item.id === mockId);

  const handleCardClick = (mockId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertMessage('Please log in to access mock tests!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    if (hasUserPurchased(mockId)) {
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

    if (isInCart(mockId)) {
      setAlertMessage('Already in cart!');
      setAlertSeverity('info');
      setAlertOpen(true);
      return;
    }

    setCartLoading(true);
    try {
      await axios.post(
        `${backendUrl}/api/user/cart/add`,
        { mockTestId: mockId, currency: userCurrency },
        { headers: { Authorization: token } }
      );

      const mock = findMockById(mockId);
      setCartItems([...cartItems, {
        id: mockId,
        title: mock?.title || 'Untitled',
        price: mock?.price || 0
      }]);

      setAlertMessage('Added to cart!');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage(err.response?.data?.message || 'Failed to add to cart');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setCartLoading(false);
    }
  };

  const handleAccordionChange = (category) => (_, isExpanded) => {
    setExpandedCategory(isExpanded ? category : '');
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
  };

  const getDifficultyIcon = (difficulty) => {
    const lower = (difficulty || '').toLowerCase();
    if (lower === 'easy') return <Chip icon={<EmojiEventsIcon />} label="Easy" size="small" color="success" />;
    if (lower === 'medium') return <Chip icon={<EmojiEventsIcon />} label="Medium" size="small" color="primary" />;
    if (lower === 'hard') return <Chip icon={<EmojiEventsIcon />} label="Hard" size="small" color="error" />;
    return null;
  };

  const getPriceDisplay = (mock) => {
    if (mock.pricingType === 'free') {
      return <Chip icon={<MonetizationOnIcon />} label="Free" size="small" color="success" />;
    }
    if (mock.pricingType === 'paid' && mock.price) {
      const converted = (mock.price * exchangeRate).toFixed(2);
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: userCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return <Chip icon={<MonetizationOnIcon />} label={formatter.format(converted)} size="small" color="secondary" />;
    }
    return null;
  };

  const getAccessIndicator = (mock) => {
    if (hasUserPurchased(mock._id || mock.id)) return null;
    return (
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1, bgcolor: 'rgba(0,0,0,0.7)', borderRadius: '50%', p: 1 }}>
        <LockIcon sx={{ color: 'white', fontSize: 20 }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <Lottie options={defaultOptions} height={200} width={200} />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading Mock Tests...</Typography>
      </Box>
    );
  }

  const headerGradient = isDarkMode 
    ? 'linear-gradient(90deg, #4568b0 0%, #264075 100%)' 
    : 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)';

  return (
    <MotionContainer maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700,
            background: headerGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Prepare with Our Mock Tests
          </Typography>
        </motion.div>
        <Typography variant="h6" color="textSecondary" sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
          Choose from our comprehensive collection of mock tests
        </Typography>
      </Box>

      {/* Filters */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        alignItems={{ sm: 'center' }} 
        justifyContent="space-between"
        sx={{ mb: 5, px: 1 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterListIcon color="primary" />
          <Typography variant="h6">Filters</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexGrow={1}>
          <FormControl size="small" fullWidth>
            <InputLabel>Price</InputLabel>
            <Select
              value={priceFilter}
              label="Price"
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <MenuItem value="all">All Prices</MenuItem>
              <MenuItem value="free">Free Only</MenuItem>
              <MenuItem value="paid">Paid Only</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                if (e.target.value !== 'all') {
                  setExpandedCategory(e.target.value);
                }
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {availableCategories.filter(c => c !== 'all').map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {/* Content */}
      {Object.keys(filteredData).length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h5" gutterBottom>
            No mock tests match your filters
          </Typography>
          <Typography color="text.secondary">
            Try changing the price or category filter
          </Typography>
        </Box>
      ) : (
        Object.entries(filteredData).map(([category, testsData]) => {
          const isLanguages = category === 'Languages';

          const totalTests = isLanguages
            ? Object.values(testsData).reduce((sum, arr) => sum + arr.length, 0)
            : testsData.length;

          return (
            <MotionAccordion
              key={category}
              expanded={expandedCategory === category}
              onChange={handleAccordionChange(category)}
              sx={{
                mb: 4,
                borderRadius: '12px',
                overflow: 'hidden',
                '&:before': { display: 'none' },
                boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  background: categoryColors[category] || defaultCategoryColor,
                  color: 'white',
                  '& .MuiAccordionSummary-content': { alignItems: 'center' }
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {category}
                </Typography>
                <Chip
                  label={`${totalTests} Tests`}
                  size="small"
                  sx={{ bgcolor: 'rgba(122, 122, 122, 0.52)', color: theme.palette.default, fontWeight: 'bold'}}
                />
              </AccordionSummary>

              <AccordionDetails sx={{ p: 3, bgcolor: isDarkMode ? 'background.paper' : '#fafafa' }}>
                {isLanguages ? (
                  Object.entries(testsData).map(([lang, mocks]) => (
                    <Accordion key={lang} sx={{ mb: 3, boxShadow: 'none', '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{lang}</Typography>
                        <Chip label={`${mocks.length} Tests`} size="small" sx={{ ml: 2 }} />
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          {mocks.map(mock => (
                            <Grid item xs={12} sm={6} md={4} key={mock._id || mock.id}>
                              <MotionCard
                                whileHover={{ scale: 1.04, y: -6 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  position: 'relative',
                                  boxShadow: 3,
                                }}
                              >
                                {getAccessIndicator(mock)}
                                <CardActionArea 
                                  onClick={() => handleCardClick(mock._id || mock.id)}
                                  sx={{ flexGrow: 1 }}
                                >
                                  <CardMedia
                                    sx={{
                                      height: 140,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: 'action.hover',
                                    }}
                                  >
                                    <AssignmentIcon sx={{ fontSize: 64, opacity: 0.6, color: 'primary.main' }} />
                                  </CardMedia>

                                  <CardContent sx={{ flexGrow: 1, pb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, pr: 1 }}>
                                        {mock.title}
                                      </Typography>

                                      {mock.pricingType === 'paid' && !hasUserPurchased(mock._id || mock.id) && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleAddToCart(mock._id || mock.id, e)}
                                          disabled={isInCart(mock._id || mock.id) || cartLoading}
                                        >
                                          {cartLoading ? <CircularProgress size={20} /> : <AddShoppingCartIcon />}
                                        </IconButton>
                                      )}
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 44 }}>
                                      {mock.description || 'No description available'}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                      {getDifficultyIcon(mock.difficulty)}
                                      {getPriceDisplay(mock)}
                                    </Box>

                                    {/* Updated Section to show Time and Question count */}
                                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.8, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {mock.timeLimit} mins
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <QuizIcon fontSize="small" sx={{ mr: 0.8, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {mock.questions ? mock.questions.length : 0} Questions
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </CardContent>
                                </CardActionArea>
                              </MotionCard>
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Grid container spacing={3}>
                    {testsData.map(mock => (
                      <Grid item xs={12} sm={6} md={4} key={mock._id || mock.id}>
                        <MotionCard
                          whileHover={{ scale: 1.04, y: -6 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 3,
                          }}
                        >
                          {getAccessIndicator(mock)}
                          <CardActionArea 
                            onClick={() => handleCardClick(mock._id || mock.id)}
                            sx={{ flexGrow: 1 }}
                          >
                            <CardMedia
                              sx={{
                                height: 140,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                              }}
                            >
                              <AssignmentIcon sx={{ fontSize: 64, opacity: 0.6, color: 'primary.main' }} />
                            </CardMedia>

                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, pr: 1 }}>
                                  {mock.title}
                                </Typography>

                                {mock.pricingType === 'paid' && !hasUserPurchased(mock._id || mock.id) && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleAddToCart(mock._id || mock.id, e)}
                                    disabled={isInCart(mock._id || mock.id) || cartLoading}
                                  >
                                    {cartLoading ? <CircularProgress size={20} /> : <AddShoppingCartIcon />}
                                  </IconButton>
                                )}
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 44 }}>
                                {mock.description || 'No description available'}
                              </Typography>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                {getDifficultyIcon(mock.difficulty)}
                                {getPriceDisplay(mock)}
                              </Box>

                              {/* Updated Section to show Time and Question count */}
                              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTimeIcon fontSize="small" sx={{ mr: 0.8, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {mock.timeLimit} mins
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <QuizIcon fontSize="small" sx={{ mr: 0.8, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {mock.questions ? mock.questions.length : 0} Questions
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </MotionCard>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </MotionAccordion>
          );
        })
      )}

      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)} variant="filled" elevation={6}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default AllMocks;