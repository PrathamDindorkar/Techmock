import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  Container,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Slide,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility, 
  VisibilityOff,
  VpnKey as OtpIcon,
  ArrowBack,
  HowToReg as RegisterIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error'); // 'error' or 'success'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Animation states
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);

  useEffect(() => {
    // Trigger animations sequentially
    setTimeout(() => setAnimateTitle(true), 300);
    setTimeout(() => setAnimateForm(true), 800);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSendOtp = async () => {
    if (!name || !email || !password) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      setMessage(response.data.message);
      setMessageType('success');
      setOtpSent(true);
      setActiveStep(1);
      setIsLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send OTP');
      setMessageType('error');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !otp) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      // First verify OTP
      const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp,
      });

      if (verifyResponse.data.message === 'OTP verified successfully') {
        // Then proceed with registration
        const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
          name,
          email,
          password,
        });
        
        setMessage('Registration successful! Redirecting to login...');
        setMessageType('success');
        setActiveStep(2);
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      setIsLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
      setMessageType('error');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setActiveStep(0);
    setOtp('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
      }}
    >
      <Grid container component="main" sx={{ height: '100vh' }}>
        {/* Right Branding Section */}
        <Grid
          item
          xs={false}
          sm={4}
          md={6}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            borderRadius: { md: '30px 0 0 30px' },
            boxShadow: { md: '-15px 0 25px rgba(0, 0, 0, 0.1)' },
            order: { xs: 1, sm: 2 }
          }}
        >
          {/* Animated background elements */}
          <Box 
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2 }}
            sx={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, transparent 20%, #ff416c 20%, #ff416c 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ff416c 20%, #ff416c 80%, transparent 80%, transparent) 50px 50px, linear-gradient(#ff4b2b 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #ff4b2b 8px, transparent 8px) -4px 0',
              backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
              transform: 'rotate(10deg) scale(1.5)',
              zIndex: 0,
            }}
          />
          
          <Zoom in={animateTitle} timeout={1000}>
            <Box sx={{ zIndex: 1, textAlign: 'center' }}>
              <Typography
                variant="h1"
                component={motion.div}
                sx={{ 
                  fontWeight: 900, 
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  letterSpacing: '-0.05em',
                  textShadow: '3px 3px 6px rgba(0, 0, 0, 0.3)',
                  mb: 2
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
                  fontWeight: 300
                }}
              >
                Join our community of tech professionals
              </Typography>
            </Box>
          </Zoom>

          {/* Animated illustrative elements */}
          <Box 
            component={motion.div}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            sx={{ 
              mt: 6, 
              display: { xs: 'none', md: 'block' },
              zIndex: 1
            }}
          >
            <Box
              sx={{
                p: 3,
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                maxWidth: '300px'
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                Benefits of joining:
              </Typography>
              {['Practice technical interviews', 'Connect with peers', 'Access exclusive resources'].map((benefit, index) => (
                <Box 
                  key={index}
                  component={motion.div}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2 + (index * 0.2) }}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1.5 
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      bgcolor: 'white', 
                      mr: 1.5 
                    }} 
                  />
                  <Typography variant="body2">
                    {benefit}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Left Form Section */}
        <Grid
          item
          xs={12}
          sm={8}
          md={6}
          component={Paper}
          elevation={0}
          square
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            background: 'transparent',
            order: { xs: 2, sm: 1 }
          }}
        >
          <Container maxWidth="xs">
            <Fade in={animateForm} timeout={1000}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4,
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography 
                  component="h1" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#ff416c',
                    mb: 3
                  }}
                >
                  {otpSent ? 'Verify OTP' : 'Create Account'}
                </Typography>

                <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
                  <Step>
                    <StepLabel>Account</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Verify</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Complete</StepLabel>
                  </Step>
                </Stepper>
                
                {message && (
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                      p: 2,
                      mb: 3,
                      width: '100%',
                      borderRadius: '8px',
                      backgroundColor: messageType === 'error' 
                        ? 'rgba(211, 47, 47, 0.1)' 
                        : 'rgba(46, 125, 50, 0.1)',
                      border: messageType === 'error' 
                        ? '1px solid rgba(211, 47, 47, 0.3)' 
                        : '1px solid rgba(46, 125, 50, 0.3)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={messageType === 'error' ? 'error' : 'success.main'}
                      align="center"
                    >
                      {message}
                    </Typography>
                  </Box>
                )}
                
                <Box 
                  component="form" 
                  noValidate 
                  onSubmit={handleRegister} 
                  sx={{ mt: 1, width: '100%' }}
                >
                  <Slide direction="right" in={!otpSent} mountOnEnter unmountOnExit>
                    <Box>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={otpSent}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          },
                        }}
                      />
                      
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={otpSent}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={otpSent}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          },
                        }}
                      />
                      
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        fullWidth
                        variant="contained"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        sx={{
                          mt: 3,
                          mb: 3,
                          py: 1.5,
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '1rem',
                          background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
                          boxShadow: '0 4px 20px rgba(255, 65, 108, 0.4)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </Box>
                  </Slide>
                  
                  <Slide direction="left" in={otpSent} mountOnEnter unmountOnExit>
                    <Box>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="otp"
                        label="Enter OTP"
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <OtpIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                          },
                        }}
                      />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        We've sent a verification code to {email}. Please enter the code to continue.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          variant="outlined"
                          onClick={handleBack}
                          startIcon={<ArrowBack />}
                          sx={{
                            mt: 1,
                            mb: 2,
                            py: 1.5,
                            borderRadius: '10px',
                            fontWeight: 600,
                            flexGrow: 1
                          }}
                        >
                          Back
                        </Button>
                        
                        <Button
                          component={motion.button}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          variant="contained"
                          disabled={isLoading}
                          endIcon={<RegisterIcon />}
                          sx={{
                            mt: 1,
                            mb: 2,
                            py: 1.5,
                            borderRadius: '10px',
                            fontWeight: 600,
                            background: 'linear-gradient(90deg, #ff416c, #ff4b2b)',
                            boxShadow: '0 4px 20px rgba(255, 65, 108, 0.4)',
                            flexGrow: 2
                          }}
                        >
                          {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            'Register'
                          )}
                        </Button>
                      </Box>
                    </Box>
                  </Slide>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR
                    </Typography>
                  </Divider>
                  
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/login')}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: '#ff416c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      Already have an account? Login here
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;