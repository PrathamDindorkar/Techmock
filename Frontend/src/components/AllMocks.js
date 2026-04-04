import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, Grid, Accordion,
  AccordionSummary, AccordionDetails, Snackbar, Alert, CircularProgress,
  Chip, CardActionArea, useTheme, IconButton, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem, Button, Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon       from '@mui/icons-material/ExpandMore';
import AssignmentIcon       from '@mui/icons-material/Assignment';
import AccessTimeIcon       from '@mui/icons-material/AccessTime';
import QuizIcon             from '@mui/icons-material/Quiz';
import LockIcon             from '@mui/icons-material/Lock';
import AddShoppingCartIcon  from '@mui/icons-material/AddShoppingCart';
import FilterListIcon       from '@mui/icons-material/FilterList';
import AutoAwesomeIcon      from '@mui/icons-material/AutoAwesome';
import ReplayIcon           from '@mui/icons-material/Replay';
import Lottie from 'react-lottie';
import loadingAnimation from '../assets/animations/loading.json';
import countryToCurrency from 'country-to-currency';
import axios from 'axios';

const MotionCard      = motion(Card);
const MotionAccordion = motion(Accordion);

const PROGRAMMING_LANGUAGES = [
  'Java','Python','JavaScript','C++','React','Node.js',
  'Go','TypeScript','PHP','C#','Ruby','Swift','Kotlin',
];

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const EUROZONE_COUNTRIES = [
  'AT','BE','CY','DE','EE','ES','FI','FR','GR','HR',
  'IE','IT','LT','LU','LV','MT','NL','PT','SI','SK',
];

/* ─── tiny frosted helper (only where MUI paper token isn't enough) ─── */
const glassCard = (dark) => ({
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  bgcolor: dark ? 'rgba(15,16,28,0.55)' : 'rgba(255,255,255,0.58)',
  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
});

