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

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const username = email ? email.split('@')[0] : 'User';

  const isMobile = useMediaQuery('(max-width:900px)');

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

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
    navigate('/login');
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

  // Navigation items
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
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: '80%',
            maxWidth: 280,
            overflowY: 'auto', // Enable scrolling
          },
        },
      },
    },
  });

  // Mobile drawer content
  const drawer = (
    <Box sx={{ 
      height: '100%', 
      backgroundColor: 'background.paper', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Drawer Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          TechMock
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleDrawerToggle} aria-label="close drawer">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 40,
            height: 40,
          }}
        >
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {role || 'user'}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.onClick}
            sx={{
              py: 1.5,
              backgroundColor: location.pathname === item.path
                ? alpha(theme.palette.primary.main, 0.1)
                : 'transparent',
              borderLeft: location.pathname === item.path
                ? `4px solid ${theme.palette.primary.main}`
                : '4px solid transparent',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                minWidth: '40px',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}

        <ListItem button onClick={handleProfileClick} sx={{ py: 1.5 }}>
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </ListItem>

        <ListItem button onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
          <ListItemIcon sx={{ minWidth: '40px', color: theme.palette.error.main }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>

      {/* Dark Mode Toggle */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Typography variant="body2">{darkMode ? 'Dark Mode' : 'Light Mode'}</Typography>
          <IconButton
            color="inherit"
            onClick={handleDarkModeToggle}
            sx={{
              backgroundColor: alpha(theme.palette.background.default, 0.2),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.default, 0.3),
              },
            }}
          >
            {darkMode ? <WbSunnyIcon /> : <NightsStayIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        width: '100%',
        transition: 'background-color 0.3s ease',
      }}>
        {/* Navbar */}
        <AppBar
          component={motion.div}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          position="sticky"
          sx={{
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            backgroundColor: scrolled
              ? alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.9)
              : theme.palette.primary.main,
            color: scrolled ? 'text.primary' : '#fff',
            borderBottom: scrolled ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : 'none',
            transition: 'all 0.3s ease',
            width: '100%',
          }}
          elevation={scrolled ? 0 : 3}
        >
          <Toolbar sx={{ justifyContent: 'space-between', padding: { xs: '0 16px', sm: '0 24px' } }}>
            {/* Left side - Logo and mobile menu button */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Link
                component={motion.a}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                color="inherit"
                onClick={() => navigate('/hello')}
                sx={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: scrolled
                      ? (darkMode ? 'linear-gradient(45deg, #90caf9, #64b5f6)' : 'linear-gradient(45deg, #1976d2, #2196f3)')
                      : 'white',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: scrolled ? 'transparent' : 'white',
                    letterSpacing: '0.5px',
                  }}
                >
                  TechMock
                </Typography>
              </Link>
            </Box>

            {/* Center - Navigation links */}
            {!isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, md: 2 },
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {navItems.map((item, index) => (
                  <Button
                    key={item.text}
                    component={motion.button}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: scrolled
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha('#fff', 0.2),
                    }}
                    color="inherit"
                    onClick={item.onClick}
                    startIcon={item.icon}
                    sx={{
                      mx: 1,
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      position: 'relative',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      '&::after': location.pathname === item.path
                        ? {
                            content: '""',
                            position: 'absolute',
                            bottom: '5px',
                            left: '20%',
                            width: '60%',
                            height: '3px',
                            backgroundColor: scrolled ? theme.palette.primary.main : 'white',
                            borderRadius: '3px',
                          }
                        : {},
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right - Icons and profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <IconButton
                component={motion.button}
                whileHover={{
                  scale: 1.1,
                  rotate: darkMode ? 0 : 180,
                }}
                whileTap={{ scale: 0.9 }}
                color="inherit"
                onClick={handleDarkModeToggle}
                sx={{
                  bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.1),
                  '&:hover': {
                    bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.2),
                  },
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

              {!isMobile && (
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  endIcon={<KeyboardArrowDownIcon />}
                  startIcon={
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: scrolled ? theme.palette.primary.main : alpha('#fff', 0.3),
                        color: scrolled ? '#fff' : '#fff',
                        fontSize: '0.875rem',
                      }}
                    >
                      {username.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  sx={{
                    ml: 1,
                    borderRadius: '30px',
                    bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.1),
                    '&:hover': {
                      bgcolor: alpha(scrolled ? theme.palette.action.active : '#fff', 0.2),
                    },
                    px: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      fontWeight: 500,
                    }}
                  >
                    {username}
                  </Typography>
                </Button>
              )}

              <Menu
                anchorEl={profileMenuAnchor}
                open={Boolean(profileMenuAnchor)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    width: 220,
                    mt: 1.5,
                    boxShadow: theme.shadows[8],
                    borderRadius: '12px',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ pt: 2, pb: 1, px: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleProfileClick} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
                {role === 'admin' && (
                  <MenuItem onClick={goToAdminPortal} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Admin Portal</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: theme.palette.error.main }}>
                  <ListItemIcon sx={{ color: theme.palette.error.main }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: '80%',
              maxWidth: 280,
              height: '100%',
              boxShadow: theme.shadows[8],
              overflowY: 'auto', // Ensure scrollability
            },
          }}
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

        {/* Page Content */}
        <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
          <Outlet />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;