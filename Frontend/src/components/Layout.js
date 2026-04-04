import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, Container,
  useMediaQuery, Drawer, List, ListItem, ListItemText, ListItemIcon,
  Divider, Avatar, Menu, MenuItem, Badge, alpha,
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
import StarIcon from '@mui/icons-material/Star';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import axios from 'axios';
import Footer from './Footer';

/* ═══════════════════════════════════════════
   ANIMATED BACKGROUND
═══════════════════════════════════════════ */

const GrainOverlay = ({ opacity }) => (
  <Box sx={{
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat', backgroundSize: '180px 180px', mixBlendMode: 'overlay',
  }} />
);

const orbs = [
  { w: 700, h: 700, top: '-12%', left: '-8%',  lightC: 'rgba(59,130,246,0.13)',  darkC: 'rgba(99,102,241,0.22)',  dur: 26, dx: 80,  dy: -60 },
  { w: 600, h: 600, top: '55%',  left: '70%',  lightC: 'rgba(168,85,247,0.11)',  darkC: 'rgba(168,85,247,0.18)', dur: 34, dx: -90, dy: 70  },
  { w: 500, h: 500, top: '20%',  left: '55%',  lightC: 'rgba(20,184,166,0.10)',  darkC: 'rgba(20,184,166,0.16)', dur: 20, dx: 60,  dy: 80  },
  { w: 400, h: 400, top: '70%',  left: '10%',  lightC: 'rgba(245,158,11,0.09)',  darkC: 'rgba(245,158,11,0.13)', dur: 30, dx: -50, dy: -80 },
  { w: 350, h: 350, top: '35%',  left: '85%',  lightC: 'rgba(236,72,153,0.08)',  darkC: 'rgba(236,72,153,0.14)', dur: 24, dx: -70, dy: 40  },
];

const DriftingOrbs = ({ darkMode }) =>
  orbs.map((o, i) => (
    <motion.div key={i}
      animate={{ x: [0, o.dx, o.dx * 0.4, 0], y: [0, o.dy, o.dy * 0.6, 0], scale: [1, 1.12, 0.95, 1] }}
      transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 1.8 }}
      style={{
        position: 'absolute', top: o.top, left: o.left, width: o.w, height: o.h,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, ${darkMode ? o.darkC : o.lightC} 0%, transparent 68%)`,
        filter: 'blur(55px)', willChange: 'transform',
      }}
    />
  ));

const MeshGrid = ({ darkMode }) => {
  const lineColor = darkMode ? 'rgba(255,255,255,0.028)' : 'rgba(0,0,0,0.035)';
  const cols = 12; const rows = 8;
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <motion.line key={`v${i}`} x1={i * (1200 / cols)} y1={0} x2={i * (1200 / cols)} y2={800}
            stroke={lineColor} strokeWidth="1" initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
        ))}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <motion.line key={`h${i}`} x1={0} y1={i * (800 / rows)} x2={1200} y2={i * (800 / rows)}
            stroke={lineColor} strokeWidth="1" initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: i * 0.2 + 0.5, ease: 'easeInOut' }} />
        ))}
        {[2, 5, 9].flatMap(c => [2, 5].map(r => (
          <motion.circle key={`d${c}${r}`} cx={c * (1200 / cols)} cy={r * (800 / rows)} r={1.5}
            fill={darkMode ? 'rgba(139,92,246,0.5)' : 'rgba(59,130,246,0.35)'}
            animate={{ r: [1.5, 3.5, 1.5], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3 + c * 0.5, repeat: Infinity, delay: r * 0.6 }} />
        )))}
      </svg>
    </Box>
  );
};

const Aurora = ({ darkMode }) => (
  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45vh', overflow: 'hidden', pointerEvents: 'none' }}>
    <motion.div
      animate={{ x: ['-10%', '5%', '-5%', '-10%'], scaleX: [1, 1.08, 0.96, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute', top: '-20%', left: '-10%', right: '-10%', height: '100%',
        background: darkMode
          ? 'conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(99,102,241,0.12) 60deg, rgba(20,184,166,0.10) 120deg, rgba(168,85,247,0.08) 180deg, transparent 240deg)'
          : 'conic-gradient(from 200deg at 50% 0%, transparent 0deg, rgba(59,130,246,0.07) 60deg, rgba(20,184,166,0.06) 120deg, rgba(168,85,247,0.05) 180deg, transparent 240deg)',
        filter: 'blur(32px)', transform: 'scaleY(0.6)', willChange: 'transform',
      }}
    />
  </Box>
);

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: 1 + Math.random() * 2, dur: 12 + Math.random() * 20,
  delay: Math.random() * 10, dy: -80 - Math.random() * 120, dx: (Math.random() - 0.5) * 60,
}));

const FloatingParticles = ({ darkMode }) =>
  PARTICLES.map(p => (
    <motion.div key={p.id}
      animate={{ y: [0, p.dy], x: [0, p.dx], opacity: [0, 0.7, 0] }}
      transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
      style={{
        position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
        width: p.size, height: p.size, borderRadius: '50%',
        background: darkMode ? 'rgba(167,139,250,0.7)' : 'rgba(59,130,246,0.5)',
        willChange: 'transform, opacity',
      }}
    />
  ));

const MouseSpotlight = ({ darkMode }) => {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, ${darkMode ? 'rgba(99,102,241,0.06)' : 'rgba(59,130,246,0.04)'} 0%, transparent 65%)`,
      transition: 'background 0.1s',
    }} />
  );
};

