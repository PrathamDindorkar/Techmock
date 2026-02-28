import React, { useState, useEffect } from 'react';
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
  useTheme,
  IconButton,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FilterListIcon from '@mui/icons-material/FilterList';
import LoginIcon from '@mui/icons-material/Login';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading.json';
import countryToCurrency from 'country-to-currency';
import axios from 'axios';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);
const MotionAccordion = motion(Accordion);

const PROGRAMMING_LANGUAGES = [
  'Java', 'Python', 'JavaScript', 'C++', 'React', 'Node.js',
  'Go', 'TypeScript', 'PHP', 'C#', 'Ruby', 'Swift', 'Kotlin'
];

const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Filters
  const [priceFilter, setPriceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const getCategoryColors = () => ({
    'Science': isDarkMode ? 'linear-gradient(135deg, #6b48ff 0%, #a239ca 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Mathematics': isDarkMode ? 'linear-gradient(135deg, #00c6ab 0%, #0077b6 100%)' : 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    'Languages': isDarkMode ? 'linear-gradient(135deg, #003366 0%, #0055aa 100%)' : 'linear-gradient(135deg, #004080 0%, #009de0 100%)',
    'History': isDarkMode ? 'linear-gradient(135deg, #feca57 0%, #ff9f43 100%)' : 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'General Knowledge': isDarkMode ? 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)' : 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  });

  const categoryColors = getCategoryColors();
  const defaultCategoryColor = isDarkMode
    ? 'linear-gradient(135deg, #003366 0%, #0055aa 100%)'   // darker variant for dark mode
    : 'linear-gradient(135deg, #004080 0%, #009de0 100%)';

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
        setExchangeRate(rateRes.data?.rates?.[currency] || 1);
      } catch {
        setUserCurrency('INR');
        setExchangeRate(1);
      }
    };
    getUserCurrency();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (token) {
          setIsLoggedIn(true);

          try {
            const profileResponse = await axios.get(`${backendUrl}/api/user/profile`, {
              headers: { Authorization: token },
            });

            const userRole = profileResponse.data.role || 'user';
            setIsAdmin(userRole === 'admin');

            let purchasedIds = (profileResponse.data?.purchasedTests || []).map(
              test => test._id || test.id
            );

            if (userRole !== 'admin') {
              setPurchasedTests(purchasedIds);
            }

            if (userRole !== 'admin') {
              try {
                const cartResponse = await axios.get(`${backendUrl}/api/user/cart`, {
                  headers: { Authorization: token },
                });
                setCartItems(
                  (cartResponse.data?.cart || []).map(item => ({
                    id: item.mockTestId?._id || item.mockTestId?.id,
                    title: item.mockTestId?.title || 'Untitled',
                    price: item.price || 0,
                  }))
                );
              } catch (err) {
                console.error('Error fetching cart:', err);
              }
            }
          } catch (err) {
            console.error('Error fetching user data:', err);
            if (err.response?.status === 401) {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
            }
          }
        } else {
          setIsLoggedIn(false);
        }

        const mockResponse = await axios.get(`${backendUrl}/api/admin/get-all-mocks`);
        let data = mockResponse.data;

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

        if (isAdmin) {
          const allIds = [];
          Object.values(data).forEach(category => {
            if (Array.isArray(category)) {
              category.forEach(t => allIds.push(t._id || t.id));
            } else if (typeof category === 'object') {
              Object.values(category).flat().forEach(t => allIds.push(t._id || t.id));
            }
          });
          setPurchasedTests(allIds);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setAlertMessage('Failed to load mock tests. Please try again.');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname, backendUrl, isAdmin]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("type") === "free") {
      setPriceFilter("free");
    }
  }, [location.search]);

  // ── Access logic (unchanged) ──
  const canAccessTest = (mock) => {
    if (isAdmin) return true;
    if (mock?.pricingType === 'free') return true;
    return purchasedTests.includes(mock?._id || mock?.id);
  };

  const isPurchased = (mockId) => purchasedTests.includes(mockId);
  const isInCart = (mockId) => cartItems.some(item => item.id === mockId);

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

  const handleCardClick = (mockId) => {
    if (!isLoggedIn) {
      setAlertMessage('Please log in to access mock tests!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const mock = findMockById(mockId);
    if (!mock) return;

    if (canAccessTest(mock)) {
      navigate(`/mock-test/${mockId}`);
    } else {
      setAlertMessage('Please purchase this test to access it!');
      setAlertSeverity('warning');
      setAlertOpen(true);
    }
  };

  const handleAddToCart = async (mockId, event) => {
    event.stopPropagation();

    if (!isLoggedIn) {
      setAlertMessage('Please log in to add items to cart!');
      setAlertSeverity('warning');
      setAlertOpen(true);
      setTimeout(() => navigate('/login'), 1500);
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
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/user/cart/add`,
        { mockTestId: mockId, currency: userCurrency },
        { headers: { Authorization: token } }
      );

      const mock = findMockById(mockId);
      setCartItems([
        ...cartItems,
        { id: mockId, title: mock?.title || 'Untitled', price: mock?.price || 0 },
      ]);
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
    if (lower === 'easy') return <Chip icon={<AssignmentIcon />} label="Easy" size="small" color="success" />;
    if (lower === 'medium') return <Chip icon={<AssignmentIcon />} label="Medium" size="small" color="warning" />;
    if (lower === 'hard') return <Chip icon={<AssignmentIcon />} label="Hard" size="small" color="error" />;
    return null;
  };

  const getPriceDisplay = (mock) => {
    if (isAdmin) {
      return <Chip icon={<MonetizationOnIcon />} label="Free (Admin)" size="small" color="success" variant="outlined" />;
    }
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
    if (mock.pricingType !== 'paid') return null;
    if (isAdmin) return null;
    if (isPurchased(mock._id || mock.id)) return null;

    return (
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, bgcolor: 'rgba(0,0,0,0.65)', borderRadius: '50%', p: 1 }}>
        <LockIcon sx={{ color: '#fff', fontSize: 22 }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Lottie options={defaultOptions} height={220} width={220} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
          Loading Mock Tests...
        </Typography>
      </Box>
    );
  }

  const headerGradient = isDarkMode
    ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
    : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: defaultCategoryColor,
          color: 'white',
          pt: { xs: 8, md: 10 },
          pb: { xs: 6, md: 8 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={800}
              gutterBottom
              sx={{ letterSpacing: '-0.5px', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
            >
              Mock Tests
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 720, opacity: 0.9, fontWeight: 400 }}>
              Practice with high-quality mock exams • Track progress • Improve scores
            </Typography>

            {!isLoggedIn && (
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                sx={{ mt: 4, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                onClick={() => navigate('/login')}
              >
                Sign in to Start Practicing
              </Button>
            )}
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters – Card style */}
        <Card
          elevation={2}
          sx={{
            mb: 5,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: isDarkMode ? 'background.paper' : '#fff',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
              <FilterListIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Filter Mock Tests</Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      if (e.target.value !== 'all') setExpandedCategory(e.target.value);
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {Object.keys(mockTests).map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Main Content */}
        {Object.keys(mockTests).length === 0 ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No mock tests available at the moment
            </Typography>
            <Typography color="text.secondary">
              Please check back later or contact support
            </Typography>
          </Box>
        ) : (
          Object.entries(mockTests)
            .filter(([category]) => categoryFilter === 'all' || category === categoryFilter)
            .map(([category, testsData]) => {
              let filteredTestsData = testsData;
              let totalTests = 0;

              if (priceFilter !== 'all') {
                if (category === 'Languages') {
                  filteredTestsData = {};
                  Object.entries(testsData).forEach(([lang, mocks]) => {
                    const filteredMocks = mocks.filter(mock => mock.pricingType === priceFilter);
                    if (filteredMocks.length > 0) {
                      filteredTestsData[lang] = filteredMocks;
                    }
                    totalTests += filteredMocks.length;
                  });
                } else {
                  filteredTestsData = testsData.filter(mock => mock.pricingType === priceFilter);
                  totalTests = filteredTestsData.length;
                }
              } else {
                if (category === 'Languages') {
                  totalTests = Object.values(testsData).reduce((sum, arr) => sum + arr.length, 0);
                } else {
                  totalTests = testsData.length;
                }
              }

              if (totalTests === 0) return null;

              const isLanguages = category === 'Languages';

              return (
                <MotionAccordion
                  key={category}
                  expanded={expandedCategory === category}
                  onChange={handleAccordionChange(category)}
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[3],
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{
                      background: categoryColors[category] || defaultCategoryColor,
                      minHeight: 72,
                      '& .MuiAccordionSummary-content': { alignItems: 'center' },
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} color="white" flexGrow={1}>
                      {category}
                    </Typography>
                    <Chip
                      label={`${totalTests} Tests`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.20)', color: 'white', fontWeight: 600 }}
                    />
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 3.5, bgcolor: isDarkMode ? '#1e1e1e' : '#f8fafc' }}>
                    {isLanguages ? (
                      Object.entries(filteredTestsData).map(([lang, mocks]) => (
                        <Box key={lang} sx={{ mb: 5 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                            {lang}
                          </Typography>
                          <Grid container spacing={3}>
                            {mocks.map(mock => renderMockCard(mock))}
                          </Grid>
                        </Box>
                      ))
                    ) : (
                      <Grid container spacing={3}>
                        {filteredTestsData.map(mock => renderMockCard(mock))}
                      </Grid>
                    )}
                  </AccordionDetails>
                </MotionAccordion>
              );
            })
        )}
      </Container>

      <Snackbar
        open={alertOpen}
        autoHideDuration={4500}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%', maxWidth: 500, boxShadow: 6 }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );

  function renderMockCard(mock) {
    const mockId = mock._id || mock.id;

    return (
      <Grid item xs={12} sm={6} md={4} key={mockId}>
        <MotionCard
          whileHover={{ y: -8, boxShadow: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          sx={{
            height: '100%',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.25s ease',
          }}
        >
          {getAccessIndicator(mock)}

          <CardActionArea onClick={() => handleCardClick(mockId)} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                height: 140,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <AssignmentIcon sx={{ fontSize: 64, opacity: 0.18, color: 'primary.main' }} />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="h6" fontWeight={600} lineHeight={1.3} pr={1}>
                  {mock.title}
                </Typography>

                {!isAdmin && mock.pricingType === 'paid' && !isPurchased(mockId) && (
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => handleAddToCart(mockId, e)}
                    disabled={isInCart(mockId) || cartLoading}
                    sx={{ mt: -0.5 }}
                  >
                    {cartLoading ? <CircularProgress size={22} /> : <AddShoppingCartIcon />}
                  </IconButton>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6, minHeight: 60 }}>
                {mock.description || 'No description provided'}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {getDifficultyIcon(mock.difficulty)}
                {getPriceDisplay(mock)}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<AccessTimeIcon fontSize="small" />}
                  label={`${mock.timeLimit} min`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<QuizIcon fontSize="small" />}
                  label={`${mock.questions?.length || 0} questions`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </CardActionArea>
        </MotionCard>
      </Grid>
    );
  }
};

export default AllMocks;