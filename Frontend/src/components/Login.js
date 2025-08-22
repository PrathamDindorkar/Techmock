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
  Grow
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility, 
  VisibilityOff,
  Login as LoginIcon,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Save the JWT token and role to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', response.data.email);
      localStorage.setItem('role', response.data.role);

      // Short delay to show loading effect
      setTimeout(() => {
        setIsLoading(false);
        navigate('/hello');
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      setMessage(error.response?.data?.message || 'An error occurred');
    }
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
        {/* Left Section - Branding */}
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
              background: 'radial-gradient(circle, transparent 20%, #1565c0 20%, #1565c0 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #1565c0 20%, #1565c0 80%, transparent 80%, transparent) 50px 50px, linear-gradient(#104aa1 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #104aa1 8px, transparent 8px) -4px 0',
              backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
              transform: 'rotate(10deg) scale(1.5)',
              zIndex: 0,
            }}
          />
          
          <Grow in={animateTitle} timeout={1000}>
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
                Your gateway to technical excellence
              </Typography>
            </Box>
          </Grow>
        </Grid>

        {/* Right Section (Login Form) */}
        <Grid
          item
          xs={12}
          sm={7}
          md={6}
          component={Paper}
          elevation={0}
          square
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'transparent'
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
                    color: '#1976d2',
                    mb: 3
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
                      p: 2,
                      mb: 3,
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
                    >
                      {message}
                    </Typography>
                  </Box>
                )}
                
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 1, width: '100%' }}
                >
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Typography 
                      variant="body2" 
                      color="primary"
                      component={motion.div}
                      whileHover={{ scale: 1.05 }}
                      sx={{ 
                        display: 'inline-block',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>
                  
                  <Button
                    component={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      mb: 3,
                      py: 1.5,
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {isLoading ? 'Signing in...' : (
                      <>
                        Sign In
                        <LoginIcon sx={{ ml: 1 }} />
                      </>
                    )}
                  </Button>
                  
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
                    onClick={() => navigate("/register")}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: '#1976d2',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
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
    </Box>
  );
};

export default Login;