import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Container,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Grow,
  Modal,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('sendOtp'); // 'sendOtp', 'verifyOtp', 'resetPassword'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);
  const navigate = useNavigate();

  // Animation states
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  // Responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    setTimeout(() => setAnimateTitle(true), 300);
    setTimeout(() => setAnimateForm(true), 800);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('role', response.data.role);

      setTimeout(() => {
        setIsLoading(false);
        navigate('/hello');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleForgotPasswordOpen = () => {
    setOpenForgotPassword(true);
    setForgotPasswordStep('sendOtp');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleForgotPasswordClose = () => {
    setOpenForgotPassword(false);
    setForgotPasswordStep('sendOtp');
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSendOtp = async () => {
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    try {
      await axios.post(`${backendUrl}/api/auth/send-otp`, { email });
      setForgotPasswordSuccess('OTP sent to your email');
      setForgotPasswordStep('verifyOtp');
    } catch (error) {
      setForgotPasswordError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    try {
      await axios.post(`${backendUrl}/api/auth/verify-otp`, { email, otp });
      setForgotPasswordSuccess('OTP verified successfully');
      setForgotPasswordStep('resetPassword');
    } catch (error) {
      setForgotPasswordError(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleResetPassword = async () => {
    setForgotPasswordError(null);
    setForgotPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setForgotPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      setForgotPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(`${backendUrl}/api/auth/reset-password`, { email, newPassword });
      setForgotPasswordSuccess('Password reset successfully');
      setTimeout(() => {
        handleForgotPasswordClose();
      }, 2000);
    } catch (error) {
      setForgotPasswordError(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'auto' : 'hidden',
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
        py: isMobile ? 2 : 0,
      }}
    >
      <Grid container component="main" sx={{ minHeight: '100vh' }}>
        {/* Left Section - Branding */}
        {!isMobile && (
          <Grid
            item
            xs={false}
            sm={5}
            md={6}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              borderRadius: { md: '0 30px 30px 0' },
              boxShadow: { md: '15px 0 25px rgba(0, 0, 0, 0.1)' },
            }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 2 }}
              sx={{
                position: 'absolute',
                width: '200%',
                height: '200%',
                background:
                  'radial-gradient(circle, transparent 20%, #1565c0 20%, #1565c0 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #1565c0 20%, #1565c0 80%, transparent 80%, transparent) 50px 50px, linear-gradient(#104aa1 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #104aa1 8px, transparent 8px) -4px 0',
                backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
                transform: 'rotate(10deg) scale(1.5)',
                zIndex: 0,
              }}
            />
            <Grow in={animateTitle} timeout={1000}>
              <Box sx={{ zIndex: 1, textAlign: 'center', px: 2 }}>
                <Typography
                  variant="h1"
                  component={motion.div}
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '4.5rem' },
                    letterSpacing: '-0.05em',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                    mb: 2,
                  }}
                >
                  TechMock
                </Typography>
                <Typography
                  variant="h6"
                  component={motion.div}
                  sx={{
                    opacity: 0.9,
                    maxWidth: '80%',
                    mx: 'auto',
                    fontWeight: 300,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  }}
                >
                  Your gateway to technical excellence
                </Typography>
              </Box>
            </Grow>
          </Grid>
        )}

        {/* Right Section (Login Form) */}
        <Grid
          item
          xs={12}
          sm={isMobile ? 12 : 7}
          md={isMobile ? 12 : 6}
          component={Paper}
          elevation={0}
          square
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'transparent',
            px: isMobile ? 1 : 0,
          }}
        >
          <Container maxWidth={isMobile ? 'sm' : 'xs'}>
            {/* Mobile Brand Header */}
            {isMobile && (
              <Grow in={animateTitle} timeout={1000}>
                <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
                  <Typography
                    variant="h3"
                    component={motion.div}
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      letterSpacing: '-0.05em',
                      background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    TechMock
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: '#1976d2',
                      fontWeight: 400,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    }}
                  >
                    Your gateway to technical excellence
                  </Typography>
                </Box>
              </Grow>
            )}

            <Fade in={animateForm} timeout={1000}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: '15px', sm: '20px' },
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: { 
                    xs: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    sm: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  },
                  mx: { xs: 1, sm: 0 },
                }}
              >
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#1976d2',
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                    textAlign: 'center',
                  }}
                >
                  Welcome Back
                </Typography>

                {message && (
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      mb: { xs: 2, sm: 3 },
                      width: '100%',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      border: '1px solid rgba(211, 47, 47, 0.3)',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="error" 
                      align="center"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {message}
                    </Typography>
                  </Box>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: '8px', sm: '10px' },
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: isMobile ? 'none' : 'translateY(-2px)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: { xs: '12px', sm: '16.5px' },
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            size={isMobile ? "small" : "medium"}
                          >
                            {showPassword ? 
                              <VisibilityOff sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} /> : 
                              <Visibility sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                            }
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: { xs: '8px', sm: '10px' },
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: isMobile ? 'none' : 'translateY(-2px)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        py: { xs: '12px', sm: '16.5px' },
                      },
                    }}
                  />
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="primary"
                      component={motion.div}
                      whileHover={{ scale: isMobile ? 1 : 1.05 }}
                      sx={{
                        display: 'inline-block',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        py: 1,
                      }}
                      onClick={handleForgotPasswordOpen}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  <Button
                    component={motion.button}
                    whileHover={{ scale: isMobile ? 1 : 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: { xs: 2, sm: 3 },
                      mb: { xs: 2, sm: 3 },
                      py: { xs: 1.2, sm: 1.5 },
                      borderRadius: { xs: '8px', sm: '10px' },
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isLoading ? 'Signing in...' : (
                      <>
                        Sign In
                        <LoginIcon sx={{ ml: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />
                      </>
                    )}
                  </Button>
                  <Divider sx={{ my: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      OR
                    </Typography>
                  </Divider>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: isMobile ? 1 : 1.02 }}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      py: 1,
                    }}
                    onClick={() => navigate('/register')}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        textAlign: 'center',
                      }}
                    >
                      New to TechMock? Register Here
                      <ArrowForward fontSize="small" />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Grid>
      </Grid>

      {/* Forgot Password Modal */}
      <Modal open={openForgotPassword} onClose={handleForgotPasswordClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            maxWidth: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
            borderRadius: { xs: '15px', sm: '10px' },
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: '#1976d2',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              textAlign: 'center',
            }}
          >
            {forgotPasswordStep === 'sendOtp'
              ? 'Forgot Password'
              : forgotPasswordStep === 'verifyOtp'
              ? 'Verify OTP'
              : 'Reset Password'}
          </Typography>

          {forgotPasswordError && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2, 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                textAlign: 'center',
                p: 1,
                borderRadius: '5px',
                bgcolor: 'rgba(211, 47, 47, 0.1)',
              }}
            >
              {forgotPasswordError}
            </Typography>
          )}
          {forgotPasswordSuccess && (
            <Typography 
              color="success.main" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                textAlign: 'center',
                p: 1,
                borderRadius: '5px',
                bgcolor: 'rgba(76, 175, 80, 0.1)',
              }}
            >
              {forgotPasswordSuccess}
            </Typography>
          )}

          <Stack spacing={2}>
            {forgotPasswordStep === 'sendOtp' && (
              <>
                <TextField
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={!email}
                  sx={{ 
                    borderRadius: '10px',
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  Send OTP
                </Button>
              </>
            )}

            {forgotPasswordStep === 'verifyOtp' && (
              <>
                <TextField
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={!otp}
                  sx={{ 
                    borderRadius: '10px',
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  Verify OTP
                </Button>
              </>
            )}

            {forgotPasswordStep === 'resetPassword' && (
              <>
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  }}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleResetPassword}
                  disabled={!newPassword || !confirmPassword}
                  sx={{ 
                    borderRadius: '10px',
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  Reset Password
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Login;