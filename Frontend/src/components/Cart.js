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
import InfoIcon from '@mui/icons-material/Info';

// Stripe imports
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from '@stripe/react-stripe-js';
import countryToCurrency from 'country-to-currency';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

const CheckoutForm = ({
  displayTotal,
  userCurrency,
  gbpTotal,
  gbpRate,
  onBack,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Payment failed. Please try again.');
      setMessageType('error');
    } else {
      setMessage('Payment successful! Finalizing your purchase...');
      setMessageType('success');
      await onSuccess();
      setMessage('Payment complete! Your mock tests are now unlocked. 🎉');
    }

    setProcessing(false);
  };

  // Formatters (unchanged)
  const localFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: userCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const formattedDisplayTotal = localFormatter.format(displayTotal);

  const gbpFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedGbpTotal = gbpFormatter.format(gbpTotal);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {/* ADD THIS: Express Checkout for Google Pay, Apple Pay, PayPal */}
      <ExpressCheckoutElement
        onConfirm={async () => {
          // Optional: Handle express checkout confirmation if needed
          // Usually not required — Stripe handles it automatically
        }}
        options={{
          buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
          },
          buttonType: {
            applePay: 'buy',
            googlePay: 'buy',
          },
        }}
      />

      <Box sx={{ my: 4 }}>
        <Typography variant="body1" align="center" color="text.secondary">
          or pay with card
        </Typography>
      </Box>

      {/* Keep PaymentElement for card and other methods */}
      <PaymentElement
        options={{
          layout: 'tabs',
          // Remove the deprecated wallets option
        }}
      />

      <Box sx={{ mt: 3, mb: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" />
          Your total is <strong>{formattedDisplayTotal}</strong> ({userCurrency}) in your local currency.
          This will be charged as approximately <strong>{formattedGbpTotal}</strong> in <strong>GBP</strong>.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Your bank or card may apply additional conversion fees. Exchange rate used: 1 INR ≈ {gbpRate.toFixed(4)} GBP.
        </Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={processing || !stripe || !elements}
        sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
        startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
      >
        {processing ? 'Processing Payment...' : 'Complete Payment'}
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const [clientSecret, setClientSecret] = useState('');
  const [paymentMode, setPaymentMode] = useState(false);

  const [userCurrency, setUserCurrency] = useState('INR');
  const [displayRate, setDisplayRate] = useState(1);
  const [gbpRate, setGbpRate] = useState(0.0082);

  const location = useLocation();
  const theme = useTheme();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const getCurrencyAndRates = async () => {
      try {
        const geoRes = await axios.get('https://ipapi.co/json/');
        const countryCode = geoRes.data.country_code || 'IN';
        const currency = countryToCurrency[countryCode] || 'INR';
        setUserCurrency(currency);

        if (currency !== 'INR') {
          const displayRes = await axios.get(`https://api.frankfurter.app/latest?from=INR&to=${currency}`);
          setDisplayRate(displayRes.data?.rates?.[currency] || 1);
        } else {
          setDisplayRate(1);
        }

        const gbpRes = await axios.get('https://api.frankfurter.app/latest?from=INR&to=GBP');
        const rate = gbpRes.data?.rates?.GBP || 0.0082;
        setGbpRate(rate);
      } catch (error) {
        console.error('Error fetching currency/rates:', error);
        setUserCurrency('INR');
        setDisplayRate(1);
        setGbpRate(0.0082);
      }
    };

    getCurrencyAndRates();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Please log in to view your cart', 'warning');
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
          price: item.price,
          pricingType: item.mock_tests.pricing_type,
        }));

        setCartItems(formattedItems);
      } catch (error) {
        console.error('Error fetching cart:', error);
        showSnackbar(error.response?.data?.message || 'Failed to load cart', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [backendUrl]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectStatus = params.get('redirect_status');

    if (redirectStatus === 'succeeded' && paymentMode) {
      showSnackbar('Payment successful! Your mock tests have been unlocked. 🎉', 'success');
      handleFulfillment();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (redirectStatus === 'failed' && paymentMode) {
      showSnackbar('Payment failed or was cancelled. Please try again.', 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search, paymentMode]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleRemoveItem = async (mockTestId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setOperationLoading(true);
    try {
      await axios.delete(`${backendUrl}/api/user/cart/remove/${mockTestId}`, {
        headers: { Authorization: token },
      });

      setCartItems((prev) => prev.filter((item) => item.id !== mockTestId));
      showSnackbar('Item removed from cart', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to remove item', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token || cartItems.length === 0) return;

    const paidItems = cartItems.filter((item) => item.pricingType === 'paid');
    if (paidItems.length === 0) {
      showSnackbar('No paid items in your cart', 'info');
      return;
    }

    setOperationLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/payment/create-intent`,
        { currency: 'gbp' },
        { headers: { Authorization: token } }
      );

      setClientSecret(response.data.clientSecret);
      setPaymentMode(true);
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Failed to start payment. Please try again.',
        'error'
      );
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
      showSnackbar('Failed to finalize purchase. Please refresh.', 'error');
    }
  };

  const formatPrice = (basePriceINR) => {
    const converted = basePriceINR * displayRate;
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(converted);
  };

  const baseTotalINR = cartItems
    .filter((item) => item.pricingType === 'paid')
    .reduce((sum, item) => sum + item.price, 0);

  const displayTotal = baseTotalINR * displayRate;
  const gbpTotal = baseTotalINR * gbpRate;
  const formattedTotal = formatPrice(baseTotalINR);

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
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.href = '/mocks'}
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
                  Total: <strong>{formattedTotal}</strong>
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleProceedToPayment}
                  disabled={operationLoading || baseTotalINR === 0}
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
                  displayTotal={displayTotal}
                  userCurrency={userCurrency}
                  gbpTotal={gbpTotal}
                  gbpRate={gbpRate}
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
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default Cart;