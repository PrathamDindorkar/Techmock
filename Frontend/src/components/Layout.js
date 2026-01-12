import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Link,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import Footer from "./Footer";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userRank, setUserRank] = useState({ rank: 'Beginner', points: 0 });
  const [badges, setBadges] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const username = email ? email.split('@')[0] : 'User';
  const isMobile = useMediaQuery('(max-width:900px)');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Map rank to number
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

  // Load dark mode preference and fetch rank/badges (only if logged in)
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    if (!token) {
      // Not logged in → redirect to home if trying to access protected page
      if (location.pathname !== '/home' && location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/home');
      }
      return;
    }

    const fetchData = async () => {
      try {
        const [rankResponse, badgesResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/rank`, {
            headers: { Authorization: token },
          }),
          axios.get(`${backendUrl}/api/user/badges`, {
            headers: { Authorization: token },
          }),
        ]);
        setUserRank(rankResponse.data || { rank: 'Beginner', points: 0 });
        setBadges(Array.isArray(badgesResponse.data) ? badgesResponse.data : []);
      } catch (err) {
        console.error('Error fetching rank/badges:', err);
        setError('Failed to load user data. Please log in again.');
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchData();
  }, [token, navigate, location.pathname]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/home');
    handleProfileMenuClose();
    if (isMobile) setMobileOpen(false);
  };

  const handleHome = () => {
    navigate('/hello');
    if (isMobile) setMobileOpen(false);
  };

  const handleAllMocks = () => {
    navigate('/mocks');
    if (isMobile) setMobileOpen(false);
  };

  const goToAdminPortal = () => {
    if (role === 'admin') {
      navigate('/admin');
    } else {
      alert('You do not have access to the Admin Portal');
    }
    if (isMobile) setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
    if (isMobile) setMobileOpen(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
    if (isMobile) setMobileOpen(false);
  };

  // Function to get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master': return '#FFD700';
      case 'Expert': return '#C0C0C0';
      case 'Advanced': return '#CD7F32';
      case 'Intermediate': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  // Navigation items (only for logged-in users)
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, onClick: handleHome, path: '/hello' },
    { text: 'All Mocks', icon: <AssignmentIcon />, onClick: handleAllMocks, path: '/mocks' },
    { text: 'Cart', icon: <ShoppingCartIcon />, onClick: handleCartClick, path: '/cart' },
  ];

  if (role === 'admin') {
    navItems.push({
      text: 'Admin Portal',
      icon: <AdminPanelSettingsIcon />,
      onClick: goToAdminPortal,
      path: '/admin',
    });
  }

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f7',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
    },
  });

  // Mobile drawer content (only shown when logged in)
  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>TechMocks</Typography>
        <IconButton onClick={handleDrawerToggle}><CloseIcon /></IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          badgeContent={<StarIcon sx={{ fontSize: 16, color: getRankColor(userRank.rank) }} />}
        >
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40, fontWeight: 'bold' }}>
            {getRankNumber(userRank.rank)}
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{username} ({userRank.rank})</Typography>
          <Typography variant="body2" color="text.secondary">{role || 'user'} | {userRank.points} points</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Your Badges</Typography>
        {badges.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {badges.slice(0, 3).map((badge, index) => (
              <Badge key={index} badgeContent={badge.icon} color="primary">
                <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, px: 1, py: 0.5 }}>
                  {badge.name}
                </Typography>
              </Badge>
            ))}
            {badges.length > 3 && <Typography variant="caption" color="text.secondary">+{badges.length - 3} more</Typography>}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">No badges earned yet</Typography>
        )}
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.onClick}
            sx={{
              py: 1.5,
              backgroundColor: location.pathname === item.path ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit', minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }} />
          </ListItem>
        ))}
        <ListItem button onClick={handleProfileClick} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: '40px' }}><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItem>
        <ListItem button onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
          <ListItemIcon sx={{ minWidth: '40px', color: theme.palette.error.main }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
          <Typography variant="body2">{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
          <IconButton onClick={handleDarkModeToggle} sx={{ bgcolor: alpha(theme.palette.background.default, 0.2), '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.3) } }}>
            {darkMode ? <WbSunnyIcon /> : <NightsStayIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary', transition: 'background-color 0.3s ease' }}>
        {/* Animated Background Blobs */}
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '10%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <motion.div animate={{ x: [0, -150, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', bottom: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
          <motion.div animate={{ x: [0, 80, 0], y: [0, -80, 0], scale: [1, 1.1, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        </Box>

        {/* Navbar */}
        <AppBar
          component={motion.div}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          position="sticky"
          sx={{
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.7),
            color: 'text.primary',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            transition: 'all 0.3s ease',
          }}
          elevation={0}
        >
          <Toolbar sx={{ justifyContent: 'space-between', padding: { xs: '0 16px', sm: '0 24px' } }}>
            {/* Left: Logo + Mobile Menu (only if logged in) */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && token && (
                <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                  <MenuIcon />
                </IconButton>
              )}
              <Link
                component={motion.a}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
                sx={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 1000,
                    background: alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.7),
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: darkMode ? theme.palette.primary.dark : theme.palette.primary.light,
                    letterSpacing: '0.5px',
                  }}
                >
                  TechMocks
                </Typography>
              </Link>
            </Box>

            {/* Center: Navigation Links (only desktop + logged in) */}
            {!isMobile && token && (
              <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                {navItems.map((item, index) => (
                  <Button
                    key={item.text}
                    component={motion.button}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    color="inherit"
                    onClick={item.onClick}
                    startIcon={item.icon}
                    sx={{
                      mx: 1,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      '&::after': location.pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: '5px',
                        left: '20%',
                        width: '60%',
                        height: '3px',
                        backgroundColor: scrolled ? theme.palette.primary.main : 'white',
                        borderRadius: '3px',
                      } : {},
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right: Dark Mode + Login/Profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              {/* Dark Mode Toggle */}
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.1, rotate: darkMode ? 0 : 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDarkModeToggle}
                sx={{
                  bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.1),
                  '&:hover': { bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.2) },
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={darkMode ? 'dark' : 'light'}
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {darkMode ? <WbSunnyIcon /> : <NightsStayIcon />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>

              {/* Conditional: Login Button OR Profile */}
              {token ? (
                <>
                  {!isMobile && (
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleProfileMenuOpen}
                      color="inherit"
                      endIcon={<KeyboardArrowDownIcon />}
                      startIcon={
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                          badgeContent={<StarIcon sx={{ fontSize: 16, color: getRankColor(userRank.rank) }} />}
                        >
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: theme.palette.primary.main,
                              color: '#fff',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {getRankNumber(userRank.rank)}
                          </Avatar>
                        </Badge>
                      }
                      sx={{
                        ml: 1,
                        borderRadius: '30px',
                        bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.1),
                        '&:hover': { bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.2) },
                        px: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                        {username}
                      </Typography>
                    </Button>
                  )}

                  {/* Profile Dropdown Menu */}
                  <Menu
                    anchorEl={profileMenuAnchor}
                    open={Boolean(profileMenuAnchor)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{ sx: { width: 220, mt: 1.5, boxShadow: theme.shadows[8], borderRadius: '12px' } }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <Box sx={{ pt: 2, pb: 1, px: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{username}</Typography>
                      <Typography variant="body2" color="text.secondary">{email}</Typography>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Rank: {userRank.rank} ({userRank.points} points)
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2, pb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Your Badges</Typography>
                      {badges.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {badges.slice(0, 3).map((badge, index) => (
                            <Badge key={index} badgeContent={badge.icon} color="primary">
                              <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, px: 1, py: 0.5 }}>
                                {badge.name}
                              </Typography>
                            </Badge>
                          ))}
                          {badges.length > 3 && <Typography variant="caption" color="text.secondary">+{badges.length - 3} more</Typography>}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">No badges earned yet</Typography>
                      )}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                      <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>My Profile</ListItemText>
                    </MenuItem>
                    {role === 'admin' && (
                      <MenuItem onClick={goToAdminPortal} sx={{ py: 1.5 }}>
                        <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Admin Portal</ListItemText>
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
                      <ListItemIcon sx={{ color: theme.palette.error.main }}><LogoutIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                /* Login Button for Guests */
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: '30px',
                    px: 4,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer (only when logged in) */}
        {token && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' } }}
            PaperProps={{
              component: motion.div,
              initial: { x: '-100%' },
              animate: { x: 0 },
              exit: { x: '-100%' },
              transition: { type: 'spring', stiffness: 300, damping: 30 },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          <Outlet context={{ darkMode }} />
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Layout;