const AllMocks = () => {
  const [mockTests,       setMockTests]       = useState({});
  const [loading,         setLoading]         = useState(true);
  const [cartLoading,     setCartLoading]     = useState(false);
  const [alertOpen,       setAlertOpen]       = useState(false);
  const [alertMessage,    setAlertMessage]    = useState('');
  const [alertSeverity,   setAlertSeverity]   = useState('warning');
  const [expandedCategory,setExpandedCategory]= useState('');
  const [cartItems,       setCartItems]       = useState([]);
  const [purchasedTests,  setPurchasedTests]  = useState([]);
  const [userCurrency,    setUserCurrency]    = useState('INR');
  const [userCountry,     setUserCountry]     = useState('IN');
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [isLoggedIn,      setIsLoggedIn]      = useState(false);
  const [priceFilter,     setPriceFilter]     = useState('all');
  const [categoryFilter,  setCategoryFilter]  = useState('all');
  const [viewMode,        setViewMode]        = useState('all');
  const [aiRecs,          setAiRecs]          = useState([]);
  const [aiLoading,       setAiLoading]       = useState(false);
  const [aiError,         setAiError]         = useState('');

  const navigate   = useNavigate();
  const location   = useLocation();
  const theme      = useTheme();
  const dark       = theme.palette.mode === 'dark';

  /* category gradients */
  const catColors = {
    Science:             dark ? 'linear-gradient(135deg,#6b48ff,#a239ca)' : 'linear-gradient(135deg,#667eea,#764ba2)',
    Mathematics:         dark ? 'linear-gradient(135deg,#00c6ab,#0077b6)' : 'linear-gradient(135deg,#2193b0,#6dd5ed)',
    Languages:           dark ? 'linear-gradient(135deg,#003366,#0055aa)' : 'linear-gradient(135deg,#004080,#009de0)',
    History:             dark ? 'linear-gradient(135deg,#feca57,#ff9f43)' : 'linear-gradient(135deg,#f6d365,#fda085)',
    'General Knowledge': dark ? 'linear-gradient(135deg,#48dbfb,#0abde3)' : 'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
  };
  const defaultCat = dark
    ? 'linear-gradient(135deg,#003366,#0055aa)'
    : 'linear-gradient(135deg,#004080,#009de0)';

  /* ── currency ── */
  useEffect(() => {
    (async () => {
      const sc = localStorage.getItem('userCurrency');
      const sk = localStorage.getItem('userCountry');
      if (sc && sk) { setUserCurrency(sc); setUserCountry(sk); return; }
      try {
        const r = await axios.get('https://ipapi.co/json/');
        const cc = r.data.country_code || 'IN';
        const cu = countryToCurrency[cc] || 'INR';
        localStorage.setItem('userCurrency', cu);
        localStorage.setItem('userCountry', cc);
        setUserCountry(cc); setUserCurrency(cu);
      } catch {
        localStorage.setItem('userCurrency','INR'); localStorage.setItem('userCountry','IN');
      }
    })();
  }, []);

  /* ── fetch mocks + profile ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoggedIn(true);
          try {
            const pr = await axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: token } });
            const role = pr.data.role || 'user';
            setIsAdmin(role === 'admin');
            const pids = (pr.data?.purchasedTests || []).map(t => t._id || t.id);
            if (role !== 'admin') setPurchasedTests(pids);
            if (role !== 'admin') {
              try {
                const cr = await axios.get(`${backendUrl}/api/user/cart`, { headers: { Authorization: token } });
                setCartItems((cr.data?.cart || []).map(i => ({
                  id: i.mockTestId?._id || i.mockTestId?.id,
                  title: i.mockTestId?.title || 'Untitled',
                  price: i.price || 0,
                })));
              } catch {}
            }
          } catch (e) {
            if (e.response?.status === 401) { localStorage.removeItem('token'); setIsLoggedIn(false); }
          }
        } else { setIsLoggedIn(false); }

        const mr = await axios.get(`${backendUrl}/api/admin/get-all-mocks`);
        let data = mr.data;
        const lg = {};
        PROGRAMMING_LANGUAGES.forEach(l => { if (data[l]) { lg[l] = data[l]; delete data[l]; } });
        if (Object.keys(lg).length) data['Languages'] = lg;
        setMockTests(data);
        if (Object.keys(data).length) setExpandedCategory(Object.keys(data)[0]);
        if (isAdmin) {
          const ids = [];
          Object.values(data).forEach(c => {
            if (Array.isArray(c)) c.forEach(t => ids.push(t._id || t.id));
            else if (typeof c === 'object') Object.values(c).flat().forEach(t => ids.push(t._id || t.id));
          });
          setPurchasedTests(ids);
        }
      } catch { showAlert('Failed to load mock tests. Please try again.', 'error'); }
      finally { setLoading(false); }
    })();
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('type') === 'free') setPriceFilter('free');
  }, [location.search]);

  const showAlert = (msg, sev = 'warning') => { setAlertMessage(msg); setAlertSeverity(sev); setAlertOpen(true); };

  /* ── flat list ── */
  const allMocksList = useCallback(() => {
    const list = [];
    Object.entries(mockTests).forEach(([cat, data]) => {
      if (cat === 'Languages') {
        Object.entries(data).forEach(([lang, mocks]) =>
          mocks.forEach(m => list.push({ ...m, category: `Languages / ${lang}` }))
        );
      } else if (Array.isArray(data)) {
        data.forEach(m => list.push({ ...m, category: cat }));
      }
    });
    return list;
  }, [mockTests]);

  /* ── AI recs ── */
  const fetchAiRecs = useCallback(async () => {
    setAiLoading(true); setAiError(''); setAiRecs([]);
    const all = allMocksList();
    if (!all.length) { setAiError('No mock tests available to analyse.'); setAiLoading(false); return; }
    const summary = all.map(m => ({
      id: m._id || m.id, title: m.title, category: m.category,
      difficulty: m.difficulty || 'unknown',
      pricing: m.pricingType || m.pricing_type || 'free',
      questions: m.questions || 0,
    }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/ai/recommend-mocks`,
        { mockSummary: summary, purchasedIds: purchasedTests },
        { headers: { Authorization: token } }
      );
      const recs = res.data?.recommendations;
      if (Array.isArray(recs)) setAiRecs(recs.sort((a, b) => a.priority - b.priority));
      else setAiError('Unexpected response from AI. Please try again.');
    } catch (e) {
      setAiError(e.response?.data?.message || 'Could not load AI recommendations.');
    } finally { setAiLoading(false); }
  }, [allMocksList, purchasedTests]);

  useEffect(() => {
    if (viewMode === 'ai' && isLoggedIn && Object.keys(mockTests).length && !aiRecs.length && !aiLoading)
      fetchAiRecs();
  }, [viewMode, isLoggedIn, mockTests]);

  /* ── access ── */
  const canAccess   = m => isAdmin || (m?.pricingType || m?.pricing_type) === 'free' || purchasedTests.includes(m?._id || m?.id);
  const isPurchased = id => purchasedTests.includes(id);
  const isInCart    = id => cartItems.some(i => i.id === id);

  const findById = id => {
    for (const cat in mockTests) {
      if (cat === 'Languages') {
        for (const lang in mockTests[cat]) {
          const f = mockTests[cat][lang].find(m => m._id === id || m.id === id);
          if (f) return f;
        }
      } else {
        const f = mockTests[cat].find(m => m._id === id || m.id === id);
        if (f) return f;
      }
    }
    return null;
  };

  const handleCardClick = id => {
    if (!isLoggedIn) { showAlert('Please log in to access mock tests!'); setTimeout(() => navigate('/login'), 1500); return; }
    const m = findById(id);
    if (!m) return;
    if (canAccess(m)) navigate(`/mock-test/${id}`);
    else showAlert('Please purchase this test to access it!');
  };

  const handleAddToCart = async (id, e) => {
    e.stopPropagation();
    if (!isLoggedIn) { showAlert('Please log in to add items to cart!'); setTimeout(() => navigate('/login'), 1500); return; }
    if (isInCart(id)) { showAlert('Already in cart!', 'info'); return; }
    setCartLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/api/user/cart/add`, { mockTestId: id, currency: userCurrency }, { headers: { Authorization: token } });
      const m = findById(id);
      setCartItems(prev => [...prev, { id, title: m?.title || 'Untitled', price: m?.prices?.[userCurrency] || m?.prices?.USD || 0 }]);
      showAlert('Added to cart!', 'success');
    } catch (e) { showAlert(e.response?.data?.message || 'Failed to add to cart', 'error'); }
    finally { setCartLoading(false); }
  };

  /* ── price helpers ── */
  const fmtPrice = (amt, code) => {
    try {
      return { label: new Intl.NumberFormat(undefined, { style:'currency', currency:code, minimumFractionDigits: code==='JPY'?0:2, maximumFractionDigits:2 }).format(amt), color:'secondary' };
    } catch { return { label:`${amt} ${code}`, color:'secondary' }; }
  };
  const priceInfo = m => {
    if (isAdmin) return { label:'Free (Admin)', color:'success', variant:'outlined' };
    const pt = m.pricingType || m.pricing_type || 'free';
    if (pt === 'free') return { label:'Free', color:'success' };
    const p = m.prices || {};
    if (!Object.keys(p).length) return { label:'Price not set', color:'warning' };
    if (p[userCurrency] > 0) return fmtPrice(p[userCurrency], userCurrency);
    if (EUROZONE_COUNTRIES.includes(userCountry) && p.EUR > 0) return fmtPrice(p.EUR, 'EUR');
    if (userCountry === 'GB' && p.GBP > 0) return fmtPrice(p.GBP, 'GBP');
    if (p.USD > 0) return fmtPrice(p.USD, 'USD');
    return { label:'Price on request', color:'warning' };
  };
  const diffChip = d => {
    const l = (d||'').toLowerCase();
    if (l==='easy')   return <Chip icon={<AssignmentIcon />} label="Easy"   size="small" color="success" />;
    if (l==='medium') return <Chip icon={<AssignmentIcon />} label="Medium" size="small" color="warning" />;
    if (l==='hard')   return <Chip icon={<AssignmentIcon />} label="Hard"   size="small" color="error"   />;
    return null;
  };

  /* ═══════════════════════════════
     MOCK CARD — defined FIRST so
     renderAiPanel can call it safely
  ═══════════════════════════════ */
  const MockCard = ({ mock, aiReason, priority }) => {
    const id = mock._id || mock.id;
    const pi = priceInfo(mock);
    const locked = (mock.pricingType || mock.pricing_type) === 'paid' && !isAdmin && !isPurchased(id);

    return (
      <MotionCard
        whileHover={{ y: -6, boxShadow: dark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.12)' }}
        transition={{ type:'spring', stiffness:380, damping:22 }}
        elevation={0}
        sx={{
          height:'100%', borderRadius:3, overflow:'hidden', position:'relative',
          ...glassCard(dark), transition:'box-shadow 0.25s ease',
        }}
      >
        {/* Priority badge (AI mode) */}
        {priority && (
          <Box sx={{
            position:'absolute', top:10, left:12, zIndex:20,
            background:'linear-gradient(90deg,#6366f1,#14b8a6)',
            color:'#fff', borderRadius:999, px:1.5, py:0.25,
            fontSize:'0.68rem', fontWeight:800, letterSpacing:'0.05em',
            boxShadow:'0 2px 10px rgba(99,102,241,0.4)',
            lineHeight:1.6,
          }}>
            #{priority} Pick
          </Box>
        )}

        {/* Lock badge */}
        {locked && (
          <Box sx={{ position:'absolute', top:10, right:10, zIndex:20, bgcolor:'rgba(0,0,0,0.6)', borderRadius:'50%', p:0.8, display:'flex' }}>
            <LockIcon sx={{ color:'#fff', fontSize:18 }} />
          </Box>
        )}

        <CardActionArea onClick={() => handleCardClick(id)} sx={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'stretch' }}>
          {/* Header strip */}
          <Box sx={{
            height: { xs: 90, sm: 110 },
            bgcolor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            borderBottom:`1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
            position:'relative',
          }}>
            <AssignmentIcon sx={{ fontSize:{ xs:44, sm:52 }, opacity:0.13, color:'primary.main' }} />
          </Box>

          {/* AI reason bar */}
          {aiReason && (
            <Box sx={{
              px:{ xs:1.5, sm:2 }, py:0.75,
              background:'linear-gradient(90deg,rgba(99,102,241,0.13),rgba(20,184,166,0.10))',
              borderBottom:`1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.10)'}`,
              display:'flex', alignItems:'flex-start', gap:0.8,
            }}>
              <AutoAwesomeIcon sx={{ fontSize:13, color:'primary.main', mt:0.2, flexShrink:0 }} />
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight:1.4, fontSize:'0.70rem' }}>
                {aiReason}
              </Typography>
            </Box>
          )}

          <CardContent sx={{ flexGrow:1, p:{ xs:2, sm:2.5 }, display:'flex', flexDirection:'column', gap:1 }}>
            {/* Title row */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:1 }}>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3} sx={{ fontSize:{ xs:'0.9rem', sm:'1rem' } }}>
                {mock.title}
              </Typography>
              {!isAdmin && (mock.pricingType || mock.pricing_type) === 'paid' && !isPurchased(id) && (
                <IconButton size="small" color="primary"
                  onClick={e => handleAddToCart(id, e)}
                  disabled={isInCart(id) || cartLoading}
                  sx={{ flexShrink:0, mt:-0.5 }}>
                  {cartLoading ? <CircularProgress size={18} /> : <AddShoppingCartIcon sx={{ fontSize:18 }} />}
                </IconButton>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight:1.55, fontSize:{ xs:'0.78rem', sm:'0.82rem' }, flexGrow:1,
              display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
              {mock.description || 'No description provided'}
            </Typography>

            {/* Chips */}
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt:'auto' }}>
              {diffChip(mock.difficulty)}
              <Chip label={pi.label} size="small" color={pi.color} variant={pi.variant || 'filled'} />
            </Stack>

            <Divider sx={{ borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }} />

            {/* Meta chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<AccessTimeIcon fontSize="small" />}
                label={`${mock.timeLimit || mock.time_limit || '?'} min`}
                size="small" variant="outlined"
                sx={{ fontSize:{ xs:'0.7rem', sm:'0.75rem' } }} />
              <Chip icon={<QuizIcon fontSize="small" />}
                label={`${mock.questions || 0} Qs`}
                size="small" variant="outlined"
                sx={{ fontSize:{ xs:'0.7rem', sm:'0.75rem' } }} />
            </Stack>
          </CardContent>
        </CardActionArea>
      </MotionCard>
    );
  };

  /* ── loading ── */
  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
      <Lottie options={{ loop:true, autoplay:true, animationData:loadingAnimation, rendererSettings:{ preserveAspectRatio:'xMidYMid slice' } }} height={220} width={220} />
      <Typography variant="h6" color="text.secondary" sx={{ mt:3, fontWeight:500 }}>Loading Mock Tests…</Typography>
    </Box>
  );

  /* ── AI panel ── */
  const AiPanel = () => (
    <Box sx={{ mb:5 }}>
      {/* Header */}
      <Stack direction={{ xs:'column', sm:'row' }} alignItems={{ xs:'flex-start', sm:'center' }}
        justifyContent="space-between" spacing={2} sx={{ mb:3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AutoAwesomeIcon sx={{ color:'primary.main', fontSize:{ xs:22, sm:26 } }} />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize:{ xs:'1.1rem', sm:'1.5rem' } }}>
              AI Recommended for You
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize:{ xs:'0.75rem', sm:'0.875rem' } }}>
              Personalised pick based on profile
            </Typography>
          </Box>
        </Stack>
        <Button size="small"
          startIcon={aiLoading ? <CircularProgress size={14} color="inherit" /> : <ReplayIcon />}
          onClick={fetchAiRecs} disabled={aiLoading} variant="outlined"
          sx={{ borderRadius:2, textTransform:'none', alignSelf:{ xs:'flex-start', sm:'auto' } }}>
          {aiLoading ? 'Thinking…' : 'Refresh'}
        </Button>
      </Stack>

      {aiError && <Alert severity="warning" sx={{ mb:3, borderRadius:2 }}>{aiError}</Alert>}

      {/* Skeletons */}
      {aiLoading && (
        <Grid container spacing={{ xs:2, sm:3 }}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={0} sx={{ ...glassCard(dark), borderRadius:3, overflow:'hidden' }}>
                <Skeleton variant="rectangular" height={100} />
                <CardContent>
                  <Skeleton width="70%" height={24} />
                  <Skeleton width="100%" height={16} sx={{ mt:1 }} />
                  <Skeleton width="55%"  height={16} sx={{ mt:0.5 }} />
                  <Skeleton width="38%"  height={22} sx={{ mt:2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Results */}
      {!aiLoading && aiRecs.length > 0 && (
        <Grid container spacing={{ xs:2, sm:3 }}>
          {aiRecs.map(rec => {
            const mock = findById(rec.mockId);
            if (!mock) return null;
            return (
              <Grid item xs={12} sm={6} md={4} key={rec.mockId}>
                <MockCard mock={mock} aiReason={rec.reason} priority={rec.priority} />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Empty */}
      {!aiLoading && !aiError && !aiRecs.length && (
        <Box textAlign="center" py={{ xs:5, sm:8 }}>
          <AutoAwesomeIcon sx={{ fontSize:{ xs:36, sm:48 }, opacity:0.15, mb:2, display:'block', mx:'auto' }} />
          <Typography color="text.secondary" sx={{ fontSize:{ xs:'0.85rem', sm:'1rem' } }}>
            Click Refresh to get your Gemini-powered recommendations.
          </Typography>
        </Box>
      )}
    </Box>
  );

  /* ── main render ── */
  return (
    <Box sx={{ minHeight:'100vh', pb:{ xs:6, sm:8 } }}>

      {/* Hero */}
      <Box sx={{
        background: dark
          ? 'linear-gradient(135deg,rgba(0,51,102,0.60),rgba(0,85,170,0.50))'
          : 'linear-gradient(135deg,rgba(0,64,128,0.65),rgba(0,157,224,0.55))',
        backdropFilter:'blur(20px) saturate(160%)',
        WebkitBackdropFilter:'blur(20px) saturate(160%)',
        border:`1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)'}`,
        color:'white',
        pt:{ xs:4, sm:6, md:8 }, pb:{ xs:3, sm:4, md:6 }, mb:{ xs:3, sm:5 },
        borderRadius:{ xs:0, md:3 }, mx:{ xs:0, md:2 },
        overflow:'hidden', position:'relative',
      }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
            <Typography variant="h3" component="h1" fontWeight={800} gutterBottom
              sx={{ letterSpacing:'-0.5px', textShadow:'0 2px 12px rgba(0,0,0,0.3)', fontSize:{ xs:'1.8rem', sm:'2.4rem', md:'3rem' } }}>
              Mock Tests
            </Typography>

            {isLoggedIn ? (
              <Box sx={{ mt:{ xs:1.5, sm:2 }, mb:1 }}>
                <Stack direction="row" spacing={0.5} sx={{
                  bgcolor:'rgba(255,255,255,0.12)', borderRadius:999, p:0.5,
                  display:'inline-flex', backdropFilter:'blur(4px)',
                  border:'1px solid rgba(255,255,255,0.18)',
                }}>
                  {[{ key:'all', label:'All Tests' }, { key:'ai', label:'✦ AI Recommended' }].map(({ key, label }) => (
                    <Button key={key} size="small" onClick={() => setViewMode(key)} sx={{
                      borderRadius:999, px:{ xs:2, sm:3 },
                      fontSize:{ xs:'0.75rem', sm:'0.875rem' },
                      color: viewMode===key ? '#6366f1' : 'white',
                      bgcolor: viewMode===key ? 'white' : 'transparent',
                      fontWeight: viewMode===key ? 700 : 500,
                      whiteSpace:'nowrap',
                      '&:hover':{ bgcolor: viewMode===key ? 'white' : 'rgba(255,255,255,0.2)' },
                      transition:'all 0.2s',
                    }}>
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Box>
            ) : (
              <Typography variant="h6" sx={{ mt:1, mb:1, opacity:0.9, fontSize:{ xs:'1rem', sm:'1.25rem' } }}>
                Choose a category and start practising
              </Typography>
            )}
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg">

        {/* AI panel */}
        {viewMode === 'ai' && isLoggedIn && <AiPanel />}

        {/* Filters */}
        {viewMode === 'all' && (
          <Card elevation={0} sx={{ mb:{ xs:3, sm:5 }, borderRadius:3, overflow:'hidden', ...glassCard(dark) }}>
            <Box sx={{ p:{ xs:2, sm:3 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <FilterListIcon color="primary" />
                <Typography variant="h6" fontWeight={600} sx={{ fontSize:{ xs:'1rem', sm:'1.25rem' } }}>
                  Filter Mock Tests
                </Typography>
              </Stack>
              <Grid container spacing={{ xs:1.5, sm:2.5 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Price</InputLabel>
                    <Select value={priceFilter} label="Price" onChange={e => setPriceFilter(e.target.value)}>
                      <MenuItem value="all">All Prices</MenuItem>
                      <MenuItem value="free">Free Only</MenuItem>
                      <MenuItem value="paid">Paid Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select value={categoryFilter} label="Category"
                      onChange={e => { setCategoryFilter(e.target.value); if (e.target.value !== 'all') setExpandedCategory(e.target.value); }}>
                      <MenuItem value="all">All Categories</MenuItem>
                      {Object.keys(mockTests).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Card>
        )}

        {/* Accordions */}
        {viewMode === 'all' && (
          !Object.keys(mockTests).length ? (
            <Box textAlign="center" py={10}>
              <Typography variant="h5" color="text.secondary" gutterBottom>No mock tests available at the moment</Typography>
              <Typography color="text.secondary">Please check back later or contact support</Typography>
            </Box>
          ) : (
            Object.entries(mockTests)
              .filter(([cat]) => categoryFilter === 'all' || cat === categoryFilter)
              .map(([category, testsData]) => {
                let fd = testsData; let total = 0;
                if (priceFilter !== 'all') {
                  if (category === 'Languages') {
                    fd = {};
                    Object.entries(testsData).forEach(([lang, ms]) => {
                      const fm = ms.filter(m => (m.pricingType || m.pricing_type) === priceFilter);
                      if (fm.length) fd[lang] = fm; total += fm.length;
                    });
                  } else {
                    fd = testsData.filter(m => (m.pricingType || m.pricing_type) === priceFilter);
                    total = fd.length;
                  }
                } else {
                  total = category === 'Languages'
                    ? Object.values(testsData).reduce((s, a) => s + a.length, 0)
                    : testsData.length;
                }
                if (!total) return null;
                const isLang = category === 'Languages';

                return (
                  <MotionAccordion key={category}
                    expanded={expandedCategory === category}
                    onChange={(_, exp) => setExpandedCategory(exp ? category : '')}
                    sx={{
                      mb:{ xs:2.5, sm:4 }, borderRadius:'16px !important', overflow:'hidden',
                      boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)',
                      '&:before':{ display:'none' },
                      ...glassCard(dark, 0.5),
                    }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color:'white' }} />}
                      sx={{ background: catColors[category] || defaultCat, minHeight:{ xs:58, sm:72 },
                        '& .MuiAccordionSummary-content':{ alignItems:'center', my:{ xs:1, sm:1.5 } } }}>
                      <Typography variant="h5" fontWeight={700} color="white" flexGrow={1}
                        sx={{ fontSize:{ xs:'1rem', sm:'1.25rem', md:'1.5rem' } }}>
                        {category}
                      </Typography>
                      <Chip label={`${total} Tests`} size="small"
                        sx={{ bgcolor:'rgba(255,255,255,0.20)', color:'white', fontWeight:600, fontSize:{ xs:'0.7rem', sm:'0.75rem' } }} />
                    </AccordionSummary>

                    <AccordionDetails sx={{ p:{ xs:2, sm:3.5 }, bgcolor:'transparent' }}>
                      {isLang ? (
                        Object.entries(fd).map(([lang, mocks]) => (
                          <Box key={lang} sx={{ mb:{ xs:3, sm:5 } }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb:{ xs:1.5, sm:3 }, fontSize:{ xs:'0.95rem', sm:'1.25rem' } }}>
                              {lang}
                            </Typography>
                            <Grid container spacing={{ xs:2, sm:3 }}>
                              {mocks.map(m => (
                                <Grid item xs={12} sm={6} md={4} key={m._id || m.id}>
                                  <MockCard mock={m} />
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ))
                      ) : (
                        <Grid container spacing={{ xs:2, sm:3 }}>
                          {fd.map(m => (
                            <Grid item xs={12} sm={6} md={4} key={m._id || m.id}>
                              <MockCard mock={m} />
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </AccordionDetails>
                  </MotionAccordion>
                );
              })
          )
        )}
      </Container>

      {/* Snackbar — below navbar */}
      <Snackbar open={alertOpen} autoHideDuration={4500} onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}
        sx={{ top:{ xs:'72px !important', sm:'80px !important' }, zIndex: theme.zIndex.snackbar }}>
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} variant="filled"
          sx={{ width:'100%', maxWidth:{ xs:'92vw', sm:500 }, boxShadow:6, borderRadius:2 }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AllMocks;