/* ── True page base: a solid colour that sits behind everything ── */
const PageBase = ({ darkMode }) => (
  <Box sx={{
    position: 'fixed', inset: 0, zIndex: -1,
    bgcolor: darkMode ? '#07080f' : '#eef0f7',
  }} />
);

const AnimatedBackground = ({ darkMode }) => (
  <>
    <PageBase darkMode={darkMode} />
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <MeshGrid darkMode={darkMode} />
      <Aurora darkMode={darkMode} />
      <DriftingOrbs darkMode={darkMode} />
      <FloatingParticles darkMode={darkMode} />
      <GrainOverlay opacity={darkMode ? 0.06 : 0.04} />
      <MouseSpotlight darkMode={darkMode} />
    </Box>
  </>
);

/* ═══════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════ */
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode]                 = useState(() => localStorage.getItem('darkMode') === 'true');
  const [mobileOpen, setMobileOpen]             = useState(false);
  const [scrolled, setScrolled]                 = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userRank, setUserRank]                 = useState({ rank: 'Beginner', points: 0 });
  const [badges, setBadges]                     = useState([]);
  const [error, setError]                       = useState(null);

  const token    = localStorage.getItem('token');
  const email    = localStorage.getItem('email');
  const role     = localStorage.getItem('role');
  const username = email ? email.split('@')[0] : 'Guest';

  const isMobile           = useMediaQuery('(max-width:900px)');
  const isVerySmall        = useMediaQuery('(max-width:600px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const backendUrl         = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const getRankNumber = r => ({ Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4, Master: 5 }[r] || 1);
  const getRankColor  = r => ({ Master: '#FFD700', Expert: '#C0C0C0', Advanced: '#CD7F32', Intermediate: '#4CAF50', Beginner: '#2196F3' }[r] || '#2196F3');

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (token) {
      (async () => {
        try {
          const [rankRes, badgesRes] = await Promise.all([
            axios.get(`${backendUrl}/api/user/rank`,   { headers: { Authorization: token } }),
            axios.get(`${backendUrl}/api/user/badges`, { headers: { Authorization: token } }),
          ]);
          setUserRank(rankRes.data || { rank: 'Beginner', points: 0 });
          setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
        } catch { setError('Failed to load profile data.'); }
      })();
    }
  }, [token, backendUrl, darkMode]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const toggleDarkMode   = () => setDarkMode(p => !p);
  const toggleDrawer     = () => setMobileOpen(p => !p);
  const logout           = () => { localStorage.clear(); navigate('/home'); setProfileMenuAnchor(null); setMobileOpen(false); };
  const goTo             = path => { navigate(path); setMobileOpen(false); };
  const openProfileMenu  = e => setProfileMenuAnchor(e.currentTarget);
  const closeProfileMenu = () => setProfileMenuAnchor(null);

  const navItems = [
    { label: 'Home',      icon: <HomeIcon />,               path: '/hello',     action: () => goTo('/hello')     },
    { label: 'All Mocks', icon: <AssignmentIcon />,          path: '/mocks',     action: () => goTo('/mocks')     },
    { label: 'Community', icon: <ForumIcon />,               path: '/community', action: () => goTo('/community') },
    { label: 'Interview', icon: <RecordVoiceOverIcon />,     path: '/interview', action: () => goTo('/interview') },
  ];
  if (token)         navItems.push({ label: 'Cart',  icon: <ShoppingCartIcon />,        path: '/cart',  action: () => goTo('/cart')  });
  if (role === 'admin') navItems.push({ label: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin', action: () => goTo('/admin') });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary:   { main: '#6366f1' },
      secondary: { main: '#14b8a6' },
      background: {
        // transparent base — the PageBase component provides the real solid colour
        default: darkMode
          ? 'rgba(7,8,15,0)'          // fully transparent; PageBase shows through
          : 'rgba(238,240,247,0)',
        paper: darkMode
          ? 'rgba(15,16,28,0.55)'     // frosted dark card
          : 'rgba(255,255,255,0.58)', // frosted light card
      },
    },
    typography: {
      fontFamily: '"Outfit", "Poppins", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
      /* Give every Paper / Card the frosted look automatically */
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          },
        },
      },
      /* Select / Menu dropdowns */
      MuiMenu: {
        styleOverrides: {
          paper: {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          },
        },
      },
    },
  });

  const navLinkSx = path => ({
    color: darkMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,15,30,0.8)',
    fontWeight: location.pathname === path ? 700 : 500,
    fontSize: '0.875rem',
    borderRadius: 2, px: 2, py: 0.75, position: 'relative', letterSpacing: '0.01em',
    transition: 'color 0.2s, background 0.2s',
    '&:hover': { bgcolor: darkMode ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)', color: '#6366f1' },
    ...(location.pathname === path && {
      color: '#6366f1',
      '&::after': {
        content: '""', position: 'absolute', bottom: 4, left: '22%', width: '56%', height: 2,
        background: 'linear-gradient(90deg, #6366f1, #14b8a6)', borderRadius: 2,
      },
    }),
  });

  const drawerContent = (
    <Box sx={{
      width: 280, height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: darkMode ? 'rgba(10,11,20,0.92)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
        <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(90deg,#6366f1,#14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          TechMocks
        </Typography>
        <IconButton onClick={toggleDrawer} size="small"><CloseIcon fontSize="small" /></IconButton>
      </Box>

      <Divider />

      {token ? (
        <>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge overlap="circular" badgeContent={<StarIcon sx={{ fontSize: 14, color: getRankColor(userRank.rank) }} />}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {getRankNumber(userRank.rank)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{username}</Typography>
              <Typography variant="body2" color="text.secondary">{userRank.rank} · {userRank.points} pts</Typography>
            </Box>
          </Box>
          {badges.length > 0 && (
            <Box sx={{ px: 3, pb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {badges.slice(0, 4).map((b, i) => (
                  <Box key={i} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), borderRadius: 1, px: 1.2, py: 0.4, fontSize: '0.72rem', fontWeight: 500 }}>
                    {b.name}
                  </Box>
                ))}
                {badges.length > 4 && <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>+{badges.length - 4}</Typography>}
              </Box>
            </Box>
          )}
          <Divider />
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Welcome, Guest</Typography>
          <Button fullWidth variant="contained" onClick={() => goTo('/login')} sx={{ mb: 1.5 }}>Login</Button>
          <Button fullWidth variant="outlined" onClick={() => goTo('/register')}>Register</Button>
        </Box>
      )}

      <List sx={{ flexGrow: 1, px: 1 }}>
        {navItems.map(item => (
          <ListItem button key={item.label} selected={location.pathname === item.path} onClick={item.action}
            sx={{ borderRadius: 2, mb: 0.5, '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}>
            <ListItemIcon sx={{ minWidth: 36, color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: location.pathname === item.path ? 700 : 400 }} />
          </ListItem>
        ))}
        {token && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={() => goTo('/profile')} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItem>
            <ListItem button onClick={logout} sx={{ borderRadius: 2, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItem>
          </>
        )}
      </List>

      <Box sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" startIcon={darkMode ? <WbSunnyIcon /> : <NightsStayIcon />} onClick={toggleDarkMode}
          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.85rem' }}>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      {/* Solid page base + animated layer (both fixed, behind everything) */}
      {!prefersReducedMotion && <AnimatedBackground darkMode={darkMode} />}
      {prefersReducedMotion  && <PageBase darkMode={darkMode} />}

      <Box sx={{ minHeight: '100vh', color: 'text.primary', position: 'relative', bgcolor: 'transparent' }}>

        {/* AppBar */}
        <AppBar position="sticky" sx={{
          zIndex: 10,
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          bgcolor: darkMode
            ? alpha('#0a0b14', scrolled ? 0.90 : 0.70)
            : alpha('#ffffff', scrolled ? 0.92 : 0.72),
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
          transition: 'background 0.4s, border-color 0.3s',
          boxShadow: scrolled
            ? darkMode ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.07)'
            : 'none',
        }}>
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 56, sm: 64 } }}>

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMobile && (
                <IconButton color="inherit" onClick={toggleDrawer} edge="start" size="small">
                  <MenuIcon />
                </IconButton>
              )}
              <Box component={motion.div} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => goTo('/home')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
                
                <Typography variant="h6" fontWeight={800} sx={{
                  fontSize: '1.05rem',
                  background: 'linear-gradient(90deg, #6366f1 0%, #14b8a6 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.3px', display: { xs: 'none', sm: 'block' },
                }}>
                  TechMocks
                </Typography>
              </Box>
            </Box>

            {/* Desktop nav */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                {navItems.map(item => (
                  <Button key={item.label} startIcon={item.icon} onClick={item.action}
                    component={motion.button} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    sx={navLinkSx(item.path)}>
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Right controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <IconButton onClick={toggleDarkMode} component={motion.button} whileHover={{ rotate: 20 }} whileTap={{ scale: 0.85 }}
                sx={{
                  color: 'text.secondary',
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)' },
                  width: 36, height: 36,
                }}>
                <AnimatePresence mode="wait">
                  <motion.div key={darkMode ? 'sun' : 'moon'}
                    initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}>
                    {darkMode ? <WbSunnyIcon sx={{ fontSize: 18 }} /> : <NightsStayIcon sx={{ fontSize: 18 }} />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>

              {token ? (
                <Box component={motion.div} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton size="small" onClick={openProfileMenu} sx={{ p: 0.4 }}>
                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={<StarIcon sx={{ fontSize: 13, color: getRankColor(userRank.rank) }} />}>
                      <Avatar sx={{
                        width: isVerySmall ? 30 : 36, height: isVerySmall ? 30 : 36,
                        background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
                        fontSize: '0.85rem', fontWeight: 800,
                        boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
                      }}>
                        {getRankNumber(userRank.rank)}
                      </Avatar>
                    </Badge>
                  </IconButton>
                </Box>
              ) : (
                !isMobile && (
                  <Button variant="contained" size="small" onClick={() => goTo('/login')} sx={{
                    borderRadius: 2, px: 2.5, fontWeight: 600, fontSize: '0.85rem',
                    background: 'linear-gradient(90deg, #6366f1, #14b8a6)',
                    boxShadow: '0 0 16px rgba(99,102,241,0.35)',
                    '&:hover': { boxShadow: '0 0 24px rgba(99,102,241,0.5)' },
                  }}>
                    Login
                  </Button>
                )
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Profile menu */}
        <Menu anchorEl={profileMenuAnchor} open={Boolean(profileMenuAnchor)} onClose={closeProfileMenu}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 260, mt: 1.5, borderRadius: 3,
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              bgcolor: darkMode ? alpha('#0d0e1c', 0.92) : alpha('#fff', 0.95),
              boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.12)',
              overflow: 'visible',
              '&::before': {
                content: '""', display: 'block', position: 'absolute', top: -6, right: 16, width: 12, height: 12,
                bgcolor: darkMode ? alpha('#0d0e1c', 0.92) : alpha('#fff', 0.95),
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)',
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <Box sx={{ p: 2.5, pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg,#6366f1,#14b8a6)', fontSize: '0.8rem', fontWeight: 800 }}>
                {getRankNumber(userRank.rank)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>{username}</Typography>
                <Typography variant="caption" color="text.secondary">{email}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 1.5, px: 1, py: 0.75, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'inline-flex', gap: 0.8, alignItems: 'center' }}>
              <StarIcon sx={{ fontSize: 13, color: getRankColor(userRank.rank) }} />
              <Typography variant="caption" fontWeight={600} color="primary.main">{userRank.rank}</Typography>
              <Typography variant="caption" color="text.secondary">· {userRank.points} pts</Typography>
            </Box>
          </Box>
          {badges.length > 0 && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Badges</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {badges.slice(0, 5).map((b, i) => (
                    <Box key={i} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1, px: 1.2, py: 0.4, fontSize: '0.72rem', fontWeight: 500 }}>
                      {b.icon} {b.name}
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
          <Divider />
          <MenuItem onClick={() => { goTo('/profile'); closeProfileMenu(); }} sx={{ gap: 1.5, py: 1.2, mx: 1, my: 0.5, borderRadius: 1.5 }}>
            <AccountCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} /><Typography variant="body2">My Profile</Typography>
          </MenuItem>
          {role === 'admin' && (
            <MenuItem onClick={() => { goTo('/admin'); closeProfileMenu(); }} sx={{ gap: 1.5, py: 1.2, mx: 1, mb: 0.5, borderRadius: 1.5 }}>
              <AdminPanelSettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} /><Typography variant="body2">Admin Portal</Typography>
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={logout} sx={{ gap: 1.5, py: 1.2, mx: 1, my: 0.5, borderRadius: 1.5, color: 'error.main' }}>
            <LogoutIcon fontSize="small" /><Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Mobile drawer */}
        <Drawer variant="temporary" open={mobileOpen} onClose={toggleDrawer}
          sx={{ '& .MuiDrawer-paper': { width: 280, border: 'none', boxShadow: '8px 0 32px rgba(0,0,0,0.25)', bgcolor: 'transparent' } }}>
          {drawerContent}
        </Drawer>

        {/* Page content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
            {error && <Typography color="error" align="center" sx={{ mb: 3 }}>{error}</Typography>}
            <Outlet context={{ darkMode }} />
          </Container>
          <Footer />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;