import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const navigate = useNavigate();
  const theme = useTheme();

  const RAZORPAY_KEY_ID = process.env.REACT_APP_RZP_KEY; // Replace with your actual test/live key
  const backendUrl = process.env.REACT_APP_BACKEND_URL
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

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
        headers: { Authorization: token }
      });
      setCartItems(response.data.cart.map(item => ({
        id: item.mock_test_id,
        title: item.mock_tests.title,
        price: item.price, // or item.mock_tests.price if using mock_tests.price
        description: item.mock_tests.description
      })));
    } catch (error) {
      console.error('Error fetching cart:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to load cart');
      setAlertSeverity('error');
      setAlertOpen(true);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchCart();
}, [navigate]);

  const handleRemoveItem = async (mockTestId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertMessage('Please log in to modify your cart');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    setOperationLoading(true);
    try {
      await axios.delete(`${backendUrl}/api/user/cart/remove/${mockTestId}`, {
        headers: { Authorization: token }
      });

      setCartItems(cartItems.filter(item => item.id !== mockTestId));
      setAlertMessage('Item removed from cart');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      console.error('Error removing item:', error);
      setAlertMessage(error.response?.data?.message || 'Failed to remove item');
      setAlertSeverity('error');
      setAlertOpen(true);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertMessage('Please log in to proceed with checkout');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      setAlertMessage('Cart is empty');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    setOperationLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setAlertMessage('Failed to load payment gateway. Please check your internet connection.');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      const total = calculateTotal();
      if (total < 1) {
        setAlertMessage('Total amount must be at least ₹1');
        setAlertSeverity('error');
        setAlertOpen(true);
        return;
      }

      console.log('Creating order with amount:', total);
      const orderResponse = await axios.post(
        `${backendUrl}/api/payment/order`,
        { amount: total },
        { headers: { Authorization: token } }
      );
      console.log('Order Response:', orderResponse.data);

      const { id: order_id, amount, currency } = orderResponse.data;

      if (!order_id || !amount || !currency) {
        throw new Error('Invalid order response from server');
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'Mock Test Platform',
        description: 'Purchase of Mock Tests',
        order_id: order_id,
        handler: async function (response) {
          try {
            console.log('Payment Response:', response);
            const verifyResponse = await axios.post(
              `${backendUrl}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: token } }
            );

            if (verifyResponse.data.success) {
              await axios.post(`${backendUrl}/api/user/checkout`, {}, {
                headers: { Authorization: token }
              });

              setCartItems([]);
              setAlertMessage('Payment successful! You can now access your purchased tests.');
              setAlertSeverity('success');
              setAlertOpen(true);
              setTimeout(() => navigate('/all-mocks'), 2000);
            }
          } catch (error) {
            setAlertMessage(error.response?.data?.error || 'Payment verification failed');
            setAlertSeverity('error');
            setAlertOpen(true);
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
        theme: {
          color: theme.palette.primary.main
        }
      };

      console.log('Razorpay Options:', options);
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Checkout Error:', error);
      setAlertMessage(error.response?.data?.error || error.message || 'Payment initiation failed');
      setAlertSeverity('error');
      setAlertOpen(true);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MotionContainer
      maxWidth="md"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{ py: 4 }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          fontWeight: 700,
          background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Your Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <MotionPaper 
          elevation={3}
          variants={itemVariants}
          sx={{ p: 4, textAlign: 'center' }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Add some mock tests to get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/all-mocks')}
            sx={{ mt: 2 }}
          >
            Browse Mock Tests
          </Button>
        </MotionPaper>
      ) : (
        <MotionPaper elevation={3} variants={itemVariants}>
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
                    primary={item.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.primary">
                          Price: ₹{item.price}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
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
          <Box sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Total: ₹{calculateTotal()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PaymentIcon />}
              onClick={handleCheckout}
              disabled={operationLoading}
              fullWidth
            >
              {operationLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </Box>
        </MotionPaper>
      )}

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

export default Cart;