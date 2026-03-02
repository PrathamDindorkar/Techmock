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
  alpha,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userRank, setUserRank] = useState({ rank: 'Beginner', points: 0 });
  const [badges, setBadges] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const username = email ? email.split('@')[0] : 'Guest';

  const isMobile = useMediaQuery('(max-width:900px)');
  const isVerySmall = useMediaQuery('(max-width:600px)');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // ── Rank helpers ──
  const getRankNumber = (rank) => {
    const map = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 5 };
    return map[rank] || 1;
  };

  const getRankColor = (rank) => {
    const colors = {
      Master: '#FFD700',
      Expert: '#C0C0C0',
      Advanced: '#CD7F32',
      Intermediate: '#4CAF50',
      Beginner: '#2196F3',
    };
    return colors[rank] || '#2196F3';
  };

  // ── Data fetching ──
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);

    if (token) {
      const fetchData = async () => {
        try {
          const [rankRes, badgesRes] = await Promise.all([
            axios.get(`${backendUrl}/api/user/rank`, { headers: { Authorization: token } }),
            axios.get(`${backendUrl}/api/user/badges`, { headers: { Authorization: token } }),
          ]);
          setUserRank(rankRes.data || { rank: 'Beginner', points: 0 });
          setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
        } catch (err) {
          console.error('User data fetch failed:', err);
          setError('Failed to load profile. Please try logging in again.');
        }
      };
      fetchData();
    }
  }, [token, backendUrl, darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Handlers ──
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const toggleDrawer = () => setMobileOpen((prev) => !prev);

  const logout = () => {
    localStorage.clear();
    navigate('/home');
    setProfileMenuAnchor(null);
    setMobileOpen(false);
  };

  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const openProfileMenu = (e) => setProfileMenuAnchor(e.currentTarget);
  const closeProfileMenu = () => setProfileMenuAnchor(null);

  // ── Navigation items ──
  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/hello', action: () => goTo('/hello') },
    { label: 'All Mocks', icon: <AssignmentIcon />, path: '/mocks', action: () => goTo('/mocks') },
    { label: 'Community', icon: <ForumIcon />, path: '/community', action: () => goTo('/community') },
  ];

  if (token) {
    navItems.push({ label: 'Cart', icon: <ShoppingCartIcon />, path: '/cart', action: () => goTo('/cart') });
  }

  if (role === 'admin') {
    navItems.push({
      label: 'Admin',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin',
      action: () => goTo('/admin'),
    });
  }

  // ── Theme ──
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#2196f3' },
      secondary: { main: '#f50057' },
      background: {
        default: darkMode ? '#0f1217' : '#f8fafc',
        paper: darkMode ? '#1a1f2e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
    },
  });

  // ── Mobile Drawer Content ──
  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={800} color="primary">TechMocks</Typography>
        <IconButton onClick={toggleDrawer}><CloseIcon /></IconButton>
      </Box>

      <Divider />

      {token ? (
        <>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              overlap="circular"
              badgeContent={<StarIcon sx={{ fontSize: 14, color: getRankColor(userRank.rank) }} />}
            >
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 'bold' }}>
                {getRankNumber(userRank.rank)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{username}</Typography>
              <Typography variant="body2" color="text.secondary">
                {userRank.rank} • {userRank.points} pts
              </Typography>
            </Box>
          </Box>

          {badges.length > 0 && (
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Badges</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {badges.slice(0, 4).map((b, i) => (
                  <Box
                    key={i}
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      borderRadius: 1,
                      px: 1.2,
                      py: 0.4,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {b.name}
                  </Box>
                ))}
                {badges.length > 4 && (
                  <Typography variant="caption" color="text.secondary">+{badges.length - 4}</Typography>
                )}
              </Box>
            </Box>
          )}

          <Divider />
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Welcome, Guest</Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => goTo('/login')}
            sx={{ mb: 1.5 }}
          >
            Login
          </Button>
          <Button fullWidth variant="outlined" onClick={() => goTo('/register')}>
            Register
          </Button>
        </Box>
      )}

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
            selected={location.pathname === item.path}
            onClick={item.action}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        {token && (
          <>
            <Divider />
            <ListItem button onClick={() => goTo('/profile')}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button onClick={logout} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ p: 3, mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={darkMode ? <WbSunnyIcon /> : <NightsStayIcon />}
          onClick={toggleDarkMode}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        {/* Background blobs – optional, can remove if performance issue */}
        <Box sx={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div
            animate={{ x: [0, 120, 0], y: [0, -120, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '15%',
              left: '8%',
              width: 480,
              height: 480,
              background: 'radial-gradient(circle, rgba(33,150,243,0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(50px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -140, 0], y: [0, 140, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: '12%',
              right: '10%',
              width: 560,
              height: 560,
              background: 'radial-gradient(circle, rgba(156,39,176,0.10) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(60px)',
            }}
          />
        </Box>

        {/* ── Navbar ── */}
        <AppBar
          position="sticky"
          sx={{
            backdropFilter: 'blur(12px)',
            bgcolor: alpha(theme.palette.background.paper, darkMode ? 0.82 : 0.78),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.3s',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
            {/* Logo + Mobile Menu Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile && (
                <IconButton color="inherit" onClick={toggleDrawer} edge="start">
                  <MenuIcon />
                </IconButton>
              )}
              <Link
                onClick={() => goTo('/home')}
                sx={{ textDecoration: 'none', cursor: 'pointer' }}
              >
                <Typography
                  variant="h6"
                  fontWeight={900}
                  sx={{
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}
                >
                  TechMocks
                </Typography>
              </Link>
            </Box>

            {/* Desktop Nav (hidden on mobile) */}
            {!isMobile && token && (
              <Box sx={{ display: 'flex', gap: 1.5, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={item.action}
                    sx={{
                      color: darkMode ? 'white' : 'text.primary',          // ← explicit contrast
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      borderRadius: 2,
                      px: 2,
                      minWidth: 110,
                      position: 'relative',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '&::after': location.pathname === item.path && {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: '20%',
                        width: '60%',
                        height: 3,
                        bgcolor: darkMode ? 'primary.light' : 'primary.main',  // better visibility
                        borderRadius: 2,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
            {/* Right side – compact on mobile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
              {/* Dark Mode Toggle – always visible */}
              <IconButton
                onClick={toggleDarkMode}
                sx={{ color: 'text.primary' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={darkMode ? 'sun' : 'moon'}
                    initial={{ rotate: -30, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 30, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {darkMode ? <WbSunnyIcon /> : <NightsStayIcon />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>

              {token ? (
                <IconButton
                  size="small"
                  onClick={openProfileMenu}
                  sx={{
                    p: 0.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.action.hover, scrolled ? 0.18 : 0.08),
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={<StarIcon sx={{ fontSize: 14, color: getRankColor(userRank.rank) }} />}
                  >
                    <Avatar
                      sx={{
                        width: isVerySmall ? 32 : 38,
                        height: isVerySmall ? 32 : 38,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {getRankNumber(userRank.rank)}
                    </Avatar>
                  </Badge>
                </IconButton>
              ) : (
                !isMobile && (
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={() => goTo('/login')}
                    sx={{ borderRadius: 3, px: 3, fontWeight: 600 }}
                  >
                    Login
                  </Button>
                )
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={closeProfileMenu}
          PaperProps={{
            elevation: 6,
            sx: { width: 260, mt: 1.5, borderRadius: 2 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2.5, pb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>{username}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {email}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {userRank.rank}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({userRank.points} pts)
              </Typography>
            </Box>
          </Box>

          {badges.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Badges
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {badges.slice(0, 5).map((b, i) => (
                    <Box
                      key={i}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 1,
                        px: 1.2,
                        py: 0.4,
                        fontSize: '0.78rem',
                      }}
                    >
                      {b.name}
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}

          <Divider />
          <MenuItem onClick={() => { goTo('/profile'); closeProfileMenu(); }}>
            <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>

          {role === 'admin' && (
            <MenuItem onClick={() => { goTo('/admin'); closeProfileMenu(); }}>
              <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
              Admin Portal
            </MenuItem>
          )}

          <Divider />
          <MenuItem onClick={logout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Drawer – now for everyone */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleDrawer}
          sx={{ '& .MuiDrawer-paper': { width: 280 } }}
        >
          {drawerContent}
        </Drawer>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
          {error && (
            <Typography color="error" align="center" sx={{ mb: 3 }}>
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