import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import { alpha } from '@mui/material/styles'; // Add alpha here

const Profile = ({ darkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [userRank, setUserRank] = useState({ rank: 'Beginner', points: 0 });
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [activeSection, setActiveSection] = useState('My Profile');
  const token = localStorage.getItem('token');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Rank number mapping
  const getRankNumber = (rank) => {
    const rankMap = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
      Master: 5,
    };
    return rankMap[rank] || 1;
  };

  // Rank color mapping
  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master': return '#FFD700';
      case 'Expert': return '#C0C0C0';
      case 'Advanced': return '#CD7F32';
      case 'Intermediate': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  // Fetch profile, rank, and badges
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileResponse, rankResponse, badgesResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: token },
          }),
          axios.get(`${backendUrl}/api/user/rank`, {
            headers: { Authorization: token },
          }),
          axios.get(`${backendUrl}/api/user/badges`, {
            headers: { Authorization: token },
          }),
        ]);
        const { name, email, purchasedTests } = profileResponse.data;
        setUserData({
          username: name.split(' ')[0] || '',
          fullName: name || '',
          email: email || '',
        });
        setPurchasedTests(purchasedTests || []);
        setUserRank(rankResponse.data || { rank: 'Beginner', points: 0 });
        setBadges(Array.isArray(badgesResponse.data) ? badgesResponse.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch profile data. Please try again later.');
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
    setActiveSection('My Profile');
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
        `${backendUrl}/api/user/profile`,
        {
          name: userData.fullName,
          email: userData.email,
        },
        { headers: { Authorization: token } }
      );
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
      setActiveSection('My Profile');
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
        `${backendUrl}/api/user/change-password`,
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
    try {
      await axios.put(
        `${backendUrl}/api/user/payment`,
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, type: 'spring', stiffness: 120 },
    },
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3, type: 'spring', stiffness: 200 },
    }),
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.palette.background.default }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 2, md: 3 },
        bgcolor: theme.palette.background.default,
        minHeight: '90vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 4 },
      }}
    >
      {/* Left Sidebar for Navigation Labels */}
      <Box
        sx={{
          width: { xs: '100%', md: 250 },
          bgcolor: theme.palette.background.default,
          borderRadius: 2,
          p: 2,
          position: { xs: 'static', md: 'sticky' },
          top: 20,
          boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          overflowY: 'auto',
        }}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {['My Profile', 'Badges & Achievements', 'Change Password', 'Purchased Tests', 'Payment Information'].map((item) => (
            <Typography
              key={item}
              variant="body1"
              onClick={() => setActiveSection(item)}
              sx={{
                mb: 2,
                p: 1,
                borderRadius: 1,
                color: activeSection === item ? theme.palette.primary.main : theme.palette.text.primary,
                fontWeight: activeSection === item ? 'bold' : 'normal',
                cursor: 'pointer',
                bgcolor: activeSection === item ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
                transition: 'all 0.2s ease',
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
              <Card
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  mb: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: theme.palette.background.default,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Personal Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3, mb: 4 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      badgeContent={<StarIcon sx={{ fontSize: 20, color: getRankColor(userRank.rank) }} />}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 80, sm: 120 },
                          height: { xs: 80, sm: 120 },
                          bgcolor: theme.palette.primary.main,
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          border: `2px solid ${getRankColor(userRank.rank)}`,
                          boxShadow: `0 0 12px ${alpha(getRankColor(userRank.rank), 0.3)}`,
                        }}
                      >
                        {getRankNumber(userRank.rank)}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                        {userData.fullName || 'User'}
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        {userData.email}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                        Rank: {userRank.rank} ({userRank.points} points)
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
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                    <TextField
                      label="Full Name*"
                      name="fullName"
                      value={userData.fullName}
                      onChange={handleProfileInputChange}
                      disabled={!isEditingProfile}
                      variant="outlined"
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                    <TextField
                      label="Email*"
                      name="email"
                      value={userData.email}
                      onChange={handleProfileInputChange}
                      disabled={!isEditingProfile}
                      variant="outlined"
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                  </Stack>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variant="contained"
                      color="primary"
                      onClick={isEditingProfile ? handleSaveProfile : handleEditProfileToggle}
                      sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                    >
                      {isEditingProfile ? 'Save' : 'Edit Profile'}
                    </Button>
                    {isEditingProfile && (
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditProfileToggle}
                        sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Badges & Achievements Section */}
          {activeSection === 'Badges & Achievements' && (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  mb: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Badges & Achievements
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                      Your Rank
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        badgeContent={<StarIcon sx={{ fontSize: 20, color: getRankColor(userRank.rank) }} />}
                      >
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: theme.palette.primary.main,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            border: `2px solid ${getRankColor(userRank.rank)}`,
                            boxShadow: `0 0 12px ${alpha(getRankColor(userRank.rank), 0.3)}`,
                          }}
                        >
                          {getRankNumber(userRank.rank)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                          {userRank.rank}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {userRank.points} points
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    Your Badges
                  </Typography>
                  <AnimatePresence>
                    {badges.length > 0 ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(auto-fill, minmax(120px, 1fr))',
                            sm: 'repeat(auto-fill, minmax(150px, 1fr))',
                          },
                          gap: 2,
                        }}
                      >
                        {badges.map((badge, index) => (
                          <Tooltip title={badge.description} key={index}>
                            <motion.div
                              custom={index}
                              variants={badgeVariants}
                              initial="hidden"
                              animate="visible"
                              whileHover={{ scale: 1.05, rotate: 2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Card
                                sx={{
                                  p: 2,
                                  textAlign: 'center',
                                  bgcolor: theme.palette.background.default,
                                  borderRadius: 2,
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                                }}
                              >
                                <Typography variant="h4" sx={{ mb: 1 }}>
                                  {badge.icon}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                                  {badge.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                  {new Date(badge.earned_at).toLocaleDateString()}
                                </Typography>
                              </Card>
                            </motion.div>
                          </Tooltip>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        No badges earned yet. Keep practicing to earn some!
                      </Typography>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Change Password Section */}
          {activeSection === 'Change Password' && (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  mb: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: theme.palette.background.default,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Change Password
                  </Typography>
                  {passwordError && (
                    <Typography color="error" sx={{ mb: 2 }}>{passwordError}</Typography>
                  )}
                  {passwordSuccess && (
                    <Typography color="success.main" sx={{ mb: 2 }}>{passwordSuccess}</Typography>
                  )}
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
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
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
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
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
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                  </Stack>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variant="contained"
                      color="primary"
                      onClick={isEditingPassword ? handleSavePassword : handleEditPasswordToggle}
                      sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                    >
                      {isEditingPassword ? 'Save Password' : 'Change Password'}
                    </Button>
                    {isEditingPassword && (
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditPasswordToggle}
                        sx={{ borderRadius: 2, px: 4, py: 1.5 }}
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
              <Card
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  mb: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: theme.palette.background.default,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
                    Purchased Tests
                  </Typography>
                  {purchasedTests.length > 0 ? (
                    <Stack spacing={2}>
                      {purchasedTests.map((test, index) => (
                        <motion.div key={index} variants={itemVariants}>
                          <Card
                            sx={{
                              p: 2,
                              bgcolor: theme.palette.background.default,
                              borderRadius: 1,
                              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                            }}
                          >
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                              {test.title} - {test.questions.length} Questions
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              Category: {test.category}
                            </Typography>
                          </Card>
                        </motion.div>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
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
              <Card
                sx={{
                  p: 3,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  mb: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 4,
                    background: theme.palette.background.default,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
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
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                    <TextField
                      label="Expiry Date (MM/YY)"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handlePaymentInputChange}
                      disabled={!isEditingPayment}
                      variant="outlined"
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                    <TextField
                      label="CVV"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentInputChange}
                      disabled={!isEditingPayment}
                      variant="outlined"
                      fullWidth
                      sx={{
                        bgcolor: theme.palette.background.default,
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: darkMode ? '#444' : '#ddd' },
                          '&:hover fieldset': { borderColor: theme.palette.primary.main },
                        },
                      }}
                    />
                  </Stack>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      variant="contained"
                      color="primary"
                      onClick={isEditingPayment ? handleSavePayment : handleEditPaymentToggle}
                      sx={{ borderRadius: 2, px: 4, py: 1.5 }}
                    >
                      {isEditingPayment ? 'Save Payment' : 'Add Card'}
                    </Button>
                    {isEditingPayment && (
                      <Button
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        variant="outlined"
                        color="secondary"
                        onClick={handleEditPaymentToggle}
                        sx={{ borderRadius: 2, px: 4, py: 1.5 }}
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
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              color="error"
              onClick={handleLogout}
              sx={{ borderRadius: 2, px: 4, py: 1.5 }}
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