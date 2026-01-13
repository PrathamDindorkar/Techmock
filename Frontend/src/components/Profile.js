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
import { alpha } from '@mui/material/styles';

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

  // Rank mappings
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

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master': return '#FFD700';    // Gold
      case 'Expert': return '#C0C0C0';    // Silver
      case 'Advanced': return '#CD7F32';  // Bronze
      case 'Intermediate': return '#4CAF50'; // Green
      default: return '#2196F3';          // Blue
    }
  };

  // Fetch user data
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, rankRes, badgesRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: token } }),
          axios.get(`${backendUrl}/api/user/rank`, { headers: { Authorization: token } }),
          axios.get(`${backendUrl}/api/user/badges`, { headers: { Authorization: token } }),
        ]);

        const { name, email, purchasedTests } = profileRes.data;
        setUserData({
          username: name?.split(' ')[0] || '',
          fullName: name || '',
          email: email || '',
        });
        setPurchasedTests(purchasedTests || []);
        setUserRank(rankRes.data || { rank: 'Beginner', points: 0 });
        setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load profile. Please try again.');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditProfileToggle = () => setIsEditingProfile(!isEditingProfile);
  const handleEditPasswordToggle = () => {
    setIsEditingPassword(!isEditingPassword);
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };
  const handleEditPaymentToggle = () => {
    setIsEditingPayment(!isEditingPayment);
    setPaymentData({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`${backendUrl}/api/user/profile`, {
        name: userData.fullName,
        email: userData.email,
      }, { headers: { Authorization: token } });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.put(`${backendUrl}/api/user/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, { headers: { Authorization: token } });
      setPasswordSuccess('Password changed successfully!');
      setIsEditingPassword(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const navigationItems = [
    'My Profile',
    'Badges & Achievements',
    'Change Password',
    'Purchased Tests',
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userData.fullName) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 3 }}>
        <Typography variant="h6" color="error" textAlign="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1300, mx: 'auto' }}>

        {/* Mobile: Horizontal Navigation Tabs */}
        {isMobile && (
          <Box sx={{ mb: 4, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <Stack direction="row" spacing={1} sx={{ minWidth: 'max-content' }}>
              {navigationItems.map((item) => (
                <Button
                  key={item}
                  variant={activeSection === item ? 'contained' : 'outlined'}
                  onClick={() => setActiveSection(item)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item}
                </Button>
              ))}
            </Stack>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 } }}>

          {/* Desktop Sidebar */}
          {!isMobile && (
            <Box sx={{ width: 280, flexShrink: 0 }}>
              <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Profile Menu
                  </Typography>
                  <Stack spacing={1} mt={2}>
                    {navigationItems.map((item) => (
                      <Box
                        key={item}
                        onClick={() => setActiveSection(item)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: activeSection === item ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                          color: activeSection === item ? 'primary.main' : 'text.primary',
                          fontWeight: activeSection === item ? 'bold' : 'medium',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <Typography>{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Box>
          )}

          {/* Main Content Area */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ borderRadius: 3, boxShadow: 4, overflow: 'hidden' }}>
                  <CardContent sx={{ p: { xs: 3, md: 5 } }}>

                    {/* My Profile */}
                    {activeSection === 'My Profile' && (
                      <>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          Personal Information
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4, my: 4 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            badgeContent={<StarIcon sx={{ fontSize: 28, color: getRankColor(userRank.rank) }} />}
                          >
                            <Avatar
                              sx={{
                                width: { xs: 100, sm: 140 },
                                height: { xs: 100, sm: 140 },
                                bgcolor: 'primary.main',
                                fontSize: '3.5rem',
                                fontWeight: 'bold',
                                border: `5px solid ${getRankColor(userRank.rank)}`,
                                boxShadow: `0 0 20px ${alpha(getRankColor(userRank.rank), 0.4)}`,
                              }}
                            >
                              {getRankNumber(userRank.rank)}
                            </Avatar>
                          </Badge>

                          <Box textAlign={{ xs: 'center', sm: 'left' }}>
                            <Typography variant="h5" fontWeight="bold">
                              {userData.fullName || 'User'}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {userData.email}
                            </Typography>
                            <Typography variant="body2" mt={1} color="text.secondary">
                              Rank: <strong>{userRank.rank}</strong> • {userRank.points} points
                            </Typography>
                          </Box>
                        </Box>

                        <Stack spacing={3} mt={3}>
                          <TextField label="Username" name="username" value={userData.username} onChange={handleProfileInputChange} disabled={!isEditingProfile} fullWidth />
                          <TextField label="Full Name" name="fullName" value={userData.fullName} onChange={handleProfileInputChange} disabled={!isEditingProfile} fullWidth />
                          <TextField label="Email" name="email" type="email" value={userData.email} onChange={handleProfileInputChange} disabled={!isEditingProfile} fullWidth />
                        </Stack>

                        <Box mt={5} display="flex" gap={2} flexWrap="wrap">
                          <Button variant="contained" size="large" onClick={isEditingProfile ? handleSaveProfile : handleEditProfileToggle}>
                            {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
                          </Button>
                          {isEditingProfile && (
                            <Button variant="outlined" size="large" onClick={handleEditProfileToggle}>
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </>
                    )}

                    {/* Badges & Achievements */}
                    {activeSection === 'Badges & Achievements' && (
                      <>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          Badges & Achievements
                        </Typography>

                        <Box sx={{ my: 4, textAlign: 'center' }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            badgeContent={<StarIcon sx={{ fontSize: 24, color: getRankColor(userRank.rank) }} />}
                          >
                            <Avatar
                              sx={{
                                width: 100,
                                height: 100,
                                mx: 'auto',
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem',
                                fontWeight: 'bold',
                                border: `4px solid ${getRankColor(userRank.rank)}`,
                              }}
                            >
                              {getRankNumber(userRank.rank)}
                            </Avatar>
                          </Badge>
                          <Typography variant="h6" mt={2} fontWeight="bold">
                            {userRank.rank}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {userRank.points} points earned
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Typography variant="h6" gutterBottom>
                          Earned Badges
                        </Typography>

                        {badges.length > 0 ? (
                          <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: 3,
                            mt: 3,
                          }}>
                            {badges.map((badge, i) => (
                              <Tooltip key={i} title={badge.description || badge.name} arrow>
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                                    <Typography variant="h3">{badge.icon || '🏆'}</Typography>
                                    <Typography variant="subtitle2" mt={1} fontWeight="bold">
                                      {badge.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(badge.earned_at).toLocaleDateString()}
                                    </Typography>
                                  </Card>
                                </motion.div>
                              </Tooltip>
                            ))}
                          </Box>
                        ) : (
                          <Typography color="text.secondary" textAlign="center" mt={3}>
                            No badges yet. Keep practicing to unlock them!
                          </Typography>
                        )}
                      </>
                    )}

                    {/* Change Password */}
                    {activeSection === 'Change Password' && (
                      <>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          Change Password
                        </Typography>
                        {passwordError && <Typography color="error" sx={{ mt: 2 }}>{passwordError}</Typography>}
                        {passwordSuccess && <Typography color="success.main" sx={{ mt: 2 }}>{passwordSuccess}</Typography>}

                        <Stack spacing={3} mt={3}>
                          <TextField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordInputChange}
                            disabled={!isEditingPassword}
                            fullWidth
                          />
                          <TextField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            disabled={!isEditingPassword}
                            fullWidth
                          />
                          <TextField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordInputChange}
                            disabled={!isEditingPassword}
                            fullWidth
                          />
                        </Stack>

                        <Box mt={5} display="flex" gap={2}>
                          <Button variant="contained" size="large" onClick={isEditingPassword ? handleSavePassword : handleEditPasswordToggle}>
                            {isEditingPassword ? 'Save New Password' : 'Change Password'}
                          </Button>
                          {isEditingPassword && (
                            <Button variant="outlined" size="large" onClick={handleEditPasswordToggle}>
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </>
                    )}

                    {/* Purchased Tests */}
                    {activeSection === 'Purchased Tests' && (
                      <>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          Purchased Tests
                        </Typography>

                        {purchasedTests.length > 0 ? (
                          <Stack spacing={3} mt={4}>
                            {purchasedTests.map((test, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <Card sx={{ p: 3, borderRadius: 3 }}>
                                  <Typography variant="h6" fontWeight="bold">
                                    {test.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" mt={1}>
                                    {test.questions?.length || 0} Questions • Category: {test.category || 'General'}
                                  </Typography>
                                </Card>
                              </motion.div>
                            ))}
                          </Stack>
                        ) : (
                          <Typography color="text.secondary" textAlign="center" mt={5}>
                            You haven't purchased any tests yet. Explore the store!
                          </Typography>
                        )}
                      </>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Logout Button */}
            <Box mt={6} textAlign="center">
              <Button variant="contained" color="error" size="large" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;