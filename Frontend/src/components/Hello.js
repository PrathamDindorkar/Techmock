import React, { useState, useEffect } from 'react';
import {
  Stack, Card, CardContent, Typography, Box, Button, Tabs, Tab, Avatar,
  Chip, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Paper, useTheme, Badge as MuiBadge,
  TextField, MenuItem, Select, FormControl, InputLabel, Alert, Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  AssignmentTurnedIn, School, Psychology, Home, PeopleAlt, Delete,
  Star, AssignmentInd, RecordVoiceOver,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import generateCertificatePDF from './CertificateService';

const Hello = ({ darkMode }) => {
  const navigate = useNavigate();

  /* ─── States ─────────────────────────────────────────────────── */
  const [mockTests, setMockTests] = useState([]);
  const [purchasedTests, setPurchasedTests] = useState([]);
  const [allPurchasedTests, setAllPurchasedTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userRank, setUserRank] = useState({ rank: 'Beginner', points: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);

  // Mock-test assignment
  const [assignUserId, setAssignUserId] = useState('');
  const [assignMockId, setAssignMockId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Interview assignment
  const [assignIvUserId, setAssignIvUserId] = useState('');
  const [assignIvId, setAssignIvId] = useState('');
  const [assignIvLoading, setAssignIvLoading] = useState(false);
  const [assignIvSuccess, setAssignIvSuccess] = useState('');
  const [assignIvError, setAssignIvError] = useState('');
  const [ivUserSearch, setIvUserSearch] = useState('');

  // My Interview Attempts
  const [myInterviewAttempts, setMyInterviewAttempts] = useState([]);

  // User purchased interviews
  const [purchasedInterviews, setPurchasedInterviews] = useState([]);
  // Admin purchased interviews
  const [allPurchasedInterviews, setAllPurchasedInterviews] = useState([]);

  const token = localStorage.getItem('token');
  const theme = useTheme();

  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';
  const textSecondary = darkMode ? '#aaaaaa' : 'text.secondary';
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  /* ─── Styled components ─────────────────────────────────────── */
  const BadgeCard = styled(Card)(({ theme, rankColor }) => ({
    p: 2, minWidth: '180px', borderRadius: 12,
    boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${rankColor}20 100%)`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': { transform: 'scale(1.05) rotate(2deg)' },
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  }));

  /* ─── Data fetch ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const isAdminUser = decodedToken.role === 'admin';
      setIsAdmin(isAdminUser);

      const fetchData = async () => {
        setLoading(true); setError(null);
        try {
          const mockTestsUrl = isAdminUser
            ? `${backendUrl}/api/admin/mock-tests`
            : `${backendUrl}/api/admin/get-all-mocks`;

          const [userResponse, mockResponse, badgesResponse, rankResponse, interviewsResponse] =
            await Promise.all([
              axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: token } }),
              isAdminUser
                ? axios.get(mockTestsUrl, { headers: { Authorization: token } })
                : axios.get(mockTestsUrl),
              axios.get(`${backendUrl}/api/user/badges`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/user/rank`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/interviews`),
            ]);

          setUserData(userResponse.data);

          const rawPurchased = Array.isArray(userResponse.data.purchasedTests)
            ? userResponse.data.purchasedTests : [];
          setPurchasedTests(rawPurchased.map(test => ({
            ...test,
            id: test.id || test._id,
            pricing_type: test.pricing_type || test.pricingType || 'free',
            time_limit: test.time_limit || test.timeLimit || 10,
            questions: Array.isArray(test.questions) ? test.questions : [],
          })));

          if (isAdminUser) {
            setMockTests(Array.isArray(mockResponse.data) ? mockResponse.data : []);
          } else {
            const grouped = mockResponse.data;
            const flatTests = grouped && typeof grouped === 'object' && !Array.isArray(grouped)
              ? Object.values(grouped).flat().map(test => ({
                ...test,
                pricing_type: test.pricing_type || test.pricingType || 'free',
                questions: Array.isArray(test.questions) ? test.questions : [],
              }))
              : [];
            setMockTests(flatTests);
          }

          setBadges(Array.isArray(badgesResponse.data) ? badgesResponse.data : []);
          setUserRank(rankResponse.data);
          setAllInterviews(Array.isArray(interviewsResponse.data) ? interviewsResponse.data : []);

          if (isAdminUser) {
            const [purchasedTestsRes, submissionsRes, usersRes, purchasedIvRes] = await Promise.all([
              axios.get(`${backendUrl}/api/admin/purchased-tests`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/admin/submissions`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/admin/users`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/admin/purchased-interviews`, { headers: { Authorization: token } }),
            ]);
            setAllPurchasedTests(Array.isArray(purchasedTestsRes.data) ? purchasedTestsRes.data : []);
            setAllSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : []);
            setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setAllPurchasedInterviews(Array.isArray(purchasedIvRes.data) ? purchasedIvRes.data : []);
          } else {
            const [submissionRes, purchasedIvRes, interviewAttemptsRes] = await Promise.all([
              axios.get(`${backendUrl}/api/submissions`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/user/purchased-interviews`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/interview-attempts`, { headers: { Authorization: token } }),
            ]);
            setSubmissions(Array.isArray(submissionRes.data) ? submissionRes.data : []);
            setPurchasedInterviews(Array.isArray(purchasedIvRes.data) ? purchasedIvRes.data : []);
            setMyInterviewAttempts(Array.isArray(interviewAttemptsRes.data) ? interviewAttemptsRes.data : []);
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to fetch data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } catch (err) {
      console.error('Invalid or expired token:', err);
      setError('Invalid or expired token. Please log in again.');
      navigate('/login');
      setLoading(false);
    }
  }, [token, navigate]);

  /* ─── Fetch full question arrays for user accuracy ───────────── */
  useEffect(() => {
    if (isAdmin || submissions.length === 0 || mockTests.length === 0) return;
    const submittedIds = [...new Set(submissions.map(s => s.mock_test_id.toString()))];
    const missingIds = submittedIds.filter(id => {
      const test = mockTests.find(t => (t.id || t._id || '').toString() === id);
      if (!test) return true;
      return !Array.isArray(test.questions) || test.questions.length === 0 || test.questions[0] === null;
    });
    if (missingIds.length === 0) return;

    const fetchFull = async () => {
      const results = {};
      await Promise.all(missingIds.map(async (id) => {
        try {
          const res = await axios.get(`${backendUrl}/api/mock-test/${id}`);
          if (res.data && Array.isArray(res.data.questions)) results[id] = res.data.questions;
        } catch { }
      }));
      if (Object.keys(results).length > 0) {
        setMockTests(prev => prev.map(test => {
          const id = (test.id || test._id || '').toString();
          return results[id] ? { ...test, questions: results[id] } : test;
        }));
      }
    };
    fetchFull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length, mockTests.length, isAdmin]);

  /* ─── Helpers ────────────────────────────────────────────────── */
  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);
  const handleReviewMock = (mockId) => navigate(`/mock-test/${mockId}/review`);
  const handleReAttemptMock = async (mockId) => {
    try {
      await axios.post(`${backendUrl}/api/mock-test/${mockId}/submit`, { answers: {} }, { headers: { Authorization: token } });
      navigate(`/mock-test/${mockId}`);
    } catch { setError('Failed to start re-attempt. Please try again.'); }
  };
  const handleDeleteSubmission = async (submissionId) => {
    try {
      await axios.delete(`${backendUrl}/api/admin/submissions/${submissionId}`, { headers: { Authorization: token } });
      setAllSubmissions(allSubmissions.filter(s => s.id !== submissionId));
    } catch { setError('Failed to delete submission.'); }
  };

  /* ─── Assign mock test (admin) ───────────────────────────────── */
  const handleAssignTest = async () => {
    if (!assignUserId || !assignMockId) { setAssignError('Please select both a user and a mock test.'); return; }
    setAssignLoading(true); setAssignError(''); setAssignSuccess('');
    try {
      await axios.post(
        `${backendUrl}/api/admin/assign-mock-test`,
        { userId: assignUserId, mockTestId: assignMockId },
        { headers: { Authorization: token } }
      );
      setAssignSuccess('Mock test assigned! The user will receive an email.');
      setAssignUserId(''); setAssignMockId(''); setUserSearch('');
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign mock test.');
    } finally {
      setAssignLoading(false);
    }
  };

  /* ─── Assign interview (admin) ───────────────────────────────── */
  const handleAssignInterview = async () => {
    if (!assignIvUserId || !assignIvId) { setAssignIvError('Please select both a user and an interview.'); return; }
    setAssignIvLoading(true); setAssignIvError(''); setAssignIvSuccess('');
    try {
      await axios.post(
        `${backendUrl}/api/admin/assign-interview`,
        { userId: assignIvUserId, interviewId: assignIvId },
        { headers: { Authorization: token } }
      );
      setAssignIvSuccess('Interview assigned! The user will receive an email.');
      setAssignIvUserId(''); setAssignIvId(''); setIvUserSearch('');
    } catch (err) {
      setAssignIvError(err.response?.data?.message || 'Failed to assign interview.');
    } finally {
      setAssignIvLoading(false);
    }
  };

  /* ─── Score helpers ──────────────────────────────────────────── */
  const getRankColor = (rank) => ({
    Master: '#FFD700', Expert: '#C0C0C0', Advanced: '#CD7F32',
    Intermediate: '#4CAF50',
  }[rank] || '#2196F3');

  const getMockAccuracy = (mockId) => {
    const submission = (allSubmissions.find(s => s.mock_test_id?.toString() === mockId?.toString())
      || submissions.find(s => s.mock_test_id?.toString() === mockId?.toString()));
    if (!submission) return 0;
    const mockTest = [...mockTests, ...purchasedTests].find(t => (t.id || t._id || '').toString() === mockId?.toString());
    if (!mockTest) return 0;
    const questions = Array.isArray(mockTest.questions) ? mockTest.questions.filter(q => q !== null) : [];
    if (!questions.length) return 0;
    const answers = submission.answers || {};
    let correct = 0;
    questions.forEach((q, i) => {
      const a = answers[i.toString()];
      if (a != null && a !== '' && a.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) correct++;
    });
    return Math.round((correct / questions.length) * 100);
  };

  const getCorrectCount = (mockId) => {
    const submission = allSubmissions.find(s => s.mock_test_id?.toString() === mockId?.toString())
      || submissions.find(s => s.mock_test_id?.toString() === mockId?.toString());
    if (!submission) return 0;
    const mockTest = [...mockTests, ...purchasedTests].find(t => (t.id || t._id || '').toString() === mockId?.toString());
    if (!mockTest) return 0;
    const questions = Array.isArray(mockTest.questions) ? mockTest.questions.filter(q => q !== null) : [];
    const answers = submission.answers || {};
    let correct = 0;
    questions.forEach((q, i) => {
      const a = answers[i.toString()];
      if (a != null && a !== '' && a.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) correct++;
    });
    return correct;
  };

  const getTotalQuestions = (mockId) => {
    const mockTest = [...mockTests, ...purchasedTests].find(t => (t.id || t._id || '').toString() === mockId?.toString());
    return mockTest ? (Array.isArray(mockTest.questions) ? mockTest.questions.filter(q => q !== null).length : 0) : 0;
  };

  const getCategoryStats = () => {
    const stats = {};
    submissions.forEach(sub => {
      const mock = [...mockTests, ...purchasedTests].find(t => (t.id || t._id || '').toString() === sub.mock_test_id?.toString());
      if (!mock) return;
      const cat = mock.category;
      const qs = Array.isArray(mock.questions) ? mock.questions.filter(q => q !== null) : [];
      if (!stats[cat]) stats[cat] = { correct: 0, answered: 0, total: qs.length };
      const answers = sub.answers || {};
      qs.forEach((q, i) => {
        const a = answers[i.toString()];
        if (a !== undefined && a !== null && a !== '') {
          stats[cat].answered++;
          if (a.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) stats[cat].correct++;
        }
      });
    });
    return Object.entries(stats).map(([category, s]) => ({
      category,
      accuracy: s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0,
      totalQuestionsAnswered: s.answered,
      totalQuestions: s.total,
    }));
  };

  const getMockTestStats = () => {
    const totalTests = mockTests?.length || 0;
    const totalQuestions = mockTests?.reduce((s, t) => s + (Array.isArray(t.questions) ? t.questions.length : 0), 0) || 0;
    const categoryCounts = mockTests?.reduce((acc, t) => {
      const cat = t?.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {}) || {};
    return { totalTests, totalQuestions, categoryCounts };
  };

  const categoryStats = !isAdmin ? getCategoryStats() : [];
  const mockTestStats = isAdmin ? getMockTestStats() : null;
  const totalAnswered = categoryStats.reduce((s, st) => s + st.totalQuestionsAnswered, 0);
  const totalQuestions = categoryStats.reduce((s, st) => s + st.totalQuestions, 0);
  const overallProgress = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;
  const overallAccuracy = totalAnswered > 0
    ? categoryStats.reduce((s, st) => s + st.accuracy * st.totalQuestionsAnswered, 0) / totalAnswered : 0;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: bgColor }}>
      <Typography variant="h6" color="error">{error}</Typography>
    </Box>
  );

  /* ─── Reusable UserAssignSelector ────────────────────────────── */
  const UserAssignSelector = ({ value, onChange, inputValue, onInputChange, label = 'Select User' }) => (
    <Autocomplete
      options={allUsers}
      getOptionLabel={u => u.name ? `${u.name} (${u.email})` : (u.email || '')}
      value={allUsers.find(u => (u.id || u._id || '').toString() === value) || null}
      onChange={(_, v) => onChange(v ? (v.id || v._id || '').toString() : '')}
      inputValue={inputValue}
      onInputChange={(_, v) => onInputChange(v)}
      renderInput={params => (
        <TextField {...params} label={label} placeholder="Search by name or email…"
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default, color: textPrimary }, '& .MuiInputLabel-root': { color: textSecondary } }}
        />
      )}
      renderOption={(props, u) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
            {(u.name || u.email || '?').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">{u.name || '—'}</Typography>
            <Typography variant="caption" color="text.secondary">{u.email}</Typography>
          </Box>
        </Box>
      )}
      noOptionsText="No users found"
      fullWidth
    />
  );

  /* ─── TABS config ─────────────────────────────────────────────── */
  const adminTabs = [
    { icon: <Home />, label: 'DASHBOARD' },
    { icon: <AssignmentTurnedIn />, label: 'SUBMISSIONS' },
    { icon: <AssignmentInd />, label: 'ASSIGN TEST' },
    { icon: <RecordVoiceOver />, label: 'ASSIGN INTERVIEW' },
  ];

  const userTabs = [
    { icon: <Home />, label: 'DASHBOARD' },
    { icon: <School />, label: 'MOCK EXAMS' },
    { icon: <Psychology />, label: 'FREE TECHMOCKS' },
    { icon: <RecordVoiceOver />, label: 'MY INTERVIEWS' },
  ];

  const tabs = isAdmin ? adminTabs : userTabs;

  return (
    <Box sx={{
      maxWidth: 1200, mx: 'auto', p: 3,
      bgcolor: theme.palette.background.default,
      color: textPrimary, borderRadius: 2,
      boxShadow: darkMode ? '0 0 10px rgba(0,0,0,0.2)' : '0 0 10px rgba(0,0,0,0.05)',
      minHeight: '90vh',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MuiBadge badgeContent={<Star sx={{ color: getRankColor(userRank.rank) }} />}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }} src={userData?.profilePicture}>
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
            </MuiBadge>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: textPrimary }}>
                {getGreeting()}, {userData?.name || 'User'}!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" color={textSecondary}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>
                <Chip label={`${userRank.rank} (${userRank.points} pts)`}
                  sx={{ bgcolor: getRankColor(userRank.rank), color: 'white', fontWeight: 'bold' }} />
                {isAdmin && <Chip label="ADMIN" color="primary" size="small" sx={{ ml: 1, fontWeight: 'bold' }} />}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Badges strip */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: textPrimary, mb: 2 }}>Your Badges</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {badges.length > 0 ? badges.map((badge, i) => (
              <Card key={i} sx={{ p: 2, minWidth: '150px', borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{badge.icon}</Typography>
                  <Typography variant="body1" fontWeight="bold" color={textPrimary}>{badge.name}</Typography>
                </Box>
                <Typography variant="body2" color={textSecondary}>{badge.description}</Typography>
                <Typography variant="caption" color={textSecondary}>
                  Earned: {new Date(badge.earned_at).toLocaleDateString()}
                </Typography>
              </Card>
            )) : (
              <Typography variant="body1" color={textSecondary}>
                No badges earned yet. Complete more tests to earn badges!
              </Typography>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, mb: 3, boxShadow: `0 2px 4px ${borderColor}` }}>
        <Tabs
          value={tabIndex} onChange={handleTabChange}
          variant="fullWidth" scrollButtons="auto"
          textColor="primary" indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* ══════════════════════════════════════════════════════
          TAB 0 — DASHBOARD
      ══════════════════════════════════════════════════════ */}
      {tabIndex === 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {isAdmin ? (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Mock Tests</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{mockTestStats.totalTests}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total questions: {mockTestStats.totalQuestions}</Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, background: 'linear-gradient(135deg,#7c6af7,#a78bfa)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Interviews</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{allInterviews.length}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Paid: {allInterviews.filter(iv => iv.pricing_type === 'paid').length}
                    </Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, background: 'linear-gradient(135deg,#43e97b,#38f9d7)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Registered Users</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{allUsers.length || 0}</Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, background: 'linear-gradient(135deg,#ff9a9e,#fad0c4)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Submissions</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{allSubmissions.length}</Typography>
                  </Card>
                </Box>
              </motion.div>

              {/* All purchased mock tests */}
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Purchased Mock Tests</Typography>
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['User', 'Email', 'Test', 'Category', 'Type', 'Price', 'Date'].map(h => (
                          <TableCell key={h}><Typography fontWeight="bold" color={textPrimary}>{h}</Typography></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPurchasedTests.map((p, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                          <TableCell sx={{ color: textPrimary }}>{p.userName}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.userEmail}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.mockTestTitle}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.category}</TableCell>
                          <TableCell>
                            <Chip label={p.pricingType?.toUpperCase()} size="small" color={p.pricingType === 'free' ? 'success' : 'primary'} />
                          </TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.priceDisplay || 'N/A'}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{new Date(p.purchaseDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {allPurchasedTests.length === 0 && (
                        <TableRow><TableCell colSpan={7} align="center" sx={{ color: textSecondary }}>No purchased tests found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>

              {/* All purchased interviews */}
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Purchased Interviews</Typography>
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['User', 'Email', 'Interview', 'Job Role', 'Price', 'Date'].map(h => (
                          <TableCell key={h}><Typography fontWeight="bold" color={textPrimary}>{h}</Typography></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPurchasedInterviews.map((p, i) => (
                        <TableRow key={i} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                          <TableCell sx={{ color: textPrimary }}>{p.userName}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.userEmail}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.interviewTitle}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.jobRole}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{p.priceDisplay}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{new Date(p.purchaseDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {allPurchasedInterviews.length === 0 && (
                        <TableRow><TableCell colSpan={6} align="center" sx={{ color: textSecondary }}>No purchased interviews found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>

              {/* Category breakdown */}
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Mock Tests by Category</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(mockTestStats.categoryCounts).map(([cat, count], i) => (
                    <Card key={i} sx={{ p: 3, minWidth: '200px', borderRadius: 2, bgcolor: theme.palette.background.default }}>
                      <Typography variant="h6" color={textPrimary}>{cat}</Typography>
                      <Typography variant="h4" sx={{ my: 2 }} color={textPrimary}>{count}</Typography>
                      <Typography variant="body2" color={textSecondary}>
                        {Math.round((count / mockTestStats.totalTests) * 100)}% of total
                      </Typography>
                    </Card>
                  ))}
                  {Object.keys(mockTestStats.categoryCounts).length === 0 && (
                    <Typography variant="body1" color={textSecondary}>No mock tests created yet</Typography>
                  )}
                </Box>
              </motion.div>
            </>
          ) : (
            /* ── USER DASHBOARD ─────────────────────────────────── */
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Overall Progress</Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress variant="determinate" value={overallProgress} size={80} thickness={6} sx={{ color: 'white' }} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body1" fontWeight="bold">{Math.round(overallProgress)}%</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Answered: {totalAnswered} / {totalQuestions}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Avg accuracy: {Math.round(overallAccuracy)}%</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Rank: {userRank.rank} ({userRank.points} pts)</Typography>
                        {totalAnswered === 0 && <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>No progress yet. Start a mock test!</Typography>}
                      </Box>
                    </Box>
                  </Card>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, bgcolor: theme.palette.background.default }}>
                    <Typography variant="h6" fontWeight="bold" color={textPrimary}>Latest Achievement</Typography>
                    {badges.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">{badges[0].icon}</Typography>
                          <Typography variant="body1" fontWeight="medium" color={textPrimary}>{badges[0].name}</Typography>
                        </Box>
                        <Typography variant="body2" color={textSecondary}>{badges[0].description}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mt: 2, color: textSecondary }}>No badges yet. Start a mock test!</Typography>
                    )}
                  </Card>
                </Box>
              </motion.div>

              {/* Attempted mocks */}
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Attempted Mocks</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {mockTests.filter(mock => submissions.some(s => s.mock_test_id?.toString() === (mock.id || mock._id || '').toString()))
                    .map((mock, i) => {
                      const mockId = mock.id || mock._id;
                      const accuracy = getMockAccuracy(mockId);
                      const sub = submissions.find(s => s.mock_test_id?.toString() === mockId?.toString());
                      const answeredCount = sub ? Object.keys(sub.answers || {}).filter(k => k !== '_meta').length : 0;
                      const realQs = Array.isArray(mock.questions) ? mock.questions.filter(q => q !== null) : [];
                      return (
                        <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Card variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.default, '&:hover': { borderColor: 'primary.main' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                                <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Chip label={mock.category} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.main' }} />
                                  <Chip label={`${realQs.length} Questions`} size="small" variant="outlined" />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                                  <CircularProgress variant="determinate" value={accuracy} size={50} thickness={6}
                                    sx={{ color: accuracy === 100 ? 'success.main' : 'primary.main' }} />
                                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body2" fontWeight="bold" color={textPrimary}>{accuracy}%</Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" color={textSecondary}>({answeredCount}/{realQs.length})</Typography>
                              </Box>
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                              <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mockId)}>Review</Button>
                              <Button variant="outlined" sx={{ borderRadius: 4 }}>Score: {accuracy}%</Button>
                              {accuracy >= 70 && (
                                <Button variant="contained" color="success" sx={{ borderRadius: 4 }}
                                  onClick={async () => await generateCertificatePDF({ name: userData?.name || 'Student', course: mock.title, score: accuracy, certId: `TM-${Math.random().toString(36).substr(2, 6).toUpperCase()}` })}>
                                  Get Certificate
                                </Button>
                              )}
                              <Button variant="contained" color="warning" sx={{ borderRadius: 4 }} onClick={() => handleReAttemptMock(mockId)}>Re-Attempt</Button>
                            </Stack>
                          </Card>
                        </motion.div>
                      );
                    })}
                  {!mockTests.some(mock => submissions.some(s => s.mock_test_id?.toString() === (mock.id || mock._id || '').toString())) && (
                    <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', borderRadius: 2 }}>
                      <Typography variant="h6" color={textSecondary}>No mocks attempted yet</Typography>
                      <Button variant="contained" sx={{ mt: 2, borderRadius: 4 }} onClick={() => setTabIndex(2)}>Start a Mock Test</Button>
                    </Box>
                  )}
                </Stack>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 1 — SUBMISSIONS (admin) / PURCHASED MOCK EXAMS (user)
      ══════════════════════════════════════════════════════ */}
      {tabIndex === 1 && (
        <Box>
          {isAdmin ? (
            <>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Manage Submissions</Typography>
              <TableContainer component={Paper} sx={{ mb: 4, bgcolor: theme.palette.background.default }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {['User', 'Email', 'Test', 'Category', 'Score', 'Date', 'Actions'].map(h => (
                        <TableCell key={h}><Typography fontWeight="bold" color={textPrimary}>{h}</Typography></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allSubmissions.map((sub, i) => (
                      <TableRow key={i} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ color: textPrimary }}>{sub.userName}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{sub.userEmail}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{sub.mockTestTitle}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{sub.category}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {getMockAccuracy(sub.mock_test_id)}%
                          <Typography variant="caption" color={textSecondary} sx={{ ml: 1 }}>
                            ({getCorrectCount(sub.mock_test_id)}/{getTotalQuestions(sub.mock_test_id)})
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="contained" color="error" size="small" startIcon={<Delete />}
                            sx={{ borderRadius: 2 }} onClick={() => handleDeleteSubmission(sub.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allSubmissions.length === 0 && (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ color: textSecondary }}>No submissions found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mt: 3, mb: 2, color: textPrimary }}>Your Purchased Mock Exams</Typography>
              <Stack spacing={2}>
                {purchasedTests.map((mock, i) => {
                  const mockId = mock.id || mock._id;
                  const accuracy = getMockAccuracy(mockId);
                  const isAttempted = submissions.some(s => s.mock_test_id?.toString() === mockId?.toString());
                  const questions = Array.isArray(mock.questions) ? mock.questions : [];
                  return (
                    <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Card sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.default }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                            <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip label={mock.category} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.main' }} />
                              <Chip label={`${questions.length} Questions`} size="small" variant="outlined" />
                              <Chip label={isAttempted ? 'Attempted' : 'Not Attempted'} size="small"
                                color={isAttempted ? 'success' : 'default'} variant={isAttempted ? 'filled' : 'outlined'} />
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {isAttempted
                              ? <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mockId)}>Review</Button>
                              : <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mockId}`)}>Take Test</Button>
                            }
                            {isAttempted && <Button variant="outlined" sx={{ borderRadius: 4 }}>Score: {accuracy}%</Button>}
                            {accuracy >= 70 && (
                              <Button variant="contained" color="success" sx={{ borderRadius: 4 }}
                                onClick={async () => await generateCertificatePDF({ name: userData?.name || 'Student', course: mock.title, score: accuracy, certId: `TM-${Math.random().toString(36).substr(2, 6).toUpperCase()}` })}>
                                Certificate
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </Card>
                    </motion.div>
                  );
                })}
                {purchasedTests.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', borderRadius: 2 }}>
                    <Typography variant="h6" color={textSecondary}>No purchased mock tests yet</Typography>
                    <Button variant="contained" sx={{ mt: 2, borderRadius: 4 }} onClick={() => navigate('/mocks')}>Browse Tests</Button>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2 — ASSIGN MOCK TEST (admin) / FREE TECHMOCKS (user)
      ══════════════════════════════════════════════════════ */}
      {tabIndex === 2 && (
        <Box>
          {isAdmin ? (
            <Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: textPrimary }}>Assign Mock Test to User</Typography>
              <Typography variant="body2" color={textSecondary} sx={{ mb: 4 }}>
                Select a user and a mock test. The user will receive an email with a direct link.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <UserAssignSelector
                  value={assignUserId} onChange={setAssignUserId}
                  inputValue={userSearch} onInputChange={setUserSearch}
                />
                <FormControl fullWidth>
                  <InputLabel sx={{ color: textSecondary }}>Select Mock Test</InputLabel>
                  <Select value={assignMockId} label="Select Mock Test"
                    onChange={e => { setAssignMockId(e.target.value); setAssignError(''); setAssignSuccess(''); }}
                    sx={{ bgcolor: theme.palette.background.default, color: textPrimary }}>
                    <MenuItem value=""><em>— Choose a test —</em></MenuItem>
                    {mockTests.map(test => {
                      const id = (test.id || test._id || '').toString();
                      return (
                        <MenuItem key={id} value={id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium">{test.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{test.category}</Typography>
                            </Box>
                            <Chip label={test.pricing_type === 'free' ? 'FREE' : 'PAID'} size="small"
                              color={test.pricing_type === 'free' ? 'success' : 'primary'} />
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                {assignUserId && assignMockId && (() => {
                  const u = allUsers.find(u => (u.id || u._id || '').toString() === assignUserId);
                  const m = mockTests.find(t => (t.id || t._id || '').toString() === assignMockId);
                  if (!u || !m) return null;
                  return (
                    <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <Typography variant="body2" fontWeight="bold" color="primary.main" sx={{ mb: 1 }}>Preview</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip icon={<PeopleAlt sx={{ fontSize: 14 }} />} label={u.name || u.email} size="small" variant="outlined" />
                        <Typography variant="body2" color={textSecondary}>→</Typography>
                        <Chip icon={<AssignmentInd sx={{ fontSize: 14 }} />} label={m.title} size="small" color="primary" />
                      </Box>
                      <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mt: 1 }}>
                        ✉️ Email notification will be sent to {u.email}
                      </Typography>
                    </Card>
                  );
                })()}

                {assignSuccess && <Alert severity="success" onClose={() => setAssignSuccess('')}>{assignSuccess}</Alert>}
                {assignError && <Alert severity="error" onClose={() => setAssignError('')}>{assignError}</Alert>}

                <Button variant="contained" color="primary" size="large"
                  disabled={!assignUserId || !assignMockId || assignLoading}
                  onClick={handleAssignTest}
                  startIcon={assignLoading ? <CircularProgress size={18} color="inherit" /> : <AssignmentInd />}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, alignSelf: 'flex-start' }}>
                  {assignLoading ? 'Assigning…' : 'Assign Test & Send Email'}
                </Button>
              </Box>
            </Box>
          ) : (
            /* User: Free TechMocks */
            <>
              <Typography variant="h5" sx={{ mt: 3, mb: 2, color: textPrimary }}>Free TechMocks</Typography>
              <Stack spacing={2}>
                {mockTests.filter(m => m.pricing_type === 'free').map((mock, i) => {
                  const mockId = mock.id || mock._id;
                  const accuracy = getMockAccuracy(mockId);
                  const isAttempted = submissions.some(s => s.mock_test_id?.toString() === mockId?.toString());
                  const realQs = Array.isArray(mock.questions) ? mock.questions.filter(q => q !== null) : [];
                  return (
                    <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                      <Card sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.default }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                            <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip label={mock.category} size="small" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.main' }} />
                              <Chip label={`${realQs.length} Questions`} size="small" variant="outlined" />
                              <Chip label="FREE" size="small" color="success" />
                              <Chip label={isAttempted ? 'Attempted' : 'Not Attempted'} size="small"
                                color={isAttempted ? 'primary' : 'default'} variant={isAttempted ? 'filled' : 'outlined'} />
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {isAttempted
                              ? <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mockId)}>Review</Button>
                              : <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mockId}`)}>Take Test</Button>
                            }
                            {isAttempted && <Button variant="outlined" sx={{ borderRadius: 4 }}>Score: {accuracy}%</Button>}
                            {accuracy >= 70 && (
                              <Button variant="contained" color="success" sx={{ borderRadius: 4 }}
                                onClick={async () => await generateCertificatePDF({ name: userData?.name || 'Student', course: mock.title, score: accuracy, certId: `TM-${Math.random().toString(36).substr(2, 6).toUpperCase()}` })}>
                                Certificate
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </Card>
                    </motion.div>
                  );
                })}
                {!mockTests.some(m => m.pricing_type === 'free') && (
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', borderRadius: 2 }}>
                    <Typography variant="h6" color={textSecondary}>No free mock tests available</Typography>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3 — ASSIGN INTERVIEW (admin) / MY INTERVIEWS (user)
      ══════════════════════════════════════════════════════ */}
      {tabIndex === 3 && (
        <Box>
          {isAdmin ? (
            <Box>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: textPrimary }}>Assign Interview to User</Typography>
              <Typography variant="body2" color={textSecondary} sx={{ mb: 4 }}>
                Assign a paid or free AI mock interview to a user. They'll receive an email with a direct link.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                <UserAssignSelector
                  value={assignIvUserId} onChange={setAssignIvUserId}
                  inputValue={ivUserSearch} onInputChange={setIvUserSearch}
                  label="Select User for Interview"
                />

                <FormControl fullWidth>
                  <InputLabel sx={{ color: textSecondary }}>Select Interview</InputLabel>
                  <Select value={assignIvId} label="Select Interview"
                    onChange={e => { setAssignIvId(e.target.value); setAssignIvError(''); setAssignIvSuccess(''); }}
                    sx={{ bgcolor: theme.palette.background.default, color: textPrimary }}>
                    <MenuItem value=""><em>— Choose an interview —</em></MenuItem>
                    {allInterviews.map(iv => (
                      <MenuItem key={iv.id} value={String(iv.id)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">{iv.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{iv.job_role} · {iv.duration_minutes}m</Typography>
                          </Box>
                          <Chip label={iv.pricing_type === 'paid' ? 'PAID' : 'FREE'} size="small"
                            color={iv.pricing_type === 'paid' ? 'primary' : 'success'} />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {assignIvUserId && assignIvId && (() => {
                  const u = allUsers.find(u => (u.id || u._id || '').toString() === assignIvUserId);
                  const iv = allInterviews.find(i => String(i.id) === assignIvId);
                  if (!u || !iv) return null;
                  return (
                    <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? 'rgba(124,106,247,0.1)' : 'rgba(124,106,247,0.05)', border: '1px solid rgba(124,106,247,0.25)' }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#7c6af7', mb: 1 }}>Assignment Preview</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip icon={<PeopleAlt sx={{ fontSize: 14 }} />} label={u.name || u.email} size="small" variant="outlined" />
                        <Typography variant="body2" color={textSecondary}>→</Typography>
                        <Chip icon={<RecordVoiceOver sx={{ fontSize: 14 }} />} label={iv.title} size="small" sx={{ bgcolor: '#7c6af7', color: 'white' }} />
                      </Box>
                      <Typography variant="caption" color={textSecondary} sx={{ display: 'block', mt: 1 }}>
                        ✉️ Email notification will be sent to {u.email}
                      </Typography>
                    </Card>
                  );
                })()}

                {assignIvSuccess && <Alert severity="success" onClose={() => setAssignIvSuccess('')}>{assignIvSuccess}</Alert>}
                {assignIvError && <Alert severity="error" onClose={() => setAssignIvError('')}>{assignIvError}</Alert>}

                <Button variant="contained" size="large"
                  disabled={!assignIvUserId || !assignIvId || assignIvLoading}
                  onClick={handleAssignInterview}
                  startIcon={assignIvLoading ? <CircularProgress size={18} color="inherit" /> : <RecordVoiceOver />}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, alignSelf: 'flex-start', bgcolor: '#7c6af7', '&:hover': { bgcolor: '#a78bfa' } }}>
                  {assignIvLoading ? 'Assigning…' : 'Assign Interview & Send Email'}
                </Button>
              </Box>
            </Box>
          ) : (
            /* ── User: My Interviews ────────────────────────────── */
            <>
              <Typography variant="h5" sx={{ mt: 3, mb: 1, color: textPrimary }}>My Interviews</Typography>
              <Typography variant="body2" color={textSecondary} sx={{ mb: 3 }}>
                Interviews you've purchased, been assigned, or attempted.
              </Typography>

              {/* ── Attempted interviews with scores ── */}
              {myInterviewAttempts.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: textPrimary }}>
                    Attempted
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {myInterviewAttempts.map((attempt, i) => {
                      const score = attempt.overall_score;
                      const scoreColor = score >= 75 ? '#4ade80' : score >= 50 ? '#f59e0b' : '#f87171';
                      return (
                        <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Card sx={{
                            p: 3, borderRadius: 2,
                            bgcolor: theme.palette.background.default,
                            border: '1px solid',
                            borderColor: darkMode ? 'rgba(124,106,247,0.25)' : 'rgba(124,106,247,0.15)',
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <RecordVoiceOver sx={{ color: '#7c6af7', fontSize: 20 }} />
                                  <Typography variant="h6" fontWeight="bold" color={textPrimary}>
                                    {attempt.interviews?.title || 'Interview'}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color={textSecondary} sx={{ mb: 1.5 }}>
                                  {attempt.interviews?.job_role}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={attempt.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                                    size="small"
                                    sx={{
                                      bgcolor: attempt.status === 'completed' ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.12)',
                                      color: attempt.status === 'completed' ? '#4ade80' : '#f59e0b',
                                    }}
                                  />
                                  {attempt.proctor_violations > 0 && (
                                    <Chip label={`⚠ ${attempt.proctor_violations} violation(s)`} size="small"
                                      sx={{ bgcolor: 'rgba(248,113,113,0.12)', color: '#f87171' }} />
                                  )}
                                  {attempt.completed_at && (
                                    <Chip label={new Date(attempt.completed_at).toLocaleDateString()} size="small" variant="outlined" />
                                  )}
                                </Box>

                                {/* AI feedback summary */}
                                {attempt.ai_feedback?.summary && (
                                  <Typography variant="body2" color={textSecondary} sx={{ mt: 1.5, fontStyle: 'italic' }}>
                                    "{attempt.ai_feedback.summary}"
                                  </Typography>
                                )}
                              </Box>

                              {/* Score ring */}
                              {score != null && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                    <CircularProgress
                                      variant="determinate"
                                      value={score}
                                      size={64}
                                      thickness={5}
                                      sx={{ color: scoreColor }}
                                    />
                                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Typography variant="body2" fontWeight="bold" sx={{ color: scoreColor }}>{score}</Typography>
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" color={textSecondary}>Score</Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Per-question breakdown toggle */}
                            {attempt.ai_feedback?.per_question?.length > 0 && (
                              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${borderColor}` }}>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  {attempt.ai_feedback.strengths && (
                                    <Box sx={{ flex: 1, minWidth: 160, p: 1.5, borderRadius: 1, bgcolor: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                                      <Typography variant="caption" sx={{ color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</Typography>
                                      <Typography variant="body2" color={textSecondary} sx={{ mt: 0.5 }}>{attempt.ai_feedback.strengths}</Typography>
                                    </Box>
                                  )}
                                  {attempt.ai_feedback.suggestions && (
                                    <Box sx={{ flex: 1, minWidth: 160, p: 1.5, borderRadius: 1, bgcolor: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)' }}>
                                      <Typography variant="caption" sx={{ color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suggestions</Typography>
                                      <Typography variant="body2" color={textSecondary} sx={{ mt: 0.5 }}>{attempt.ai_feedback.suggestions}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            )}
                          </Card>
                        </motion.div>
                      );
                    })}
                  </Stack>
                </>
              )}

              {/* ── Unlocked interviews (not yet attempted) ── */}
              {(() => {
                const attemptedIds = new Set(myInterviewAttempts.map(a => String(a.interview_id)));
                const unattempted = purchasedInterviews.filter(iv => !attemptedIds.has(String(iv.id)));
                if (unattempted.length === 0) return null;
                return (
                  <>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: textPrimary }}>
                      Unlocked — Not Yet Attempted
                    </Typography>
                    <Stack spacing={2}>
                      {unattempted.map((iv, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Card sx={{ p: 3, borderRadius: 2, bgcolor: theme.palette.background.default, border: '1px solid', borderColor: darkMode ? 'rgba(124,106,247,0.2)' : 'rgba(124,106,247,0.15)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <RecordVoiceOver sx={{ color: '#7c6af7', fontSize: 20 }} />
                                  <Typography variant="h6" fontWeight="bold" color={textPrimary}>{iv.title}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                  <Chip label={`💼 ${iv.job_role}`} size="small" sx={{ bgcolor: 'rgba(124,106,247,0.12)', color: '#7c6af7' }} />
                                  <Chip label={`⏱ ${iv.duration_minutes}m`} size="small" sx={{ bgcolor: 'rgba(45,212,191,0.12)', color: '#2dd4bf' }} />
                                  <Chip label={iv.source === 'assigned' ? '🎁 Assigned' : '🛒 Purchased'} size="small"
                                    sx={{ bgcolor: iv.source === 'assigned' ? 'rgba(245,158,11,0.12)' : 'rgba(74,222,128,0.12)', color: iv.source === 'assigned' ? '#f59e0b' : '#4ade80' }} />
                                </Box>
                              </Box>
                              <Button variant="contained"
                                sx={{ borderRadius: 4, bgcolor: '#7c6af7', '&:hover': { bgcolor: '#a78bfa' }, flexShrink: 0 }}
                                onClick={() => navigate('/interview')}>
                                Start Interview
                              </Button>
                            </Box>
                          </Card>
                        </motion.div>
                      ))}
                    </Stack>
                  </>
                );
              })()}

              {/* ── Empty state ── */}
              {myInterviewAttempts.length === 0 && purchasedInterviews.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(124,106,247,0.05)', borderRadius: 2 }}>
                  <RecordVoiceOver sx={{ fontSize: 56, color: '#7c6af7', mb: 2 }} />
                  <Typography variant="h6" color={textSecondary}>No interviews yet</Typography>
                  <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 3 }}>
                    Browse interviews or ask your admin to assign one.
                  </Typography>
                  <Button variant="contained" sx={{ borderRadius: 4, bgcolor: '#7c6af7', '&:hover': { bgcolor: '#a78bfa' } }}
                    onClick={() => navigate('/interview')}>
                    Browse Interviews
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}

    </Box>
  );
};

export default Hello;