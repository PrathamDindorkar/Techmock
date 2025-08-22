import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, TextField, Stack, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Profile = ({ darkMode }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    fullName: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [purchasedTests, setPurchasedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [activeSection, setActiveSection] = useState('My Profile'); // Track active section
  const token = localStorage.getItem('token');

  // Dynamically set colors based on darkMode prop
  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const cardBgColor = darkMode ? '#1e1e1e' : 'white';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';
  const textSecondary = darkMode ? '#aaaaaa' : 'text.secondary';
  const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: token },
        });
        const { name, email, purchasedTests } = response.data;
        setUserData({
          username: name.split(' ')[0] || '',
          fullName: name || '',
          email: email || '',
        });
        setPurchasedTests(purchasedTests || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile. Please try again later.');
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleEditPasswordToggle = () => {
    setIsEditingPassword(!isEditingPassword);
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setActiveSection('Change Password');
  };

  const handleEditPaymentToggle = () => {
    setIsEditingPayment(!isEditingPayment);
    setPaymentData({ cardNumber: '', expiryDate: '', cvv: '' });
    setActiveSection('Payment Information');
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/user/profile',
        {
          name: userData.fullName,
          email: userData.email,
        },
        { headers: { Authorization: token } }
      );
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(
        'http://localhost:5000/api/user/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: token } }
      );
      setPasswordSuccess('Password updated successfully!');
      setIsEditingPassword(false);
      setActiveSection('My Profile');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  const handleSavePayment = async () => {
    // Placeholder for payment save logic (e.g., API call to save card details)
    try {
      // Example API call (implement backend endpoint /api/user/payment)
      await axios.put(
        'http://localhost:5000/api/user/payment',
        {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv,
        },
        { headers: { Authorization: token } }
      );
      setIsEditingPayment(false);
      alert('Payment information updated successfully!');
      setActiveSection('My Profile');
    } catch (error) {
      console.error('Error updating payment:', error);
      setError(error.response?.data?.message || 'Failed to update payment information. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, type: 'spring', stiffness: 120 },
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        p: 3,
        bgcolor: bgColor,
        color: textPrimary,
        minHeight: '90vh',
        display: 'flex',
        gap: 4,
      }}
    >
      {/* Left Sidebar for Navigation Labels */}
      <Box
        sx={{
          width: 200,
          bgcolor: darkMode ? '#1e1e1e' : '#e3f2fd',
          borderRadius: 1,
          p: 2,
          position: 'sticky',
          top: 20,
        }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {['My Profile', 'Change Password', 'Purchased Tests', 'Payment Information'].map((item, index) => (
            <Typography
              key={index}
              variant="body1"
              onClick={() => setActiveSection(item)}
              sx={{
                mb: 2,
                color: textPrimary,
                fontWeight: activeSection === item ? 'bold' : 'normal',
                cursor: 'pointer',
                '&:hover': { color: darkMode ? '#bbdefb' : '#1976d2' },
              }}
            >
              {item}
            </Typography>
          ))}
        </motion.div>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Personal Info Section */}
          {activeSection === 'My Profile' && (
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, bgcolor: cardBgColor, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: textPrimary }}>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
                    <Avatar
                      sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}
                      src="/path-to-avatar-image.jpg"
                    >
                      {userData.fullName.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: textPrimary }}>
                        {userData.fullName || 'User'}
                      </Typography>
                      <Typography variant="body1" color={textSecondary}>
                        {userData.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    <TextField
                      label="Username*"
                      name="username"
                      value={userData.username}
                      onChange={handleProfileInputChange}
                      disabled={!isEditingProfile}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="Full Name*"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleProfileInputChange}
                      disabled={!isEditingProfile}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="Email*"
                      name="email"
                      value={userData.email}
                      onChange={handleProfileInputChange}
                      disabled={!isEditingProfile}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                  </Stack>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={isEditingProfile ? handleSaveProfile : handleEditProfileToggle}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      {isEditingProfile ? 'Save' : 'Edit'}
                    </Button>
                    {isEditingProfile && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditProfileToggle}
                        sx={{ ml: 2, borderRadius: 2, px: 3 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Change Password Section */}
          {activeSection === 'Change Password' && (
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, bgcolor: cardBgColor, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: textPrimary }}>
                    Change Password
                  </Typography>
                  {passwordError && <Typography color="error" sx={{ mb: 2 }}>{passwordError}</Typography>}
                  {passwordSuccess && <Typography color="success.main" sx={{ mb: 2 }}>{passwordSuccess}</Typography>}
                  <Stack spacing={2}>
                    <TextField
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      disabled={!isEditingPassword}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      disabled={!isEditingPassword}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      disabled={!isEditingPassword}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                  </Stack>
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={isEditingPassword ? handleSavePassword : handleEditPasswordToggle}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      {isEditingPassword ? 'Save Password' : 'Change Password'}
                    </Button>
                    {isEditingPassword && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditPasswordToggle}
                        sx={{ ml: 2, borderRadius: 2, px: 3 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Purchased Tests Section */}
          {activeSection === 'Purchased Tests' && (
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, bgcolor: cardBgColor, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: textPrimary }}>
                    Purchased Tests
                  </Typography>
                  {purchasedTests.length > 0 ? (
                    <Stack spacing={2}>
                      {purchasedTests.map((test, index) => (
                        <Card
                          key={index}
                          sx={{ p: 2, bgcolor: cardBgColor, borderRadius: 1, boxShadow: `0 1px 2px ${borderColor}` }}
                        >
                          <Typography variant="body1" color={textPrimary}>
                            {test.title} - {test.questions.length} Questions
                          </Typography>
                          <Typography variant="body2" color={textSecondary}>
                            Category: {test.category}
                          </Typography>
                        </Card>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1" color={textSecondary}>
                      No purchased tests yet. Visit the store to buy some!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Information Section */}
          {activeSection === 'Payment Information' && (
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, bgcolor: cardBgColor, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: textPrimary }}>
                    Payment Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Card Number"
                      name="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={handlePaymentInputChange}
                      disabled={!isEditingPayment}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="Expiry Date (MM/YY)"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentInputChange}
                      disabled={!isEditingPayment}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                    <TextField
                      label="CVV"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentInputChange}
                      disabled={!isEditingPayment}
                      variant="outlined"
                      fullWidth
                      sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
                    />
                  </Stack>
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={isEditingPayment ? handleSavePayment : handleEditPaymentToggle}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      {isEditingPayment ? 'Save Payment' : 'Add Card'}
                    </Button>
                    {isEditingPayment && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditPaymentToggle}
                        sx={{ ml: 2, borderRadius: 2, px: 3 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Logout Button */}
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Logout
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default Profile;