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
  Select,
  MenuItem,
  Tooltip,
  Paper,
  useTheme,
  Badge as MuiBadge
} from '@mui/material';
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AssignmentTurnedIn, School, Psychology, Home, PeopleAlt, Delete, Star } from '@mui/icons-material';
import { generateCertificate } from './CertificateService';

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

  const [selectedMockForUser, setSelectedMockForUser] = useState({});

  const token = localStorage.getItem('token');
  const theme = useTheme();

  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';
  const textSecondary = darkMode ? '#aaaaaa' : 'text.secondary';
  const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Styled components for badges
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

  const handleAssignTest = (userId, mockId) => {
    setSelectedMockForUser((prev) => ({
      ...prev,
      [userId]: mockId,
    }));
  };

  // 3. Handler when user clicks "Assign" button
  const confirmAssign = async (userId) => {
    const mockId = selectedMockForUser[userId];
    if (!mockId) return;

    try {
      // 1. Ensure you use backendUrl
      // 2. DO NOT use "Bearer " if your backend verifyAdmin doesn't strip it
      const response = await fetch(`${backendUrl}/api/admin/assign-mock-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token') || '',
        },
        body: JSON.stringify({
          userId,
          mockTestId: mockId,
        }),
      });

      const clonedResponse = response.clone();
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await clonedResponse.text();
        console.error('Response was not JSON:', text);
        throw new Error('Server returned invalid response (Not Found or Server Error)');
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      alert('Mock test assigned successfully!');
      // Optional: refresh data here
      window.location.reload();

    } catch (err) {
      console.error('Assign error:', err);
      alert(err.message || 'Something went wrong while assigning the test');
    }
  };

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
      const isAdmin = decodedToken.role === 'admin';
      setIsAdmin(isAdmin);

      const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
          // ────────────────────────────────────────────────
          // Base requests everyone needs
          const baseRequests = [
            axios.get(`${backendUrl}/api/user/profile`, {
              headers: { Authorization: token },
            }),
            axios.get(`${backendUrl}/api/admin/mock-tests`, {
              headers: { Authorization: token },
            }),
            axios.get(`${backendUrl}/api/user/badges`, {
              headers: { Authorization: token },
            }),
            axios.get(`${backendUrl}/api/user/rank`, {
              headers: { Authorization: token },
            })
          ];

          // Add admin-only requests conditionally
          if (isAdmin) {
            baseRequests.push(
              axios.get(`${backendUrl}/api/admin/users`, {
                headers: { Authorization: token },
              })
            );
          }

          // Execute all requests in parallel
          const responses = await Promise.all(baseRequests);

          // Destructure safely
          const [
            userResponse,
            mockResponse,
            badgesResponse,
            rankResponse,
            usersResponse   // ← only exists if admin
          ] = responses;

          // Common state updates
          setUserData(userResponse.data);
          setPurchasedTests(
            Array.isArray(userResponse.data.purchasedTests)
              ? userResponse.data.purchasedTests
              : []
          );
          setMockTests(Array.isArray(mockResponse.data) ? mockResponse.data : []);
          setBadges(Array.isArray(badgesResponse.data) ? badgesResponse.data : []);
          setUserRank(rankResponse.data);

          // Admin-only data
          if (isAdmin) {
            // Already-fetched admin users list
            setUserStats(
              Array.isArray(usersResponse?.data) ? usersResponse.data : []
            );

            // Your existing extra admin fetches
            const [purchasedTestsResponse, submissionsResponse] = await Promise.all([
              axios.get(`${backendUrl}/api/admin/purchased-tests`, {
                headers: { Authorization: token },
              }),
              axios.get(`${backendUrl}/api/admin/submissions`, {
                headers: { Authorization: token },
              })
            ]);

            setAllPurchasedTests(
              Array.isArray(purchasedTestsResponse.data)
                ? purchasedTestsResponse.data
                : []
            );
            setAllSubmissions(
              Array.isArray(submissionsResponse.data)
                ? submissionsResponse.data
                : []
            );
          }

          // Non-admin submissions
          if (!isAdmin) {
            const submissionResponse = await axios.get(`${backendUrl}/api/submissions`, {
              headers: { Authorization: token },
            });
            setSubmissions(submissionResponse.data || []);
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
  }, [token, navigate, backendUrl]);   // ← added backendUrl if it's not stable

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

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Master': return '#FFD700';
      case 'Expert': return '#C0C0C0';
      case 'Advanced': return '#CD7F32';
      case 'Intermediate': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMockTestStats = () => {
    const totalTests = mockTests.length;
    const totalQuestions = mockTests.reduce((sum, test) => sum + test.questions.length, 0);
    const categoryCounts = mockTests.reduce((counts, test) => {
      counts[test.category] = (counts[test.category] || 0) + 1;
      return counts;
    }, {});

    return { totalTests, totalQuestions, categoryCounts };
  };

  const getCategoryStats = () => {
    const categoryStats = {};

    submissions.forEach((submission) => {
      const mockTest = [...mockTests, ...purchasedTests].find(
        (test) => test.id.toString() === submission.mock_test_id.toString()
      );
      if (mockTest) {
        const category = mockTest.category;
        if (!categoryStats[category]) {
          categoryStats[category] = { correct: 0, answered: 0, total: mockTest.questions.length };
        }

        const userAnswers = submission.answers || {};
        mockTest.questions.forEach((question, index) => {
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
    const submission = submissions.find(s => s.mock_test_id.toString() === mockId.toString()) ||
      allSubmissions.find(s => s.mock_test_id.toString() === mockId.toString());

    if (!submission || !submission.answers) return 0;

    const mockTest = [...mockTests, ...purchasedTests].find(
      (test) => test.id.toString() === mockId.toString()
    );

    if (!mockTest) return 0;

    let correct = 0;
    mockTest.questions.forEach((q, idx) => {
      const uAns = submission.answers[idx.toString()];
      if (uAns?.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase()) {
        correct++;
      }
    });

    return Math.round((correct / mockTest.questions.length) * 100);
  };

  const getCorrectCount = (mockId) => {
    const submission = allSubmissions.find((sub) => sub.mock_test_id.toString() === mockId.toString()) ||
      submissions.find((sub) => sub.mock_test_id.toString() === mockId.toString());
    if (!submission) return 0;

    const mockTest = [...mockTests, ...purchasedTests].find(
      (test) => test.id.toString() === submission.mock_test_id.toString()
    );
    if (!mockTest) return 0;

    const userAnswers = submission.answers || {};
    let correct = 0;

    mockTest.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index.toString()];
      const correctAnswer = question.correctAnswer;
      if (userAnswer != null && userAnswer !== '') {
        if (userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()) {
          correct += 1;
        }
      }
    });

    return correct;
  };

  const getTotalQuestions = (mockId) => {
    const mockTest = [...mockTests, ...purchasedTests].find(
      (test) => test.id.toString() === mockId.toString()
    );
    return mockTest ? mockTest.questions.length : 0;
  };
  const getCertificateTier = (accuracy) => {
    const score = Number(accuracy);
    if (score >= 90) {
      return {
        tier: 'GOLD',
        label: 'Certificate of Excellence',
        primary: [184, 134, 11],    // Deep Gold
        secondary: [255, 215, 0],   // Bright Gold
        accent: [255, 245, 200],    // Pale Gold
      };
    }
    if (score >= 80) {
      return {
        tier: 'SILVER',
        label: 'Certificate of Distinction',
        primary: [80, 80, 80],      // Dark Steel
        secondary: [192, 192, 192], // Bright Silver
        accent: [240, 240, 240],    // White Silver
      };
    }
    return {
      tier: 'BRONZE',
      label: 'Certificate of Achievement',
      primary: [100, 50, 20],     // Deep Bronze
      secondary: [176, 141, 87],  // Aged Bronze
      accent: [230, 190, 150],    // Light Copper
    };
  };

  const generateCertificate = (topic, userName, accuracy) => {
    const config = getCertificateTier(accuracy);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // 1. MAIN BACKGROUND
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // 2. THE TOP-LEFT BLACK HEADER
    doc.setFillColor(25, 25, 25);
    doc.moveTo(0, 0);
    doc.lineTo(145, 0);
    doc.lineTo(0, 110);
    doc.fill();

    // 3. THE TOP-RIGHT "PEELED" EFFECT
    // Darker fold
    doc.setFillColor(20, 20, 20);
    doc.moveTo(pageWidth, 0);
    doc.lineTo(pageWidth - 80, 0);
    doc.lineTo(pageWidth, 50);
    doc.fill();
    // Metallic highlight line on the fold
    doc.setDrawColor(...config.secondary);
    doc.setLineWidth(1.5);
    doc.line(pageWidth - 80, 0, pageWidth, 50);

    // 4. THE LUXURY DIAGONAL STRIPES
    // Stripe 1 (Dark Metallic)
    doc.setFillColor(...config.primary);
    doc.moveTo(0, 110);
    doc.lineTo(145, 0);
    doc.lineTo(165, 0);
    doc.lineTo(0, 130);
    doc.fill();

    // Stripe 2 (Bright Metallic)
    doc.setFillColor(...config.secondary);
    doc.moveTo(0, 130);
    doc.lineTo(165, 0);
    doc.lineTo(185, 0);
    doc.lineTo(0, 150);
    doc.fill();

    // 5. BOTTOM ACCENT BAR
    doc.setFillColor(25, 25, 25);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    doc.setFillColor(...config.secondary);
    doc.rect(0, pageHeight - 16, pageWidth, 1, 'F');

    // 6. THE CENTER SEAL (TOP)
    const sealX = pageWidth / 2 + 15; // Shifted slightly right to match image balance
    const sealY = 35;

    // Ribbon Tails
    doc.setFillColor(...config.primary);
    doc.triangle(sealX - 12, sealY + 10, sealX - 18, sealY + 35, sealX - 5, sealY + 25, 'F');
    doc.triangle(sealX + 12, sealY + 10, sealX + 18, sealY + 35, sealX + 5, sealY + 25, 'F');

    // Sunburst Seal
    doc.setFillColor(...config.secondary);
    for (let i = 0; i < 40; i++) {
      let angle = (i * 9) * (Math.PI / 180);
      let r = i % 2 === 0 ? 20 : 17;
      let x = sealX + r * Math.cos(angle);
      let y = sealY + r * Math.sin(angle);
      if (i === 0) doc.moveTo(x, y); else doc.lineTo(x, y);
    }
    doc.fill();

    // Inner Seal Details
    doc.setFillColor(...config.accent);
    doc.circle(sealX, sealY, 14, 'F');
    doc.setDrawColor(...config.primary);
    doc.setLineWidth(0.5);
    doc.circle(sealX, sealY, 12, 'D');

    doc.setTextColor(...config.primary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(config.tier, sealX, sealY - 1, { align: 'center' });
    doc.setFontSize(6);
    doc.text('AWARD', sealX, sealY + 3, { align: 'center' });

    // 7. TEXT CONTENT
    // Top-Left "CERTIFICATE" with Ornate flourishes
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'normal');
    doc.setFontSize(28);
    doc.text('CERTIFICATE', 25, 45);

    // Decorative lines for the header
    doc.setDrawColor(...config.secondary);
    doc.setLineWidth(0.5);
    doc.line(25, 50, 85, 50);
    doc.circle(25, 50, 0.8, 'F');
    doc.circle(85, 50, 0.8, 'F');

    // Company / Topic Name
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('TECHMOCKS ACADEMY', pageWidth / 2 + 40, 85, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(config.label.toUpperCase(), pageWidth / 2 + 40, 93, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', pageWidth / 2 + 40, 110, { align: 'center' });

    // Recipient Name (The focus)
    doc.setTextColor(...config.primary);
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(54);
    doc.text(userName || 'Pratham', pageWidth / 2 + 40, 135, { align: 'center' });

    // Main Recognition Text
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const mainText = `In recognition of outstanding achievement and excellence in "${topic || 'Technical Assessment'}"`;
    const splitMain = doc.splitTextToSize(mainText, 140);
    doc.text(splitMain, pageWidth / 2 + 40, 150, { align: 'center' });

    // 8. FOOTER - DATE & SIGNATURE
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(55, 182, 95, 182); // Date Line
    doc.line(pageWidth - 95, 182, pageWidth - 55, 182); // Sign Line

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('DATE OF ISSUANCE', 75, 188, { align: 'center' });
    doc.text('DIRECTOR OF ASSESSMENT', pageWidth - 75, 188, { align: 'center' });

    // Add the actual date
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date().toLocaleDateString(), 75, 180, { align: 'center' });

    // 9. SAVE
    doc.save(`${config.tier}_Certificate_${userName}.pdf`);
  };
  const categoryStats = !isAdmin ? getCategoryStats() : [];
  const mockTestStats = isAdmin ? getMockTestStats() : null;

  const totalAnswered = !isAdmin ? categoryStats.reduce((sum, stat) => sum + stat.totalQuestionsAnswered, 0) : 0;
  const totalQuestions = !isAdmin ? categoryStats.reduce((sum, stat) => sum + stat.totalQuestions, 0) : 0;
  const overallProgress = !isAdmin ? (totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0) : 0;
  const overallAccuracy = !isAdmin
    ? totalAnswered > 0
      ? categoryStats.reduce((sum, stat) => sum + stat.accuracy * stat.totalQuestionsAnswered, 0) / totalAnswered
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
        <Typography variant='h6' color='error'>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: 3,
        bgcolor: theme.palette.background.default,
        color: textPrimary,
        borderRadius: 2,
        boxShadow: darkMode ? '0 0 10px rgba(0,0,0,0.2)' : '0 0 10px rgba(0,0,0,0.05)',
        minHeight: '90vh',
      }}
    >
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
                <Chip
                  label={`${userRank.rank} (Points: ${userRank.points})`}
                  sx={{ bgcolor: getRankColor(userRank.rank), color: 'white', fontWeight: 'bold' }}
                />
                {isAdmin && (
                  <Chip label='ADMIN' color='primary' size='small' sx={{ ml: 1, fontWeight: 'bold' }} />
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 'bold', color: textPrimary, mb: 2 }}>
            Your Badges
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {badges.length > 0 ? (
              badges.map((badge, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 2,
                    minWidth: '150px',
                    borderRadius: 2,
                    boxShadow: `0 2px 4px ${borderColor}`,
                    bgcolor: theme.palette.background.default,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='h6'>{badge.icon}</Typography>
                    <Typography variant='body1' fontWeight='bold' color={textPrimary}>
                      {badge.name}
                    </Typography>
                  </Box>
                  <Typography variant='body2' color={textSecondary}>
                    {badge.description}
                  </Typography>
                  <Typography variant='caption' color={textSecondary}>
                    Earned: {new Date(badge.earned_at).toLocaleDateString()}
                  </Typography>
                </Card>
              ))
            ) : (
              <Typography variant='body1' color={textSecondary}>
                No badges earned yet. Complete more tests to earn badges!
              </Typography>
            )}
          </Box>
        </Box>
      </motion.div>

      <Box
        sx={{
          bgcolor: theme.palette.background.default,
          borderRadius: 2,
          mb: 3,
          boxShadow: `0 2px 4px ${borderColor}`,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant='fullWidth'
          textColor='primary'
          indicatorColor='primary'
          aria-label='dashboard tabs'
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Home />} label='DASHBOARD' iconPosition='start' />
          {isAdmin ? (
            [
              <Tab key='manage-submissions' icon={<AssignmentTurnedIn />} label='MANAGE SUBMISSIONS' iconPosition='start' />,
              <Tab key='users' icon={<PeopleAlt />} label='USERS' iconPosition='start' />,
            ]
          ) : (
            [
              <Tab key='mock-exams' icon={<School />} label='MOCK EXAMS' iconPosition='start' />,
              <Tab key='free-techmocks' icon={<Psychology />} label='FREE TECHMOCKS' iconPosition='start' />,
            ]
          )}
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <motion.div variants={containerVariants} initial='hidden' animate='visible'>
          {isAdmin ? (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card
                    sx={{
                      flex: '1 1 200px',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant='h6' fontWeight='bold'>
                      Mock Tests
                    </Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>
                      {mockTestStats.totalTests}
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Total questions: {mockTestStats.totalQuestions}
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      flex: '1 1 200px',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant='h6' fontWeight='bold'>
                      Registered Users
                    </Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>
                      {userStats.length || 0}
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Active users:{' '}
                      {userStats.filter(
                        (user) =>
                          user.lastLogin &&
                          new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length || 0}
                    </Typography>
                  </Card>
                  <Card
                    sx={{
                      flex: '1 1 200px',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant='h6' fontWeight='bold'>
                      Test Attempts
                    </Typography>
                    <Typography variant='h3' sx={{ my: 2 }}>
                      {userStats.reduce((sum, user) => sum + (user.testsTaken || 0), 0)}
                    </Typography>
                    <Typography variant='body2' sx={{ opacity: 0.9 }}>
                      Avg per user:{' '}
                      {userStats.length
                        ? (userStats.reduce((sum, user) => sum + (user.testsTaken || 0), 0) / userStats.length).toFixed(1)
                        : 0}
                    </Typography>
                  </Card>
                </Box>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>
                  All Purchased Tests
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            User Name
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            User Email
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            Test Title
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            Category
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            Pricing Type
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            Price
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight='bold' color={textPrimary}>
                            Purchase Date
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allPurchasedTests.map((purchase, index) => (
                        <TableRow
                          key={index}
                          sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' } }}
                        >
                          <TableCell sx={{ color: textPrimary }}>{purchase.userName}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.userEmail}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.mockTestTitle}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{purchase.category}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>
                            <Chip
                              label={purchase.pricingType.toUpperCase()}
                              size='small'
                              color={purchase.pricingType === 'free' ? 'success' : 'primary'}
                              variant='filled'
                            />
                          </TableCell>
                          <TableCell sx={{ color: textPrimary }}>₹{purchase.price}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>
                            {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {allPurchasedTests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align='center' sx={{ color: textSecondary }}>
                            No purchased tests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>
                  Mock Tests by Category
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(mockTestStats.categoryCounts).map(([category, count], index) => (
                    <Card
                      key={index}
                      sx={{
                        p: 3,
                        minWidth: '200px',
                        borderRadius: 2,
                        boxShadow: `0 2px 4px ${borderColor}`,
                        bgcolor: theme.palette.background.default,
                      }}
                    >
                      <Typography variant='h6' color={textPrimary}>
                        {category}
                      </Typography>
                      <Typography variant='h4' sx={{ my: 2 }} color={textPrimary}>
                        {count}
                      </Typography>
                      <Typography variant='body2' color={textSecondary}>
                        {Math.round((count / mockTestStats.totalTests) * 100)}% of total
                      </Typography>
                    </Card>
                  ))}
                  {Object.keys(mockTestStats.categoryCounts).length === 0 && (
                    <Typography variant='body1' color={textSecondary}>
                      No mock tests created yet
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card
                    sx={{
                      flex: '1 1 300px',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <Typography variant='h6' fontWeight='bold'>
                      Overall Progress
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress
                          variant='determinate'
                          value={overallProgress}
                          size={80}
                          thickness={6}
                          sx={{ color: 'white' }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant='body1' fontWeight='bold'>
                            {Math.round(overallProgress)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant='body2' sx={{ opacity: 0.9 }}>
                          Questions answered: {totalAnswered} / {totalQuestions}
                        </Typography>
                        <Typography variant='body2' sx={{ opacity: 0.9, mt: 1 }}>
                          Average accuracy: {Math.round(overallAccuracy)}%
                        </Typography>
                        <Typography variant='body2' sx={{ opacity: 0.9, mt: 1 }}>
                          Rank: {userRank.rank} ({userRank.points} points)
                        </Typography>
                        {totalAnswered === 0 && (
                          <Typography variant='body2' sx={{ opacity: 0.7, mt: 1, color: 'white' }}>
                            No progress yet. Start a mock test!
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Card>
                  <Card
                    sx={{
                      flex: '1 1 300px',
                      p: 3,
                      borderRadius: 3,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <Typography variant='h6' fontWeight='bold' color={textPrimary}>
                      Latest Achievement
                    </Typography>
                    {badges.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant='h6'>{badges[0].icon}</Typography>
                          <Typography variant='body1' fontWeight='medium' color={textPrimary}>
                            {badges[0].name}
                          </Typography>
                        </Box>
                        <Typography variant='body2' color={textSecondary}>
                          {badges[0].description}
                        </Typography>
                        <Typography variant='caption' color={textSecondary}>
                          Earned: {new Date(badges[0].earned_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant='body1' sx={{ mt: 2, color: textSecondary }}>
                        No badges earned yet. Start a mock test to earn your first!
                      </Typography>
                    )}
                    {submissions.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant='body1' fontWeight='medium' color={textPrimary}>
                          {[...mockTests, ...purchasedTests].find(
                            (test) => test.id.toString() === submissions[submissions.length - 1]?.mock_test_id?.toString()
                          )?.title || 'Mock Test'}
                        </Typography>
                        <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>
                          Completed on{' '}
                          {new Date(submissions[submissions.length - 1]?.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip
                          icon={<AssignmentTurnedIn />}
                          label='Completed'
                          color='success'
                          size='small'
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    ) : (
                      <Typography variant='body1' sx={{ mt: 2, color: textSecondary }}>
                        No achievements yet. Start a mock test to earn your first!
                      </Typography>
                    )}
                  </Card>
                </Box>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>
                  Attempted Mocks
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {mockTests
                    .filter((mock) => submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()))
                    .map((mock, i) => {
                      const accuracy = getMockAccuracy(mock.id);
                      const submission = submissions.find((sub) => sub.mock_test_id.toString() === mock.id.toString());
                      const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                      return (
                        <motion.div
                          key={i}
                          whileHover={{
                            scale: 1.01,
                            boxShadow: darkMode
                              ? '0 6px 12px rgba(255,255,255,0.05)'
                              : '0 6px 12px rgba(0,0,0,0.08)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        >
                          <Card
                            variant='outlined'
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              borderColor: 'transparent',
                              boxShadow: `0 2px 4px ${borderColor}`,
                              bgcolor: theme.palette.background.default,
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant='h6' fontWeight='bold' color={textPrimary}>
                                  {mock.title}
                                </Typography>
                                <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>
                                  {mock.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={`${mock.category}`}
                                    size='small'
                                    sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}
                                  />
                                  <Chip label={`${mock.questions.length} Questions`} size='small' variant='outlined' />
                                  <Chip
                                    label={mock.pricing_type === 'free' ? 'FREE' : 'PAID'}
                                    size='small'
                                    color={mock.pricing_type === 'free' ? 'success' : 'primary'}
                                    variant='filled'
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                                  <CircularProgress
                                    variant='determinate'
                                    value={accuracy}
                                    size={50}
                                    thickness={6}
                                    sx={{ color: accuracy === 100 ? 'success.main' : 'primary.main' }}
                                  />
                                  <Box
                                    sx={{
                                      top: 0,
                                      left: 0,
                                      bottom: 0,
                                      right: 0,
                                      position: 'absolute',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography variant='body2' fontWeight='bold' color={textPrimary}>
                                      {accuracy}%
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant='body2' color={textSecondary}>
                                  ({answeredCount} / {mock.questions.length} answered)
                                </Typography>
                              </Box>
                            </Box>
                            <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
                              <Button
                                variant='contained'
                                sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: 4, px: 3 }}
                                onClick={() => handleReviewMock(mock.id)}
                              >
                                Review Mock
                              </Button>
                              <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }}>
                                Score: ({accuracy}%)
                              </Button>
                              {accuracy >= 80 && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  sx={{ borderRadius: 4, px: 3 }}
                                  onClick={() => generateCertificate(mock.title, userData?.name, accuracy)}
                                >
                                  Get {accuracy === 100 ? 'Gold' : accuracy >= 90 ? 'Silver' : 'Bronze'} Certificate
                                </Button>
                              )}
                              <Button
                                variant='contained'
                                color='warning'
                                sx={{ borderRadius: 4, px: 3 }}
                                onClick={() => handleReAttemptMock(mock.id)}
                              >
                                Re-Attempt
                              </Button>
                            </Stack>
                          </Card>
                        </motion.div>
                      );
                    })}
                  {!mockTests.some((mock) => submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString())) && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 5,
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant='h6' color={textSecondary}>
                        You haven't attempted any mocks yet
                      </Typography>
                      <Button
                        variant='contained'
                        color='primary'
                        sx={{ mt: 2, borderRadius: 4, px: 3 }}
                        onClick={() => setTabIndex(1)}
                      >
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

      {tabIndex === 1 && (
        <Box>
          {isAdmin ? (
            <>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>
                Manage Submissions
              </Typography>
              <TableContainer
                component={Paper}
                sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          User Name
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          User Email
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          Test Title
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          Category
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          Score
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          Submission Date
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight='bold' color={textPrimary}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allSubmissions.map((submission, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' } }}
                      >
                        <TableCell sx={{ color: textPrimary }}>{submission.userName}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.userEmail}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.mockTestTitle}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{submission.category}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography>{getMockAccuracy(submission.mock_test_id)}%</Typography>
                            <Typography variant="caption" color={textSecondary} sx={{ ml: 1 }}>
                              ({getCorrectCount(submission.mock_test_id)}/{getTotalQuestions(submission.mock_test_id)} correct)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='contained'
                            color='error'
                            size='small'
                            startIcon={<Delete />}
                            sx={{ borderRadius: 2 }}
                            onClick={() => handleDeleteSubmission(submission.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allSubmissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align='center' sx={{ color: textSecondary }}>
                          No submissions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              <Typography variant='h5' sx={{ mt: 3, mb: 2, color: textPrimary }}>
                Your Purchased Mock Exams
              </Typography>
              <Stack spacing={2}>
                {purchasedTests.map((mock, index) => {
                  const accuracy = getMockAccuracy(mock.id);
                  const submission = submissions.find((sub) => sub.mock_test_id.toString() === mock.id.toString());
                  const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                  return (
                    <motion.div
                      key={index}
                      whileHover={{
                        scale: 1.01,
                        boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          boxShadow: `0 2px 4px ${borderColor}`,
                          bgcolor: theme.palette.background.default,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant='h6' fontWeight='bold' color={textPrimary}>
                              {mock.title}
                            </Typography>
                            <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>
                              {mock.description}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip
                                label={`${mock.category}`}
                                size='small'
                                sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}
                              />
                              <Chip label={`${mock.questions.length} Questions`} size='small' variant='outlined' />
                              <Chip
                                label={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'Attempted' : 'Not Attempted'}
                                size='small'
                                color={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'success' : 'default'}
                                variant={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'filled' : 'outlined'}
                              />
                            </Box>
                          </Box>
                          <Stack direction='row' spacing={1}>
                            {submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? (
                              <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mock.id)}>
                                Review Test
                              </Button>
                            ) : (
                              <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mock.id}`)}>
                                Take Test
                              </Button>
                            )}
                            {submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) && (
                              <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }} onClick={() => navigate(`/results/${mock.id}`)}>
                                View Results ({accuracy}%)
                              </Button>
                            )}
                            {accuracy >= 80 && (
                              <Button
                                variant='contained'
                                color='success'
                                sx={{ borderRadius: 4, px: 3 }}
                                onClick={() => generateCertificate(mock.title, userData?.name, accuracy)}
                              >
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
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 5,
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant='h6' color={textSecondary}>
                      No purchased mock tests available
                    </Typography>
                    <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>
                      You haven't purchased any mock tests yet. Visit the store to buy some!
                    </Typography>
                    <Button
                      variant='contained'
                      color='primary'
                      sx={{ mt: 2, borderRadius: 4, px: 3 }}
                      onClick={() => navigate('/store')}
                    >
                      Go to Store
                    </Button>
                  </Box>
                )}
              </Stack>
            </>
          )}
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          {isAdmin ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color={textPrimary}>
                  Assign Mock Tests
                </Typography>
                <Button variant="contained" onClick={handleViewUsers} sx={{ borderRadius: 2 }}>
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography fontWeight="bold">User</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Assigned Tests</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight="bold">Assign New</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userStats.slice(0, 10).map((user) => {
                      // Use _id instead of id
                      const userId = user._id;

                      return (
                        <TableRow key={userId} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                {user.name?.charAt(0) || '?'}
                              </Avatar>
                              {user.name || '—'}
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {/* ... existing assigned mocks logic ... */}
                          </TableCell>
                          <TableCell align="right">
                            <Select
                              size="small"
                              // Fix: bind value to state so it doesn't look empty
                              value={selectedMockForUser[userId] || ""}
                              onChange={(e) => handleAssignTest(userId, e.target.value)}
                              displayEmpty
                              sx={{ minWidth: 180, mr: 1 }}
                            >
                              <MenuItem value="" disabled>Select test...</MenuItem>
                              {mockTests
                                .filter((m) => !user.assignedMocks?.some((am) => am.id === m.id))
                                .map((mock) => (
                                  <MenuItem key={mock.id} value={mock.id}>
                                    {mock.title}
                                  </MenuItem>
                                ))}
                            </Select>
                            <Button
                              variant="contained"
                              size="small"
                              // Use userId (_id) here
                              disabled={!selectedMockForUser[userId]}
                              onClick={() => confirmAssign(userId)}
                            >
                              Assign
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {userStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ color: textSecondary, py: 4 }}>
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              <Typography variant='h5' sx={{ mt: 3, mb: 2, color: textPrimary }}>
                Free TechMocks
              </Typography>
              <Stack spacing={2}>
                {(() => {
                  const freeMockTests = mockTests.filter((mock) => mock.pricing_type === 'free');
                  console.log('Free mock tests:', freeMockTests);
                  return freeMockTests.map((mock, index) => {
                    const accuracy = getMockAccuracy(mock.id);
                    const submission = submissions.find((sub) => sub.mock_test_id.toString() === mock.id.toString());
                    const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{
                          scale: 1.01,
                          boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      >
                        <Card
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            boxShadow: `0 2px 4px ${borderColor}`,
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant='h6' fontWeight='bold' color={textPrimary}>
                                {mock.title}
                              </Typography>
                              <Typography variant='body2' color={textSecondary} sx={{ mt: 1, mb: 2 }}>
                                {mock.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  label={`${mock.category}`}
                                  size='small'
                                  sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}
                                />
                                <Chip label={`${mock.questions.length} Questions`} size='small' variant='outlined' />
                                <Chip
                                  label='FREE'
                                  size='small'
                                  color='success'
                                  variant='filled'
                                />
                                <Chip
                                  label={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'Attempted' : 'Not Attempted'}
                                  size='small'
                                  color={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'primary' : 'default'}
                                  variant={submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? 'filled' : 'outlined'}
                                />
                              </Box>
                            </Box>
                            <Stack direction='row' spacing={1}>
                              {submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) ? (
                                <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mock.id)}>
                                  Review Test
                                </Button>
                              ) : (
                                <Button variant='contained' sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mock.id}`)}>
                                  Take Test
                                </Button>
                              )}
                              {submissions.some((sub) => sub.mock_test_id.toString() === mock.id.toString()) && (
                                <Button variant='outlined' sx={{ borderRadius: 4, px: 3 }} onClick={() => navigate(`/results/${mock.id}`)}>
                                  View Results ({accuracy}%)
                                </Button>
                              )}
                              {accuracy >= 80 && (
                                <Button
                                  variant='contained'
                                  color='success'
                                  sx={{ borderRadius: 4, px: 3 }}
                                  onClick={() => generateCertificate(mock.title, userData?.name, accuracy)}
                                >
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
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 5,
                      bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant='h6' color={textSecondary}>
                      No free mock tests available
                    </Typography>
                    <Typography variant='body2' color={textSecondary} sx={{ mt: 1 }}>
                      Please check back later for new free mock tests
                    </Typography>
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