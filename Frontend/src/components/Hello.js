import React, { useEffect, useState } from 'react';
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Avatar,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  useTheme,
  Badge as MuiBadge,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Autocomplete,
} from '@mui/material';
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AssignmentTurnedIn, School, Psychology, Home, PeopleAlt, Delete, Star, AssignmentInd, Search } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import generateCertificatePDF from './CertificateService';

const Hello = ({ darkMode }) => {
  const navigate = useNavigate();

  /*------------   STATES    -----------------*/
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
  const [assignUserId, setAssignUserId] = useState('');
  const [assignMockId, setAssignMockId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const token = localStorage.getItem('token');
  const theme = useTheme();

  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';
  const textSecondary = darkMode ? '#aaaaaa' : 'text.secondary';
  const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const BadgeCard = styled(Card)(({ theme, rankColor }) => ({
    p: 2,
    minWidth: '180px',
    borderRadius: 12,
    boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${rankColor}20 100%)`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05) rotate(2deg)',
      boxShadow: `0 8px 16px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  }));

  const BadgeIcon = styled(Box)(({ theme, isNew }) => ({
    fontSize: 40,
    marginBottom: theme.spacing(1),
    animation: isNew ? 'pulse 2s infinite' : 'none',
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.2)', opacity: 0.7 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
  }));

  const LatestAchievementCard = styled(Card)(({ theme }) => ({
    p: 3,
    borderRadius: 12,
    boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
      opacity: 0.5,
    },
  }));

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const isAdminUser = decodedToken.role === 'admin';
      setIsAdmin(isAdminUser);

      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // ─── CRITICAL FIX ───────────────────────────────────────────────────
          // /api/admin/mock-tests requires verifyAdmin → 403 for regular users.
          // /api/admin/get-all-mocks is public but returns a GROUPED OBJECT:
          //   { "SAP": [{id, title, ...}], "Procurement": [...] }
          // NOT an array — so Array.isArray() returns false and mockTests stays
          // empty, causing "Attempted Mocks" to always appear blank.
          //
          // Fix:
          //  • Admins  → /api/admin/mock-tests      (flat array, needs auth)
          //  • Users   → /api/admin/get-all-mocks   (grouped object, public)
          //              then flatten it into a plain array
          // ────────────────────────────────────────────────────────────────────
          const mockTestsUrl = isAdminUser
            ? `${backendUrl}/api/admin/mock-tests`
            : `${backendUrl}/api/admin/get-all-mocks`;

          const [userResponse, mockResponse, badgesResponse, rankResponse] = await Promise.all([
            axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: token } }),
            isAdminUser
              ? axios.get(mockTestsUrl, { headers: { Authorization: token } })
              : axios.get(mockTestsUrl),                   // public — no auth header
            axios.get(`${backendUrl}/api/user/badges`, { headers: { Authorization: token } }),
            axios.get(`${backendUrl}/api/user/rank`,   { headers: { Authorization: token } }),
          ]);

          setUserData(userResponse.data);

          // Normalise purchasedTests: profile API uses camelCase but the
          // rest of the component expects snake_case field names
          const rawPurchased = Array.isArray(userResponse.data.purchasedTests)
            ? userResponse.data.purchasedTests : [];
          const normalizedPurchased = rawPurchased.map(test => ({
            ...test,
            id: test.id || test._id,
            pricing_type: test.pricing_type || test.pricingType || 'free',
            time_limit: test.time_limit || test.timeLimit || 10,
            questions: Array.isArray(test.questions) ? test.questions : [],
          }));
          setPurchasedTests(normalizedPurchased);

          // ── Parse mock tests based on role ──────────────────────────────
          if (isAdminUser) {
            // Admin endpoint returns a flat array directly
            setMockTests(Array.isArray(mockResponse.data) ? mockResponse.data : []);
          } else {
            // User endpoint returns { "Category A": [...], "Category B": [...] }
            // Flatten into one array and normalise field names
            const grouped = mockResponse.data;
            const flatTests =
              grouped && typeof grouped === 'object' && !Array.isArray(grouped)
                ? Object.values(grouped)
                    .flat()
                    .map(test => ({
                      ...test,
                      // get-all-mocks sends pricingType (camelCase) — normalise
                      pricing_type: test.pricing_type || test.pricingType || 'free',
                      // questions is just a count here; real data fetched below
                      questions: Array.isArray(test.questions) ? test.questions : [],
                    }))
                : [];
            setMockTests(flatTests);
          }
          // ────────────────────────────────────────────────────────────────

          setBadges(Array.isArray(badgesResponse.data) ? badgesResponse.data : []);
          setUserRank(rankResponse.data);

          if (isAdminUser) {
            const [purchasedTestsResponse, submissionsResponse, usersResponse] = await Promise.all([
              axios.get(`${backendUrl}/api/admin/purchased-tests`, { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/admin/submissions`,     { headers: { Authorization: token } }),
              axios.get(`${backendUrl}/api/admin/users`,           { headers: { Authorization: token } }),
            ]);
            setAllPurchasedTests(Array.isArray(purchasedTestsResponse.data) ? purchasedTestsResponse.data : []);
            setAllSubmissions(Array.isArray(submissionsResponse.data) ? submissionsResponse.data : []);
            setAllUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
          } else {
            const submissionResponse = await axios.get(`${backendUrl}/api/submissions`, {
              headers: { Authorization: token },
            });
            setSubmissions(Array.isArray(submissionResponse.data) ? submissionResponse.data : []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } catch (error) {
      console.error('Invalid or expired token:', error);
      setError('Invalid or expired token. Please log in again.');
      navigate('/login');
      setLoading(false);
    }
  }, [token, navigate]);

  // ── Fetch full question arrays for accuracy calculations ─────────────────
  // /api/admin/get-all-mocks returns only a numeric question count, not the
  // actual question objects needed to compute scores. Once both submissions
  // and mockTests are loaded, fetch the full test data for every submitted
  // test that is missing real question objects.
  useEffect(() => {
    if (isAdmin || submissions.length === 0 || mockTests.length === 0) return;

    const submittedIds = [...new Set(submissions.map(s => s.mock_test_id.toString()))];
    const missingIds = submittedIds.filter(id => {
      const test = mockTests.find(t => (t.id || t._id || '').toString() === id);
      if (!test) return true;
      const qs = test.questions;
      return !Array.isArray(qs) || qs.length === 0 || qs[0] === null;
    });

    if (missingIds.length === 0) return;

    const fetchFullDetails = async () => {
      const results = {};
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const res = await axios.get(`${backendUrl}/api/mock-test/${id}`);
            if (res.data && Array.isArray(res.data.questions)) {
              results[id] = res.data.questions;
            }
          } catch (err) {
            console.warn('Could not fetch full details for test:', id);
          }
        })
      );
      if (Object.keys(results).length > 0) {
        setMockTests(prev =>
          prev.map(test => {
            const id = (test.id || test._id || '').toString();
            return results[id] ? { ...test, questions: results[id] } : test;
          })
        );
      }
    };

    fetchFullDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length, mockTests.length, isAdmin]);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleReviewMock = (mockId) => {
    navigate(`/mock-test/${mockId}/review`);
  };

  const handleReAttemptMock = async (mockId) => {
    try {
      await axios.post(
        `${backendUrl}/api/mock-test/${mockId}/submit`,
        { answers: {} },
        { headers: { Authorization: token } }
      );
      navigate(`/mock-test/${mockId}`);
    } catch (error) {
      setError('Failed to start re-attempt. Please try again.');
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    try {
      await axios.delete(`${backendUrl}/api/admin/submissions/${submissionId}`, {
        headers: { Authorization: token },
      });
      setAllSubmissions(allSubmissions.filter((sub) => sub.id !== submissionId));
      alert('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError('Failed to delete submission. Please try again.');
    }
  };

  const handleViewUsers = () => {
    navigate('/admin/users');
  };

  const handleAssignTest = async () => {
    if (!assignUserId || !assignMockId) {
      setAssignError('Please select both a user and a mock test.');
      return;
    }
    setAssignLoading(true);
    setAssignError('');
    setAssignSuccess('');
    try {
      await axios.post(
        `${backendUrl}/api/admin/assign-mock-test`,
        { userId: assignUserId, mockTestId: assignMockId },
        { headers: { Authorization: token } }
      );
      setAssignSuccess('Mock test assigned successfully! The user will receive an email notification.');
      setAssignUserId('');
      setAssignMockId('');
      setUserSearch('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign mock test. Please try again.';
      setAssignError(msg);
    } finally {
      setAssignLoading(false);
    }
  };


  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master':       return '#FFD700';
      case 'Expert':       return '#C0C0C0';
      case 'Advanced':     return '#CD7F32';
      case 'Intermediate': return '#4CAF50';
      default:             return '#2196F3';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMockTestStats = () => {
    const totalTests = mockTests?.length || 0;
    const totalQuestions = mockTests?.reduce((sum, test) => {
      if (!test || !Array.isArray(test.questions)) return sum;
      return sum + test.questions.length;
    }, 0) || 0;
    const categoryCounts = mockTests?.reduce((counts, test) => {
      const category = test?.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {}) || {};
    return { totalTests, totalQuestions, categoryCounts };
  };

  const getCategoryStats = () => {
    const categoryStats = {};
    submissions.forEach((submission) => {
      const mockTest = [...mockTests, ...purchasedTests].find((test) => {
        const testId = (test.id || test._id || '').toString();
        return testId === submission.mock_test_id.toString();
      });
      if (mockTest) {
        const category = mockTest.category;
        const questions = Array.isArray(mockTest.questions)
          ? mockTest.questions.filter(q => q !== null) : [];
        if (!categoryStats[category]) {
          categoryStats[category] = { correct: 0, answered: 0, total: questions.length };
        }
        const userAnswers = submission.answers || {};
        questions.forEach((question, index) => {
          const userAnswer = userAnswers[index.toString()];
          if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
            categoryStats[category].answered += 1;
            if (userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()) {
              categoryStats[category].correct += 1;
            }
          }
        });
      }
    });
    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      totalQuestionsAnswered: stats.answered,
      totalQuestions: stats.total,
    }));
  };

  const getMockAccuracy = (mockId) => {
    const submission =
      allSubmissions.find((sub) => sub.mock_test_id.toString() === mockId.toString()) ||
      submissions.find((sub) => sub.mock_test_id.toString() === mockId.toString());
    if (!submission) return 0;

    const mockTest = [...mockTests, ...purchasedTests].find((test) => {
      const testId = (test.id || test._id || '').toString();
      return testId === submission.mock_test_id.toString();
    });
    if (!mockTest) return 0;

    const questions = Array.isArray(mockTest.questions)
      ? mockTest.questions.filter(q => q !== null) : [];
    if (questions.length === 0) return 0;

    const userAnswers = submission.answers || {};
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index.toString()];
      if (userAnswer != null && userAnswer !== '') {
        if (userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()) {
          correct += 1;
        }
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const getCorrectCount = (mockId) => {
    const submission =
      allSubmissions.find((sub) => sub.mock_test_id.toString() === mockId.toString()) ||
      submissions.find((sub) => sub.mock_test_id.toString() === mockId.toString());
    if (!submission) return 0;

    const mockTest = [...mockTests, ...purchasedTests].find((test) => {
      const testId = (test.id || test._id || '').toString();
      return testId === submission.mock_test_id.toString();
    });
    if (!mockTest) return 0;

    const questions = Array.isArray(mockTest.questions)
      ? mockTest.questions.filter(q => q !== null) : [];
    const userAnswers = submission.answers || {};
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index.toString()];
      if (userAnswer != null && userAnswer !== '') {
        if (userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase()) {
          correct += 1;
        }
      }
    });
    return correct;
  };

  const getTotalQuestions = (mockId) => {
    const mockTest = [...mockTests, ...purchasedTests].find((test) => {
      const testId = (test.id || test._id || '').toString();
      return testId === mockId.toString();
    });
    if (!mockTest) return 0;
    return Array.isArray(mockTest.questions)
      ? mockTest.questions.filter(q => q !== null).length : 0;
  };

  const categoryStats = !isAdmin ? getCategoryStats() : [];
  const mockTestStats = isAdmin ? getMockTestStats() : null;

  const totalAnswered  = !isAdmin ? categoryStats.reduce((s, st) => s + st.totalQuestionsAnswered, 0) : 0;
  const totalQuestions = !isAdmin ? categoryStats.reduce((s, st) => s + st.totalQuestions, 0) : 0;
  const overallProgress = !isAdmin ? (totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0) : 0;
  const overallAccuracy = !isAdmin
    ? totalAnswered > 0
      ? categoryStats.reduce((s, st) => s + st.accuracy * st.totalQuestionsAnswered, 0) / totalAnswered
      : 0
    : 0;

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
        <Typography variant='h6' color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, bgcolor: theme.palette.background.default, color: textPrimary, borderRadius: 2, boxShadow: darkMode ? '0 0 10px rgba(0,0,0,0.2)' : '0 0 10px rgba(0,0,0,0.05)', minHeight: '90vh' }}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MuiBadge badgeContent={<Star sx={{ color: getRankColor(userRank.rank) }} />}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }} src={userData?.profilePicture}>
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
            </MuiBadge>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 'bold', color: textPrimary }}>
                {getGreeting()}, {userData?.name || 'User'}!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body1' color={textSecondary}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>
                <Chip label={`${userRank.rank} (Points: ${userRank.points})`} sx={{ bgcolor: getRankColor(userRank.rank), color: 'white', fontWeight: 'bold' }} />
                {isAdmin && <Chip label='ADMIN' color='primary' size='small' sx={{ ml: 1, fontWeight: 'bold' }} />}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold', color: textPrimary, mb: 2 }}>Your Badges</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <Card key={index} sx={{ p: 2, minWidth: '150px', borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h6'>{badge.icon}</Typography>
                    <Typography variant='body1' fontWeight='bold' color={textPrimary}>{badge.name}</Typography>
                  </Box>
                  <Typography variant='body2' color={textSecondary}>{badge.description}</Typography>
                  <Typography variant='caption' color={textSecondary}>Earned: {new Date(badge.earned_at).toLocaleDateString()}</Typography>
                </Card>
              ))
            ) : (
              <Typography variant='body1' color={textSecondary}>No badges earned yet. Complete more tests to earn badges!</Typography>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* ─── TABS ─── */}
      <Box sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, mb: 3, boxShadow: `0 2px 4px ${borderColor}` }}>
        {isAdmin ? (
          <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth" scrollButtons='auto' textColor='primary' indicatorColor='primary' aria-label='admin dashboard tabs' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<Home />} label='DASHBOARD' iconPosition='start' />
            <Tab icon={<AssignmentTurnedIn />} label='MANAGE SUBMISSIONS' iconPosition='start' />
            <Tab icon={<AssignmentInd />} label='ASSIGN TEST' iconPosition='start' />
          </Tabs>
        ) : (
          <Tabs value={tabIndex} onChange={handleTabChange} variant='fullWidth' textColor='primary' indicatorColor='primary' aria-label='user dashboard tabs' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<Home />} label='DASHBOARD' iconPosition='start' />
            <Tab icon={<School />} label='MOCK EXAMS' iconPosition='start' />
            <Tab icon={<Psychology />} label='FREE TECHMOCKS' iconPosition='start' />
          </Tabs>
        )}
      </Box>

      {/* ─── TAB 0: DASHBOARD ─── */}
      {tabIndex === 0 && (
        <motion.div variants={containerVariants} initial='hidden' animate='visible'>
          {isAdmin ? (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant='h6' fontWeight='bold'>Mock Tests</Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>{mockTestStats.totalTests}</Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>Total questions: {mockTestStats.totalQuestions}</Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <Typography variant='h6' fontWeight='bold'>Registered Users</Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>{userStats.length || 0}</Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Active users: {userStats.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                    </Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', color: 'white' }}>
                    <Typography variant='h6' fontWeight='bold'>Test Attempts</Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>{userStats.reduce((s, u) => s + (u.testsTaken || 0), 0)}</Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Avg per user: {userStats.length ? (userStats.reduce((s, u) => s + (u.testsTaken || 0), 0) / userStats.length).toFixed(1) : 0}
                    </Typography>
                  </Card>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>All Purchased Tests</Typography>
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>User Name</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>User Email</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>Test Title</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>Category</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>Pricing Type</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>Price</Typography></TableCell>
                        <TableCell><Typography fontWeight='bold' color={textPrimary}>Purchase Date</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPurchasedTests.map((purchase, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                          <TableCell sx={{ color: textPrimary }}>{purchase.userName}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.userEmail}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.mockTestTitle}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.category}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>
                            <Chip label={purchase.pricingType.toUpperCase()} size='small' color={purchase.pricingType === 'free' ? 'success' : 'primary'} variant='filled' />
                          </TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.priceDisplay || 'N/A'}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {allPurchasedTests.length === 0 && (
                        <TableRow><TableCell colSpan={7} align='center' sx={{ color: textSecondary }}>No purchased tests found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Mock Tests by Category</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(mockTestStats.categoryCounts).map(([category, count], index) => (
                    <Card key={index} sx={{ p: 3, minWidth: '200px', borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                      <Typography variant='h6' color={textPrimary}>{category}</Typography>
                      <Typography variant='h4' sx={{ my: 2 }} color={textPrimary}>{count}</Typography>
                      <Typography variant='body2' color={textSecondary}>{Math.round((count / mockTestStats.totalTests) * 100)}% of total</Typography>
                    </Card>
                  ))}
                  {Object.keys(mockTestStats.categoryCounts).length === 0 && (
                    <Typography variant='body1' color={textSecondary}>No mock tests created yet</Typography>
                  )}
                </Box>
              </motion.div>
            </>
          ) : (
            /* ─── USER DASHBOARD ─── */
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant='h6' fontWeight='bold'>Overall Progress</Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress variant='determinate' value={overallProgress} size={80} thickness={6} sx={{ color: 'white' }} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant='body1' fontWeight='bold'>{Math.round(overallProgress)}%</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant='body2' sx={{ opacity: 0.9 }}>Questions answered: {totalAnswered} / {totalQuestions}</Typography>
                        <Typography variant='body2' sx={{ opacity: 0.9, mt: 1 }}>Average accuracy: {Math.round(overallAccuracy)}%</Typography>
                        <Typography variant='body2' sx={{ opacity: 0.9, mt: 1 }}>Rank: {userRank.rank} ({userRank.points} points)</Typography>
                        {totalAnswered === 0 && (
                          <Typography variant='body2' sx={{ opacity: 0.7, mt: 1, color: 'white' }}>No progress yet. Start a mock test!</Typography>
                        )}
                      </Box>
                    </Box>
                  </Card>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', bgcolor: theme.palette.background.default }}>
                    <Typography variant='h6' fontWeight='bold' color={textPrimary}>Latest Achievement</Typography>
                    {badges.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant='h6'>{badges[0].icon}</Typography>
                          <Typography variant='body1' fontWeight='medium' color={textPrimary}>{badges[0].name}</Typography>
                        </Box>
                        <Typography variant='body2' color={textSecondary}>{badges[0].description}</Typography>
                        <Typography variant='caption' color={textSecondary}>Earned: {new Date(badges[0].earned_at).toLocaleDateString()}</Typography>
                      </Box>
                    ) : (
                      <Typography variant='body1' sx={{ mt: 2, color: textSecondary }}>No badges earned yet. Start a mock test to earn your first!</Typography>
                    )}
                    {submissions.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant='body1' fontWeight='medium' color={textPrimary}>
                          {[...mockTests, ...purchasedTests].find((test) => {
                            const testId = (test.id || test._id || '').toString();
                            return testId === submissions[submissions.length - 1]?.mock_test_id?.toString();
                          })?.title || 'Mock Test'}
                        </Typography>
                        <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>
                          Completed on {new Date(submissions[submissions.length - 1]?.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip icon={<AssignmentTurnedIn />} label='Completed' color='success' size='small' sx={{ mt: 2 }} />
                      </Box>
                    ) : (
                      <Typography variant='body1' sx={{ mt: 2, color: textSecondary }}>No achievements yet. Start a mock test to earn your first!</Typography>
                    )}
                  </Card>
                </Box>
              </motion.div>

              {/* ─── ATTEMPTED MOCKS ─── */}
              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Attempted Mocks</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {mockTests
                    .filter((mock) =>
                      submissions.some((sub) =>
                        sub.mock_test_id.toString() === (mock.id || mock._id || '').toString()
                      )
                    )
                    .map((mock, i) => {
                      const mockId = mock.id || mock._id;
                      const accuracy = getMockAccuracy(mockId);
                      const submission = submissions.find((sub) => sub.mock_test_id.toString() === mockId.toString());
                      const answeredCount = submission
                        ? Object.keys(submission.answers || {}).filter(k => k !== '_meta').length : 0;
                      const realQuestions = Array.isArray(mock.questions)
                        ? mock.questions.filter(q => q !== null) : [];

                      return (
                        <motion.div key={i} whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                          <Card variant='outlined' sx={{ p: 3, borderRadius: 2, borderColor: 'transparent', boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default, '&:hover': { borderColor: 'primary.main' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant='h6' fontWeight='bold' color={textPrimary}>{mock.title}</Typography>
                                <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Chip label={mock.category} size='small' sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }} />
                                  <Chip label={`${realQuestions.length} Questions`} size='small' variant='outlined' />
                                  <Chip label={mock.pricing_type === 'free' ? 'FREE' : 'PAID'} size='small' color={mock.pricing_type === 'free' ? 'success' : 'primary'} variant='filled' />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                                  <CircularProgress variant='determinate' value={accuracy} size={50} thickness={6} sx={{ color: accuracy === 100 ? 'success.main' : 'primary.main' }} />
                                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant='body2' fontWeight='bold' color={textPrimary}>{accuracy}%</Typography>
                                  </Box>
                                </Box>
                                <Typography variant='body2' color={textSecondary}>({answeredCount} / {realQuestions.length} answered)</Typography>
                              </Box>
                            </Box>
                            <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
                              <Button variant='contained' sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: 4, px: 3 }} onClick={() => handleReviewMock(mockId)}>
                                Review Mock
                              </Button>
                              <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }}>Score: ({accuracy}%)</Button>
                              {accuracy >= 70 && (
                                <Button variant='contained' color='success' sx={{ borderRadius: 4, px: 3 }}
                                  onClick={async () => {
                                    await generateCertificatePDF({
                                      name: userData?.name || 'Student Name',
                                      course: mock.title,
                                      score: accuracy,
                                      certId: `TM-${accuracy >= 95 ? 'D' : accuracy >= 80 ? 'G' : 'S'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                                    });
                                  }}>
                                  Get Certificate
                                </Button>
                              )}
                              <Button variant='contained' color='warning' sx={{ borderRadius: 4, px: 3 }} onClick={() => handleReAttemptMock(mockId)}>
                                Re-Attempt
                              </Button>
                            </Stack>
                          </Card>
                        </motion.div>
                      );
                    })}
                  {!mockTests.some((mock) =>
                    submissions.some((sub) =>
                      sub.mock_test_id.toString() === (mock.id || mock._id || '').toString()
                    )
                  ) && (
                    <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', borderRadius: 2 }}>
                      <Typography variant='h6' color={textSecondary}>You haven't attempted any mocks yet</Typography>
                      <Button variant='contained' color='primary' sx={{ mt: 2, borderRadius: 4, px: 3 }} onClick={() => setTabIndex(2)}>
                        Start a Mock Test
                      </Button>
                    </Box>
                  )}
                </Stack>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* ─── TAB 1: MANAGE SUBMISSIONS (admin) / MOCK EXAMS (user) ─── */}
      {tabIndex === 1 && (
        <Box>
          {isAdmin ? (
            <>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Manage Submissions</Typography>
              <TableContainer component={Paper} sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>User Name</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>User Email</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>Test Title</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>Category</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>Score</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>Submission Date</Typography></TableCell>
                      <TableCell><Typography fontWeight='bold' color={textPrimary}>Actions</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allSubmissions.map((submission, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ color: textPrimary }}>{submission.userName}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.userEmail}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.mockTestTitle}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.category}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>{getMockAccuracy(submission.mock_test_id)}%</Typography>
                            <Typography variant='caption' color={textSecondary} sx={{ ml: 1 }}>
                              ({getCorrectCount(submission.mock_test_id)}/{getTotalQuestions(submission.mock_test_id)} correct)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant='contained' color='error' size='small' startIcon={<Delete />} sx={{ borderRadius: 2 }} onClick={() => handleDeleteSubmission(submission.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allSubmissions.length === 0 && (
                      <TableRow><TableCell colSpan={7} align='center' sx={{ color: textSecondary }}>No submissions found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            /* ─── USER: PURCHASED MOCK EXAMS ─── */
            <>
              <Typography variant='h5' sx={{ mt: 3, mb: 2, color: textPrimary }}>Your Purchased Mock Exams</Typography>
              <Stack spacing={2}>
                {purchasedTests.map((mock, index) => {
                  const mockId = mock.id || mock._id;
                  const accuracy = getMockAccuracy(mockId);
                  const submission = submissions.find((sub) => sub.mock_test_id.toString() === mockId.toString());
                  const answeredCount = submission ? Object.keys(submission.answers || {}).filter(k => k !== '_meta').length : 0;
                  const questions = Array.isArray(mock.questions) ? mock.questions : [];
                  const isAttempted = submissions.some((sub) => sub.mock_test_id.toString() === mockId.toString());

                  return (
                    <motion.div key={index} whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                      <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant='h6' fontWeight='bold' color={textPrimary}>{mock.title}</Typography>
                            <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip label={mock.category} size='small' sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.main' }} />
                              <Chip label={`${questions.length} Questions`} size='small' variant='outlined' />
                              <Chip label={isAttempted ? 'Attempted' : 'Not Attempted'} size='small' color={isAttempted ? 'success' : 'default'} variant={isAttempted ? 'filled' : 'outlined'} />
                            </Box>
                          </Box>
                          <Stack direction='row' spacing={1}>
                            {isAttempted ? (
                              <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mockId)}>Review Test</Button>
                            ) : (
                              <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mockId}`)}>Take Test</Button>
                            )}
                            {isAttempted && <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }}>Your Score: ({accuracy}%)</Button>}
                            {accuracy >= 70 && (
                              <Button variant='contained' color='success' sx={{ borderRadius: 4, px: 3 }}
                                onClick={async () => {
                                  await generateCertificatePDF({
                                    name: userData?.name || 'Student Name',
                                    course: mock.title,
                                    score: accuracy,
                                    certId: `TM-${accuracy >= 95 ? 'D' : accuracy >= 80 ? 'G' : 'S'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                                  });
                                }}>
                                Get Certificate
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
                    <Typography variant='h6' color={textSecondary}>No purchased mock tests available</Typography>
                    <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>You haven't purchased any mock tests yet. Visit the store to buy some!</Typography>
                    <Button variant='contained' color='primary' sx={{ mt: 2, borderRadius: 4, px: 3 }} onClick={() => navigate('/store')}>Go to Store</Button>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}

      {/* ─── TAB 2: USERS (admin) / FREE TECHMOCKS (user) ─── */}
      {tabIndex === 2 && (
        <Box>
          {isAdmin ? (
            <Box>
          <Typography variant='h5' sx={{ mb: 1, fontWeight: 'bold', color: textPrimary }}>
            Assign Mock Test to User
          </Typography>
          <Typography variant='body2' color={textSecondary} sx={{ mb: 4 }}>
            Select a user and a mock test below. The user will receive an email notification with a direct link to the test.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>

            {/* ── User selector ── */}
            <Autocomplete
              options={allUsers}
              getOptionLabel={(u) => u.name ? `${u.name} (${u.email})` : (u.email || '')}
              value={allUsers.find(u => (u.id || u._id || '').toString() === assignUserId) || null}
              onChange={(_, newValue) => {
                setAssignUserId(newValue ? (newValue.id || newValue._id || '').toString() : '');
                setAssignError('');
                setAssignSuccess('');
              }}
              inputValue={userSearch}
              onInputChange={(_, val) => setUserSearch(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Select User'
                  placeholder='Search by name or email…'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: theme.palette.background.default,
                      color: textPrimary,
                    },
                    '& .MuiInputLabel-root': { color: textSecondary },
                  }}
                />
              )}
              renderOption={(props, u) => (
                <Box component='li' {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                    {(u.name || u.email || '?').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant='body2' fontWeight='medium'>{u.name || '—'}</Typography>
                    <Typography variant='caption' color='text.secondary'>{u.email}</Typography>
                  </Box>
                </Box>
              )}
              noOptionsText='No users found'
              fullWidth
            />

            {/* ── Mock test selector ── */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: textSecondary }}>Select Mock Test</InputLabel>
              <Select
                value={assignMockId}
                label='Select Mock Test'
                onChange={(e) => {
                  setAssignMockId(e.target.value);
                  setAssignError('');
                  setAssignSuccess('');
                }}
                sx={{
                  bgcolor: theme.palette.background.default,
                  color: textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: borderColor },
                }}
              >
                <MenuItem value=''><em>— Choose a test —</em></MenuItem>
                {mockTests.map((test) => {
                  const id = (test.id || test._id || '').toString();
                  return (
                    <MenuItem key={id} value={id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' fontWeight='medium'>{test.title}</Typography>
                          <Typography variant='caption' color='text.secondary'>{test.category}</Typography>
                        </Box>
                        <Chip
                          label={test.pricing_type === 'free' ? 'FREE' : 'PAID'}
                          size='small'
                          color={test.pricing_type === 'free' ? 'success' : 'primary'}
                          variant='filled'
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* ── Preview of selection ── */}
            {assignUserId && assignMockId && (() => {
              const selectedUser = allUsers.find(u => (u.id || u._id || '').toString() === assignUserId);
              const selectedMock = mockTests.find(t => (t.id || t._id || '').toString() === assignMockId);
              if (!selectedUser || !selectedMock) return null;
              return (
                <Card sx={{ p: 2.5, borderRadius: 2, bgcolor: darkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', border: `1px solid ${darkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'}` }}>
                  <Typography variant='body2' fontWeight='bold' color='primary.main' sx={{ mb: 1 }}>Assignment Preview</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip icon={<PeopleAlt sx={{ fontSize: 14 }} />} label={selectedUser.name || selectedUser.email} size='small' variant='outlined' />
                    <Typography variant='body2' color={textSecondary} sx={{ alignSelf: 'center' }}>will be assigned</Typography>
                    <Chip icon={<AssignmentInd sx={{ fontSize: 14 }} />} label={selectedMock.title} size='small' color='primary' variant='filled' />
                  </Box>
                  <Typography variant='caption' color={textSecondary} sx={{ display: 'block', mt: 1 }}>
                    ✉️ An email notification will be sent to {selectedUser.email}
                  </Typography>
                </Card>
              );
            })()}

            {/* ── Feedback messages ── */}
            {assignSuccess && (
              <Alert severity='success' onClose={() => setAssignSuccess('')}>{assignSuccess}</Alert>
            )}
            {assignError && (
              <Alert severity='error' onClose={() => setAssignError('')}>{assignError}</Alert>
            )}

            {/* ── Submit button ── */}
            <Button
              variant='contained'
              color='primary'
              size='large'
              disabled={!assignUserId || !assignMockId || assignLoading}
              onClick={handleAssignTest}
              startIcon={assignLoading ? <CircularProgress size={18} color='inherit' /> : <AssignmentInd />}
              sx={{ borderRadius: 3, px: 4, py: 1.5, alignSelf: 'flex-start' }}
            >
              {assignLoading ? 'Assigning…' : 'Assign Test & Send Email'}
            </Button>
          </Box>
        </Box>
          ) : (
            /* ─── USER: FREE TECHMOCKS ─── */
            <>
              <Typography variant='h5' sx={{ mt: 3, mb: 2, color: textPrimary }}>Free TechMocks</Typography>
              <Stack spacing={2}>
                {(() => {
                  const freeMockTests = mockTests.filter((mock) => mock.pricing_type === 'free');
                  return freeMockTests.map((mock, index) => {
                    const mockId = mock.id || mock._id;
                    const accuracy = getMockAccuracy(mockId);
                    const isAttempted = submissions.some((sub) => sub.mock_test_id.toString() === mockId.toString());
                    const realQuestions = Array.isArray(mock.questions)
                      ? mock.questions.filter(q => q !== null) : [];

                    return (
                      <motion.div key={index} whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant='h6' fontWeight='bold' color={textPrimary}>{mock.title}</Typography>
                              <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip label={mock.category} size='small' sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: 'primary.main' }} />
                                <Chip label={`${realQuestions.length} Questions`} size='small' variant='outlined' />
                                <Chip label='FREE' size='small' color='success' variant='filled' />
                                <Chip label={isAttempted ? 'Attempted' : 'Not Attempted'} size='small' color={isAttempted ? 'primary' : 'default'} variant={isAttempted ? 'filled' : 'outlined'} />
                              </Box>
                            </Box>
                            <Stack direction='row' spacing={1}>
                              {isAttempted ? (
                                <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mockId)}>Review Test</Button>
                              ) : (
                                <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mockId}`)}>Take Test</Button>
                              )}
                              {isAttempted && <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }}>Your Score: ({accuracy}%)</Button>}
                              {accuracy >= 70 && (
                                <Button variant='contained' color='success' sx={{ borderRadius: 4, px: 3 }}
                                  onClick={async () => {
                                    await generateCertificatePDF({
                                      name: userData?.name || 'Student Name',
                                      course: mock.title,
                                      score: accuracy,
                                      certId: `TM-${accuracy >= 95 ? 'D' : accuracy >= 80 ? 'G' : 'S'}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
                                    });
                                  }}>
                                  Get Certificate
                                </Button>
                              )}
                            </Stack>
                          </Box>
                        </Card>
                      </motion.div>
                    );
                  });
                })()}
                {!mockTests.some((mock) => mock.pricing_type === 'free') && (
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)', borderRadius: 2 }}>
                    <Typography variant='h6' color={textSecondary}>No free mock tests available</Typography>
                    <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>Please check back later for new free mock tests</Typography>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Hello;