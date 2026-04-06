import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, Container, Button, List, ListItem, ListItemText,
  ListItemAvatar, ListItemSecondaryAction, Avatar, IconButton, Divider,
  Paper, CircularProgress, Snackbar, Alert, TextField, useTheme, Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement, Elements, useStripe, useElements, ExpressCheckoutElement,
} from '@stripe/react-stripe-js';
import { getCurrencyByCountry } from './getCurrencyByCountry';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);

/* ── Stripe checkout form (unchanged) ────────────────────────── */
const CheckoutForm = ({ displayTotal, userCurrency, onBack, onSuccess, showSnackbar }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + window.location.pathname + '?stripe_redirect=1',
      },
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message || 'Payment failed. Please try again.');
      setMessageType('error');
    } else if (paymentIntent?.status === 'succeeded') {
      setMessage('Payment successful! Unlocking your items...');
      setMessageType('success');
      await onSuccess();
      showSnackbar('Payment complete! Your purchases are now unlocked. 🎉', 'success');
    }
    setProcessing(false);
  };

  const formattedTotal = new Intl.NumberFormat(undefined, {
    style: 'currency', currency: userCurrency, minimumFractionDigits: 2,
  }).format(displayTotal);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <ExpressCheckoutElement options={{ buttonTheme: { applePay: 'black', googlePay: 'black' }, buttonType: { applePay: 'buy', googlePay: 'buy' } }} />
      <Box sx={{ my: 4 }}>
        <Typography variant="body1" align="center" color="text.secondary">or pay with card</Typography>
      </Box>
      <PaymentElement options={{ layout: 'tabs' }} />
      <Box sx={{ mt: 3, mb: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" />
          Your total is <strong>{formattedTotal}</strong> in {userCurrency}.
        </Typography>
      </Box>
      <Button type="submit" variant="contained" color="primary" fullWidth
        disabled={processing || !stripe || !elements}
        sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
        startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}>
        {processing ? 'Processing Payment...' : 'Complete Payment'}
      </Button>
      <Button variant="outlined" fullWidth onClick={onBack} disabled={processing}
        startIcon={<ArrowBackIcon />} sx={{ mt: 1 }}>
        Back to Cart
      </Button>
      {message && (
        <Alert severity={messageType === 'success' ? 'success' : 'error'}
          icon={messageType === 'success' ? <CheckCircleIcon /> : false} sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

/* ── Main Cart component ──────────────────────────────────────── */
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMode, setPaymentMode] = useState(false);
  const [userCountry, setUserCountry] = useState('IN');
  const [userCurrency, setUserCurrency] = useState('INR');
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const location = useLocation();
  const theme = useTheme();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  /* ── Currency detection ─────────────────────────────────────── */
  useEffect(() => {
    const getUserLocationAndCurrency = async () => {
      const savedCurrency = localStorage.getItem('userCurrency');
      const savedCountry = localStorage.getItem('userCountry');
      if (savedCurrency && savedCountry) {
        setUserCountry(savedCountry); setUserCurrency(savedCurrency); return;
      }
      try {
        const geoRes = await axios.get('https://ipapi.co/json/');
        const countryCode = geoRes.data.country_code || 'IN';
        const detectedCurrency = getCurrencyByCountry(countryCode);
        localStorage.setItem('userCurrency', detectedCurrency);
        localStorage.setItem('userCountry', countryCode);
        setUserCountry(countryCode); setUserCurrency(detectedCurrency);
      } catch {
        localStorage.setItem('userCurrency', 'INR');
        localStorage.setItem('userCountry', 'IN');
        setUserCurrency('INR'); setUserCountry('IN');
      }
    };
    getUserLocationAndCurrency();
  }, []);

  /* ── Stripe redirect handler ────────────────────────────────── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectStatus = params.get('redirect_status');
    const stripeRedirect = params.get('stripe_redirect');
    if (redirectStatus || stripeRedirect) {
      if (redirectStatus === 'succeeded' || stripeRedirect === '1') {
        showSnackbar('Payment successful! Your purchases are now unlocked. 🎉', 'success');
        handleFulfillment();
      } else if (redirectStatus === 'failed') {
        showSnackbar('Payment failed or was cancelled. Please try again.', 'error');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search]);

  /* ── Fetch cart ─────────────────────────────────────────────── */
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) { showSnackbar('Please log in to view your cart', 'warning'); setLoading(false); return; }
      try {
        const response = await axios.get(`${backendUrl}/api/user/cart`, { headers: { Authorization: token } });

        // Normalise both mock-test and interview rows into a unified shape
        const formattedItems = (response.data.cart || []).map((item) => {
          const isMock = item.item_type === 'mock_test' || (!item.item_type && item.mock_test_id);
          return {
            cartRowId:   item.id,
            id:          isMock ? item.mock_test_id : item.interview_id,
            itemType:    isMock ? 'mock_test' : 'interview',
            title:       isMock
              ? (item.mock_tests?.title   || 'Untitled Test')
              : (item.interviews?.title   || 'Untitled Interview'),
            description: isMock
              ? (item.mock_tests?.description   || '')
              : (item.interviews?.description   || ''),
            subtitle:    isMock ? null : (item.interviews?.job_role ? `Role: ${item.interviews.job_role}` : null),
            price:       item.price,
            currency:    item.currency || 'INR',
            pricingType: isMock
              ? (item.mock_tests?.pricing_type   || 'paid')
              : (item.interviews?.pricing_type   || 'paid'),
          };
        });

        setCartItems(formattedItems);
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Failed to load cart', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [backendUrl]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message); setSnackbarSeverity(severity); setSnackbarOpen(true);
  };

  /* ── Coupon handlers ────────────────────────────────────────── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { showSnackbar('Please enter a coupon code', 'warning'); return; }
    setApplyingCoupon(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/apply-coupon`,
        { code: couponCode.trim().toUpperCase() },
        { headers: { Authorization: token } }
      );
      setAppliedCoupon(response.data.coupon);
      showSnackbar(`Coupon ${response.data.coupon.code} applied! ${response.data.coupon.discount}% off`, 'success');
      setCouponCode('');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Invalid or expired coupon', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); showSnackbar('Coupon removed', 'info'); };

  /* ── Remove item (works for both types) ─────────────────────── */
  const handleRemoveItem = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setOperationLoading(true);
    try {
      if (item.itemType === 'mock_test') {
        await axios.delete(`${backendUrl}/api/user/cart/remove/${item.id}`, { headers: { Authorization: token } });
      } else {
        await axios.delete(`${backendUrl}/api/user/cart/remove-interview/${item.id}`, { headers: { Authorization: token } });
      }
      setCartItems((prev) => prev.filter((c) => !(c.id === item.id && c.itemType === item.itemType)));
      showSnackbar('Item removed from cart', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to remove item', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  /* ── Proceed to Stripe payment ──────────────────────────────── */
  const handleProceedToPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token || cartItems.length === 0) return;
    setOperationLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/payment/create-intent`,
        { currency: userCurrency.toLowerCase(), coupon_code: appliedCoupon?.code || null },
        { headers: { Authorization: token } }
      );
      setClientSecret(response.data.clientSecret);
      setPaymentMode(true);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to start payment. Please try again.', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  /* ── Fulfillment after Stripe success ───────────────────────── */
  const handleFulfillment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // Fulfill mock tests via existing checkout endpoint
      const mockItems = cartItems.filter(i => i.itemType === 'mock_test');
      if (mockItems.length > 0) {
        await axios.post(
          `${backendUrl}/api/user/checkout`,
          { coupon_code: appliedCoupon?.code || null },
          { headers: { Authorization: token } }
        );
      }
      setCartItems([]);
      setPaymentMode(false);
      setClientSecret('');
      setAppliedCoupon(null);
      showSnackbar('Purchase completed! Everything is unlocked.', 'success');
    } catch (error) {
      showSnackbar('Failed to finalize purchase. Please refresh.', 'error');
    }
  };

  /* ── Razorpay (INR only) ────────────────────────────────────── */
  const handleRazorpayPayment = async () => {
    if (userCurrency !== 'INR') {
      showSnackbar('Razorpay is only available for INR. Use card payment for other currencies.', 'info');
      return;
    }

    const totalINR = cartItems.filter(i => i.pricingType === 'paid').reduce((sum, i) => sum + (i.price || 0), 0);
    const discountedINR = appliedCoupon ? totalINR * (1 - appliedCoupon.discount / 100) : totalINR;
    const finalAmountINR = Math.max(0, Math.round(discountedINR));

    if (finalAmountINR === 0) { showSnackbar('No amount to pay after discount!', 'info'); return; }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) { showSnackbar('Failed to load payment gateway.', 'error'); return; }

    setRazorpayLoading(true);
    showSnackbar('Initializing UPI payment...', 'info');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/payment/razorpay/create-order`,
        { amount: finalAmountINR, coupon_code: appliedCoupon?.code || null },
        { headers: { Authorization: token } }
      );

      const { order } = response.data;

      const options = {
        key: process.env.REACT_APP_RZP_KEY,
        amount: order.amount,
        currency: 'INR',
        name: 'TechMocks',
        description: 'Purchase Mock Tests & Interviews',
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post(
              `${backendUrl}/api/payment/razorpay/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                coupon_code: appliedCoupon?.code || null,
              },
              { headers: { Authorization: token } }
            );
            showSnackbar('Payment successful! All your purchases are now unlocked. 🎉', 'success');
            setTimeout(() => window.location.reload(), 2000);
          } catch {
            showSnackbar('Payment verification failed.', 'error');
          }
        },
        prefill: {},
        theme: { color: '#7c6af7' },
        modal: {
          ondismiss: () => { showSnackbar('Payment cancelled.', 'info'); setRazorpayLoading(false); }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        showSnackbar(response.error?.description || 'Payment failed.', 'error');
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to start payment.', 'error');
      setRazorpayLoading(false);
    }
  };

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const formatPrice = (amount, currency = userCurrency) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency: currency || 'INR',
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const paidItems = cartItems.filter(i => i.pricingType === 'paid');
  const total = paidItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const discountedTotal = appliedCoupon ? total * (1 - appliedCoupon.discount / 100) : total;
  const finalTotal = Math.max(0, discountedTotal);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <MotionContainer maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" align="center" sx={{ mb: 5, fontWeight: 700 }}>
        {paymentMode ? 'Complete Your Payment' : 'Your Shopping Cart'}
      </Typography>

      {cartItems.length === 0 ? (
        <MotionPaper elevation={6} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => window.location.href = '/mocks'}>
              Browse Mock Tests
            </Button>
            <Button variant="outlined" size="large" onClick={() => window.location.href = '/interview'}>
              Browse Interviews
            </Button>
          </Box>
        </MotionPaper>
      ) : (
        <MotionPaper elevation={6} sx={{ overflow: 'hidden' }}>
          {!paymentMode ? (
            <>
              <List>
                {cartItems.map((item, index) => (
                  <React.Fragment key={`${item.itemType}-${item.id}`}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: item.itemType === 'interview' ? '#7c6af7' : theme.palette.primary.main }}>
                          {item.itemType === 'interview' ? <RecordVoiceOverIcon /> : <AssignmentIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" fontWeight="medium">{item.title}</Typography>
                            <Chip
                              label={item.itemType === 'interview' ? 'Interview' : 'Mock Test'}
                              size="small"
                              sx={{
                                bgcolor: item.itemType === 'interview'
                                  ? 'rgba(124,106,247,0.12)' : 'rgba(99,102,241,0.10)',
                                color: item.itemType === 'interview' ? '#7c6af7' : 'primary.main',
                                fontWeight: 600, fontSize: 11,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            {item.description && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                                {item.description}
                              </Typography>
                            )}
                            {item.subtitle && (
                              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                                {item.subtitle}
                              </Typography>
                            )}
                            <Typography
                              component="span" variant="body1" fontWeight="bold"
                              color={item.pricingType === 'free' ? 'success.main' : 'text.primary'}
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {item.pricingType === 'free' ? 'FREE' : formatPrice(item.price, item.currency)}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveItem(item)} disabled={operationLoading}>
                          {operationLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Summary banner */}
              <Box sx={{ px: 3, py: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">
                  {cartItems.filter(i => i.itemType === 'mock_test').length} mock test{cartItems.filter(i => i.itemType === 'mock_test').length !== 1 ? 's' : ''}
                  {' · '}
                  {cartItems.filter(i => i.itemType === 'interview').length} interview{cartItems.filter(i => i.itemType === 'interview').length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
                {/* Coupon */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" /> Have a coupon?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small" placeholder="Enter coupon code"
                      value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={applyingCoupon || !!appliedCoupon} sx={{ flexGrow: 1 }}
                    />
                    {appliedCoupon ? (
                      <Button variant="outlined" color="error" onClick={handleRemoveCoupon}>Remove</Button>
                    ) : (
                      <Button variant="contained" onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}>
                        {applyingCoupon ? <CircularProgress size={20} /> : 'Apply'}
                      </Button>
                    )}
                  </Box>
                  {appliedCoupon && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                      ✓ {appliedCoupon.code} applied — {appliedCoupon.discount}% off!
                    </Typography>
                  )}
                </Box>

                {/* Totals */}
                <Box sx={{ mb: 3 }}>
                  {appliedCoupon && total > finalTotal && (
                    <Typography variant="body1" align="right"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                      Original: {formatPrice(total)}
                    </Typography>
                  )}
                  <Typography variant="h5" align="right" gutterBottom>
                    Total: <strong>{formatPrice(finalTotal)}</strong>
                  </Typography>
                </Box>

                {/* Payment buttons */}
                {userCurrency === 'INR' ? (
                  <Button variant="contained" color="success" size="large" fullWidth
                    onClick={handleRazorpayPayment}
                    disabled={razorpayLoading || operationLoading || finalTotal === 0}
                    startIcon={razorpayLoading ? <CircularProgress size={28} color="inherit" /> : <PaymentIcon />}
                    sx={{ py: 1.8, fontSize: '1.1rem' }}>
                    {razorpayLoading ? 'Opening UPI...' : 'Pay with UPI / Cards (Razorpay)'}
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" size="large" fullWidth
                    onClick={handleProceedToPayment}
                    disabled={operationLoading || finalTotal === 0}
                    startIcon={<PaymentIcon />}
                    sx={{ py: 1.8, fontSize: '1.1rem' }}>
                    {operationLoading ? <CircularProgress size={28} color="inherit" /> : 'Pay with Card / Wallet (Stripe)'}
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <Box sx={{ p: 4 }}>
                <CheckoutForm
                  displayTotal={finalTotal}
                  userCurrency={userCurrency}
                  onBack={() => { setPaymentMode(false); setClientSecret(''); }}
                  onSuccess={handleFulfillment}
                  showSnackbar={showSnackbar}
                />
              </Box>
            </Elements>
          )}
        </MotionPaper>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}
          variant="filled" sx={{ width: '100%', fontSize: '1rem' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MotionContainer>
  );
};

export default Cart;