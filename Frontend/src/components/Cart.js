import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Divider,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Stripe imports
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import countryToCurrency from 'country-to-currency';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

const CheckoutForm = ({ total, userCurrency, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage('Payment system is loading...');
      setMessageType('error');
      return;
    }

    setProcessing(true);
    setMessage('');
    setMessageType('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Payment failed. Please try again.');
      setMessageType('error');
    } else if (paymentIntent?.status === 'succeeded') {
      setMessage('Payment successful! Finalizing your purchase...');
      setMessageType('success');

      await onSuccess();

      setMessage('Payment complete! Your mock tests are now unlocked. 🎉');
    }

    setProcessing(false);
  };

  // Format total with user's currency
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: userCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const formattedTotal = formatter.format(total);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={processing || !stripe || !elements}
        sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
        startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
      >
        {processing ? 'Processing Payment...' : `Pay ${formattedTotal}`}
      </Button>

      <Button
        variant="outlined"
        fullWidth
        onClick={onBack}
        disabled={processing}
        startIcon={<ArrowBackIcon />}
        sx={{ mt: 1 }}
      >
        Back to Cart
      </Button>

      {message && (
        <Alert
          severity={messageType === 'success' ? 'success' : 'error'}
          icon={messageType === 'success' ? <CheckCircleIcon /> : false}
          sx={{ mt: 3 }}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const [clientSecret, setClientSecret] = useState('');
  const [paymentMode, setPaymentMode] = useState(false);
  const [userCurrency, setUserCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [convertedTotal, setConvertedTotal] = useState(0);

  const location = useLocation();
  const theme = useTheme();

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch user currency and rate (same as AllMocks)
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

        // Reliable API
        const rateRes = await axios.get(`https://api.frankfurter.app/latest?from=INR&to=${currency}`);
        const rate = rateRes.data?.rates?.[currency] || 1;
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error fetching currency/rate:', error);
        setUserCurrency('INR');
        setExchangeRate(1);
      }
    };

    getUserCurrency();
  }, []);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlertMessage('Please log in to view your cart');
        setAlertSeverity('warning');
        setAlertOpen(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/user/cart`, {
          headers: { Authorization: token },
        });

        const formattedItems = response.data.cart.map((item) => ({
          id: item.mock_test_id,
          title: item.mock_tests.title,
          description: item.mock_tests.description || 'No description available',
          price: item.price, // Base INR price
          pricingType: item.mock_tests.pricing_type,
          currency: item.currency || 'INR', // From DB (added column)
        }));

        setCartItems(formattedItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        const msg = error.response?.data?.message || 'Failed to load cart';
        setAlertMessage(msg);
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [backendUrl]);

  // Calculate converted total for display
  useEffect(() => {
    const baseTotalINR = cartItems
      .filter((item) => item.pricingType === 'paid')
      .reduce((sum, item) => sum + item.price, 0);

    setConvertedTotal(baseTotalINR * exchangeRate);
  }, [cartItems, exchangeRate]);

  // Handle redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectStatus = params.get('redirect_status');

    if (redirectStatus === 'succeeded' && paymentMode) {
      setAlertMessage('Payment successful! Your purchase has been completed.');
      setAlertSeverity('success');
      setAlertOpen(true);
      handleFulfillment();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (redirectStatus === 'failed' && paymentMode) {
      setAlertMessage('Payment failed or was cancelled.');
      setAlertSeverity('error');
      setAlertOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search, paymentMode]);

  const handleRemoveItem = async (mockTestId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setOperationLoading(true);
    try {
      await axios.delete(`${backendUrl}/api/user/cart/remove/${mockTestId}`, {
        headers: { Authorization: token },
      });

      setCartItems((prev) => prev.filter((item) => item.id !== mockTestId));
      setAlertMessage('Item removed from cart');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      setAlertMessage(error.response?.data?.message || 'Failed to remove item');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token || cartItems.length === 0) return;

    const paidItemsExist = cartItems.some((item) => item.pricingType === 'paid');
    if (!paidItemsExist) {
      setAlertMessage('No paid items in your cart');
      setAlertSeverity('info');
      setAlertOpen(true);
      return;
    }

    setOperationLoading(true);
    try {
      // Send detected currency to backend
      const response = await axios.post(
        `${backendUrl}/api/payment/create-intent`,
        { currency: userCurrency },
        { headers: { Authorization: token } }
      );

      setClientSecret(response.data.clientSecret);
      setPaymentMode(true);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || 'Failed to start payment. Please try again.'
      );
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleFulfillment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(`${backendUrl}/api/user/checkout`, {}, {
        headers: { Authorization: token },
      });
      setCartItems([]);
      setPaymentMode(false);
      setClientSecret('');
    } catch (error) {
      console.error('Fulfillment error:', error);
      setAlertMessage('Failed to finalize purchase. Please refresh and try again.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  // Format prices with detected currency
  const formatPrice = (basePriceINR) => {
    const converted = basePriceINR * exchangeRate;
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(converted);
  };

  const formattedTotal = formatPrice(
    cartItems
      .filter((item) => item.pricingType === 'paid')
      .reduce((sum, item) => sum + item.price, 0)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <MotionContainer
      maxWidth="md"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ py: 6 }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 5,
          textAlign: 'center',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {paymentMode ? 'Complete Your Payment' : 'Your Shopping Cart'}
      </Typography>

      {cartItems.length === 0 ? (
        <MotionPaper elevation={6} variants={itemVariants} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            All paid mock tests have been successfully purchased!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.href = '/all-mocks'}
            sx={{ mt: 2 }}
          >
            Browse More Mock Tests
          </Button>
        </MotionPaper>
      ) : (
        <MotionPaper elevation={6} variants={itemVariants} sx={{ overflow: 'hidden' }}>
          {!paymentMode ? (
            <>
              <List>
                {cartItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body1"
                              color={item.pricingType === 'free' ? 'success.main' : 'text.primary'}
                              fontWeight="bold"
                            >
                              {item.pricingType === 'free' ? 'FREE' : formatPrice(item.price)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={operationLoading}
                        >
                          {operationLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
                <Typography variant="h5" align="right" gutterBottom>
                  Total to Pay: <strong>{formattedTotal}</strong>
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleProceedToPayment}
                  disabled={operationLoading || convertedTotal === 0}
                  startIcon={<PaymentIcon />}
                  sx={{ py: 1.8, fontSize: '1.1rem' }}
                >
                  {operationLoading ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : (
                    'Proceed to Secure Payment'
                  )}
                </Button>
              </Box>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <Box sx={{ p: 4 }}>
                <CheckoutForm
                  total={convertedTotal}
                  userCurrency={userCurrency}
                  onBack={() => {
                    setPaymentMode(false);
                    setClientSecret('');
                  }}
                  onSuccess={handleFulfillment}
                />
              </Box>
            </Elements>
          )}
        </MotionPaper>
      )}

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} variant="filled">
          {alertMessage}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default Cart;