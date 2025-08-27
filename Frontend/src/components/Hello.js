import React, { useEffect, useState } from 'react';
import { Stack, Card, CardContent, Typography, Box, Button, Tabs, Tab, Avatar, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AssignmentTurnedIn, School, Psychology, Home, PeopleAlt, Add, BarChart } from '@mui/icons-material';
import jsPDF from 'jspdf'; // Add this library for PDF generation
import 'jspdf-autotable'; // Optional: for table formatting in PDF

const Hello = ({ darkMode }) => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState([]);
  const [purchasedTests, setPurchasedTests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const theme = useTheme();

  // Dynamically set colors based on darkMode prop
  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const cardBgColor = darkMode ? '#1e1e1e' : 'white';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';
  const textSecondary = darkMode ? '#aaaaaa' : 'text.secondary';
  const borderColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('User email:', decodedToken.email);
      console.log('User role:', decodedToken.role);

      setIsAdmin(decodedToken.role === 'admin');

      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Fetch user profile (includes purchasedTests)
          const userResponse = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: token },
          });
          setUserData(userResponse.data);
          setPurchasedTests(Array.isArray(userResponse.data.purchasedTests) ? userResponse.data.purchasedTests : []);

          // Fetch all mock tests
          const mockResponse = await axios.get(`${backendUrl}/api/admin/mock-tests`, {
            headers: { Authorization: token },
          });
          console.log('Fetched mock tests:', mockResponse.data);
          setMockTests(Array.isArray(mockResponse.data) ? mockResponse.data : []);

          if (decodedToken.role !== 'admin') {
            const submissionResponse = await axios.get(`${backendUrl}/api/submissions`, {
              headers: { Authorization: token },
            });
            setSubmissions(submissionResponse.data);
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
      console.error('Invalid or expired token - Details:', error.message);
      setError('Invalid or expired token. Please log in again.');
      navigate('/login');
      setLoading(false);
    }
  }, [token, navigate]);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleReviewMock = (mockId) => {
    navigate(`/mock-test/${mockId}/review`);
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL

  const handleReAttemptMock = async (mockId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/mock-test/${mockId}/submit`,
        { answers: {} }, // Initial empty answers, to be filled during re-attempt
        { headers: { Authorization: token } }
      );
      navigate(`/mock-test/${mockId}`);
    } catch (error) {
      setError('Failed to start re-attempt. Please try again.');
    }
  };

  const handleCreateMock = () => {
    navigate('/admin');
  };

  const handleEditMock = (mockId) => {
    navigate(`/admin/edit-mock/${mockId}`);
  };

  const handleViewUsers = () => {
    navigate('/admin/users');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getMockTestStats = () => {
    const totalTests = mockTests.length;
    const totalQuestions = mockTests.reduce((sum, test) => sum + test.questions.length, 0);
    const categoryCounts = mockTests.reduce((counts, test) => {
      counts[test.category] = (counts[test.category] || 0) + 1;
      return counts;
    }, {});

    return {
      totalTests,
      totalQuestions,
      categoryCounts
    };
  };

  const getCategoryStats = () => {
    const categoryStats = {};

    submissions.forEach(submission => {
      const mockTest = [...mockTests, ...purchasedTests].find(test => test.id.toString() === submission.mock_test_id.toString());
      if (mockTest) {
        const category = mockTest.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            correct: 0,
            answered: 0,
            total: mockTest.questions.length,
          };
        }

        const userAnswers = submission.answers || {};
        mockTest.questions.forEach((question, index) => {
          const userAnswer = userAnswers[index.toString()];
          if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
            categoryStats[category].answered += 1;
            if (userAnswer.toString().trim() === question.correctAnswer.toString().trim()) {
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
    const submission = submissions.find(sub => sub.mock_test_id.toString() === mockId.toString());
    if (!submission) return 0;

    const mockTest = [...mockTests, ...purchasedTests].find(test => test.id.toString() === submission.mock_test_id.toString());
    if (!mockTest) return 0;

    const userAnswers = submission.answers || {};
    let correct = 0;
    const totalQuestions = mockTest.questions.length;

    mockTest.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index.toString()];
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        if (userAnswer.toString().trim() === question.correctAnswer.toString().trim()) {
          correct += 1;
        }
      } else {
        // Unanswered questions are treated as wrong, no increment to correct
      }
    });

    return totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
  };

  const generateCertificate = (mockTitle, userName, accuracy) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    doc.polygon = function (points, style) {
      this.lines(
        points.map((p, i) => i === 0 ? [0, 0] : [p[0] - points[0][0], p[1] - points[0][1]]),
        points[0][0], points[0][1],
        [1, 1],
        style
      );
    };

    const pageWidth = doc.internal.pageSize.width;  // 297mm
    const pageHeight = doc.internal.pageSize.height; // 210mm

    // ===== Color Palette (Professional & Elegant) =====
    const colors = {
      navy: [25, 55, 100],       // Deep blue for titles
      gold: [218, 165, 32],      // Rich gold accents
      lightGold: [255, 215, 0],  // Bright stars
      pale: [249, 250, 253],     // Soft off-white background
      text: [50, 50, 50],        // Dark gray for readability
      accent: [70, 130, 180],    // Subtle blue for details
      lightNavy: [0, 50, 100]    // Lighter navy for ribbon shading
    };

    // ===== Background =====
    doc.setFillColor(...colors.pale);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // ===== Decorative Corner Elements =====
    const drawCornerTriangle = (x1, y1, x2, y2, x3, y3, fill) => {
      doc.setFillColor(...fill);
      doc.triangle(x1, y1, x2, y2, x3, y3, 'F');
    };

    // Top-left corner
    drawCornerTriangle(0, 0, 0, 35, 40, 0, colors.navy);
    drawCornerTriangle(0, 35, 15, 20, 40, 0, colors.gold);

    // Bottom-right corner
    drawCornerTriangle(pageWidth, pageHeight, pageWidth, pageHeight - 35, pageWidth - 40, pageHeight, colors.navy);
    drawCornerTriangle(pageWidth, pageHeight - 35, pageWidth - 15, pageHeight - 20, pageWidth - 40, pageHeight, colors.gold);

    // Top-right small triangle
    drawCornerTriangle(pageWidth, 0, pageWidth - 25, 0, pageWidth, 25, colors.navy);

    // Bottom-left small triangle
    drawCornerTriangle(0, pageHeight, 0, pageHeight - 25, 25, pageHeight, colors.navy);

    // ===== Border Frame =====
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner decorative line
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // ===== Main Title =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(...colors.navy);
    doc.text("CERTIFICATE OF ACHIEVEMENT", pageWidth / 2, 36, { align: 'center' });

    // Optional subtitle (smaller, italic)
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.setTextColor(...colors.gold);
    doc.text("Official Recognition of Excellence", pageWidth / 2, 48, { align: 'center' });

    // ===== Presented To =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.text("This certificate is proudly presented to:", pageWidth / 2, 68, { align: 'center' });

    // ===== Recipient Name (Elegant Calligraphy Style) =====
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(40);
    const nameText = userName || "John Doe";
    const nameWidth = doc.getTextWidth(nameText);
    doc.setTextColor(...colors.gold);
    doc.text(nameText, pageWidth / 2, 90, { align: 'center' });

    // Decorative double underline
    const lineOffset = 4;
    const underlineY = 94;
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(1.8);
    doc.line((pageWidth - nameWidth - 20) / 2, underlineY, (pageWidth + nameWidth + 20) / 2, underlineY);

    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(0.6);
    doc.line((pageWidth - nameWidth - 20) / 2, underlineY + 2, (pageWidth + nameWidth + 20) / 2, underlineY + 2);

    // ===== Achievement Statement =====
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...colors.navy);
    doc.text(`For successfully completing`, pageWidth / 2, 112, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...colors.gold);
    const titleText = mockTitle || "Advanced Training Program";
    doc.text(titleText, pageWidth / 2, 124, { align: 'center', maxWidth: pageWidth - 80 });

    // ===== Description Paragraph =====
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    const desc = `${userName || "The recipient"} demonstrated exceptional knowledge and dedication, achieving a score of ${accuracy}% in the assessment. This reflects a high level of commitment, preparation, and mastery of the subject matter.`;
    doc.text(desc, pageWidth / 2, 140, {
      align: 'center',
      maxWidth: pageWidth - 60,
      lineHeightFactor: 1.5
    });

    // ===== Gold Seal (Improved, No Overlap, Top-Right Corner) =====
    const sealX = pageWidth - 40; // Far right with margin
    const sealY = 55;             // Below title
    const radius = 22;            // Slightly larger seal

    // Subtle shadow for seal
    doc.setFillColor(0, 0, 0, 0.2); // Semi-transparent black
    doc.circle(sealX + 2, sealY + 2, radius, 'F');

    // Simulated gradient for gold ring (outer layer)
    doc.setFillColor(...colors.gold);
    doc.circle(sealX, sealY, radius, 'F');

    // Inner gold ring for metallic effect
    doc.setFillColor(...colors.lightGold);
    doc.circle(sealX, sealY, radius - 2, 'F');

    // Dotted border (refined)
    doc.setFillColor(...colors.navy);
    for (let angle = 0; angle < 360; angle += 10) { // Tighter spacing for elegance
      const rad = (angle * Math.PI) / 180;
      doc.circle(sealX + Math.cos(rad) * (radius + 2), sealY + Math.sin(rad) * (radius + 2), 0.8, 'F'); // Smaller dots
    }

    // Inner cream circle
    doc.setFillColor(255, 248, 220); // Cream
    doc.circle(sealX, sealY, radius - 5, 'F');

    // Thin navy outline for inner circle
    doc.setDrawColor(...colors.navy);
    doc.setLineWidth(0.4);
    doc.circle(sealX, sealY, radius - 5, 'S');

    // Text inside seal
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.navy);
    doc.text("EXCELLENCE", sealX, sealY - 3, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...colors.gold);
    doc.text("AWARD", sealX, sealY + 2, { align: 'center' });

    // Stars
    doc.setFontSize(12);
    doc.setTextColor(...colors.lightGold);
    doc.text("* * *", sealX, sealY + 8, { align: 'center' });

    // Ribbon (curved, flowing effect using lines)
    // ===== Gold Seal Ribbon (Elegant, Symmetrical) =====
    // Left ribbon tail
    doc.setFillColor(...colors.navy);
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(0.5);
    doc.polygon([
      [sealX - 10, sealY + radius],           // Top left (under seal)
      [sealX - 22, sealY + radius + 18],      // Bottom left
      [sealX - 6, sealY + radius + 10],       // Inner tip
    ], 'FD');

    // Right ribbon tail
    doc.setFillColor(...colors.navy);
    doc.setDrawColor(...colors.gold);
    doc.polygon([
      [sealX + 10, sealY + radius],           // Top right (under seal)
      [sealX + 22, sealY + radius + 18],      // Bottom right
      [sealX + 6, sealY + radius + 10],       // Inner tip
    ], 'FD');

    // Ribbon center (under seal)
    doc.setFillColor(...colors.lightNavy);
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(0.5);
    doc.polygon([
      [sealX - 6, sealY + radius + 10],       // Left tip
      [sealX + 6, sealY + radius + 10],       // Right tip
      [sealX, sealY + radius + 5],            // Center dip
    ], 'FD');

    // Optional ribbon text (e.g., year)
    doc.setFont('times', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text("2025", sealX, sealY + radius + 8, { align: 'center' });

    // ===== Footer: Signatures & Date =====
    const sigY = pageHeight - 40;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...colors.navy);

    // Left Signature
    doc.text("Authorized Signatory", 50, sigY, { align: 'center' });
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(0.8);
    doc.line(30, sigY + 3, 70, sigY + 3);

    // Right Signature
    doc.text("Director", pageWidth - 50, sigY, { align: 'center' });
    doc.line(pageWidth - 70, sigY + 3, pageWidth - 30, sigY + 3);

    // Center Date & Location
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    const currentDate = new Date();
    const dateStr = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(currentDate);
    doc.text(`Issued on: ${dateStr}`, pageWidth / 2, sigY + 14, { align: 'center' });
    doc.text("TechMock", pageWidth / 2, sigY, { align: 'center' });

    // Footer decorative line
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(1);
    doc.line(50, sigY + 18, pageWidth - 50, sigY + 18);

    // ===== Final Touch: Centering & Clean Output =====
    const cleanName = (userName || 'Recipient').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Certificate_Of_Achievement_${cleanName}_${currentDate.getFullYear()}.pdf`;

    doc.save(fileName);
  };

  const categoryStats = !isAdmin ? getCategoryStats() : [];
  const mockTestStats = isAdmin ? getMockTestStats() : null;

  const totalAnswered = !isAdmin ? categoryStats.reduce((sum, stat) => sum + stat.totalQuestionsAnswered, 0) : 0;
  const totalQuestions = !isAdmin ? categoryStats.reduce((sum, stat) => sum + stat.totalQuestions, 0) : 0;
  const overallProgress = !isAdmin ? (totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0) : 0;
  const overallAccuracy = !isAdmin ? (totalAnswered > 0
    ? categoryStats.reduce((sum, stat) => sum + (stat.accuracy * stat.totalQuestionsAnswered), 0) / totalAnswered
    : 0) : 0;

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
        <Typography variant="h6" color="error">
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
        minHeight: '90vh'
      }}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
              src={userData?.profilePicture}
            >
              {userData?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: textPrimary }}>
                {getGreeting()}, {userData?.name || 'User'}!
              </Typography>
              <Typography variant="body1" color={textSecondary}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>
              {isAdmin && (
                <Chip
                  label="ADMIN"
                  color="primary"
                  size="small"
                  sx={{ ml: 1, fontWeight: 'bold' }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </motion.div>

      <Box sx={{ bgcolor: theme.palette.background.default, borderRadius: 2, mb: 3, boxShadow: `0 2px 4px ${borderColor}` }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="dashboard tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Home />} label="DASHBOARD" iconPosition="start" />
          {isAdmin ? (
            [
              <Tab key="manage-mocks" icon={<School />} label="MANAGE MOCKS" iconPosition="start" />,
              <Tab key="users" icon={<PeopleAlt />} label="USERS" iconPosition="start" />,
            ]
          ) : (
            [
              <Tab key="mock-exams" icon={<School />} label="MOCK EXAMS" iconPosition="start" />,
              <Tab key="free-techmocks" icon={<Psychology />} label="FREE TECHMOCKS" iconPosition="start" />,
            ]
          )}
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isAdmin ? (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Mock Tests</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{mockTestStats.totalTests}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Total questions: {mockTestStats.totalQuestions}</Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Registered Users</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{userStats.length || 0}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Active users: {userStats.filter(user => user.lastLogin && new Date(user.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}</Typography>
                  </Card>
                  <Card sx={{ flex: '1 1 200px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Test Attempts</Typography>
                    <Typography variant="h3" sx={{ my: 2 }}>{userStats.reduce((sum, user) => sum + (user.testsTaken || 0), 0)}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg per user: {userStats.length ? (userStats.reduce((sum, user) => sum + (user.testsTaken || 0), 0) / userStats.length).toFixed(1) : 0}</Typography>
                  </Card>
                </Box>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="bold" color={textPrimary}>Recent Activity</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={handleCreateMock} sx={{ borderRadius: 2 }}>Create New Mock</Button>
                </Box>
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><Typography fontWeight="bold" color={textPrimary}>Recent Test Submissions</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color={textPrimary}>User</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color={textPrimary}>Score</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color={textPrimary}>Date</Typography></TableCell>
                        <TableCell><Typography fontWeight="bold" color={textPrimary}>Actions</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userStats.slice(0, 5).map((user, index) => (
                        <TableRow key={index} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' } }}>
                          <TableCell sx={{ color: textPrimary }}>{mockTests[index % mockTests.length]?.title || 'Mock Test'}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{user.name}</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{Math.floor(Math.random() * 100)}%</TableCell>
                          <TableCell sx={{ color: textPrimary }}>{new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</TableCell>
                          <TableCell><Button size="small" variant="outlined">View Details</Button></TableCell>
                        </TableRow>
                      ))}
                      {userStats.length === 0 && (
                        <TableRow><TableCell colSpan={5} align="center" sx={{ color: textSecondary }}>No recent submissions</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Mock Tests by Category</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(mockTestStats.categoryCounts).map(([category, count], index) => (
                    <Card key={index} sx={{ p: 3, minWidth: '200px', borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
                      <Typography variant="h6" color={textPrimary}>{category}</Typography>
                      <Typography variant="h4" sx={{ my: 2 }} color={textPrimary}>{count}</Typography>
                      <Typography variant="body2" color={textSecondary}>{Math.round(count / mockTestStats.totalTests * 100)}% of total</Typography>
                    </Card>
                  ))}
                  {Object.keys(mockTestStats.categoryCounts).length === 0 && (
                    <Typography variant="body1" color={textSecondary}>No mock tests created yet</Typography>
                  )}
                </Box>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">Overall Progress</Typography>
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                        <CircularProgress variant="determinate" value={overallProgress} size={80} thickness={6} sx={{ color: 'white' }} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body1" fontWeight="bold">{Math.round(overallProgress)}%</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Questions answered: {totalAnswered} / {totalQuestions}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Average accuracy: {Math.round(overallAccuracy)}%</Typography>
                        {totalAnswered === 0 && (
                          <Typography variant="body2" sx={{ opacity: 0.7, mt: 1, color: 'white' }}>No progress yet. Start a mock test!</Typography>
                        )}
                      </Box>
                    </Box>
                  </Card>
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', bgcolor: theme.palette.background.default }}>
                    <Typography variant="h6" fontWeight="bold" color={textPrimary}>Latest Achievement</Typography>
                    {submissions.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" fontWeight="medium" color={textPrimary}>
                          {[...mockTests, ...purchasedTests].find(test => test.id.toString() === submissions[submissions.length - 1]?.mock_test_id?.toString())?.title || 'Mock Test'}
                        </Typography>
                        <Typography variant="body2" color={textSecondary} sx={{ mt: 1 }}>
                          Completed on {new Date(submissions[submissions.length - 1]?.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip icon={<AssignmentTurnedIn />} label="Completed" color="success" size="small" sx={{ mt: 2 }} />
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mt: 2, color: textSecondary }}>No achievements yet. Start a mock test to earn your first!</Typography>
                    )}
                  </Card>
                </Box>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: textPrimary }}>Attempted Mocks</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {mockTests
                    .filter(mock => submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()))
                    .map((mock, i) => {
                      const accuracy = getMockAccuracy(mock.id);
                      const submission = submissions.find(sub => sub.mock_test_id.toString() === mock.id.toString());
                      const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                      return (
                        <motion.div key={i} whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                          <Card variant="outlined" sx={{
                            p: 3,
                            borderRadius: 2,
                            borderColor: 'transparent',
                            boxShadow: `0 2px 4px ${borderColor}`,
                            bgcolor: theme.palette.background.default,
                            '&:hover': { borderColor: 'primary.main' }
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                                <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  <Chip label={`${mock.category}`} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }} />
                                  <Chip label={`${mock.questions.length} Questions`} size="small" variant="outlined" />
                                  <Chip
                                    label={mock.pricing_type === 'free' ? 'FREE' : 'PAID'}
                                    size="small"
                                    color={mock.pricing_type === 'free' ? 'success' : 'primary'}
                                    variant="filled"
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                                  <CircularProgress variant="determinate" value={accuracy} size={50} thickness={6} sx={{ color: accuracy === 100 ? 'success.main' : 'primary.main' }} />
                                  <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="body2" fontWeight="bold" color={textPrimary}>{accuracy}%</Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" color={textSecondary}>({answeredCount} / {mock.questions.length} answered)</Typography>
                              </Box>
                            </Box>
                            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                              <Button variant="contained" sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: 4, px: 3 }} onClick={() => handleReviewMock(mock.id)}>Review Mock</Button>
                              <Button variant="outlined" sx={{ borderRadius: 4, px: 3 }} onClick={() => navigate(`/results/${mock.id}`)}>View Results ({accuracy}%)</Button>
                              {accuracy >= 80 && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  sx={{ borderRadius: 4, px: 3 }}
                                  onClick={() => generateCertificate(mock.title, userData?.name, accuracy)}
                                >
                                  Get Certificate
                                </Button>
                              )}
                              <Button
                                variant="contained"
                                color="warning"
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
                  {!mockTests.some(mock => submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString())) && (
                    <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                      <Typography variant="h6" color={textSecondary}>You haven't attempted any mocks yet</Typography>
                      <Button variant="contained" color="primary" sx={{ mt: 2, borderRadius: 4, px: 3 }} onClick={() => setTabIndex(1)}>Start a Mock Test</Button>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" color={textPrimary}>Manage Mock Tests</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreateMock} sx={{ borderRadius: 2 }}>Create New Mock</Button>
              </Box>
              <Stack spacing={2}>
                {mockTests.map((mock, index) => (
                  <Card key={index} sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                        <Typography variant="body2" color={textSecondary} sx={{ mt: 1 }}>{mock.description}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Chip label={mock.category} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }} />
                          <Chip label={`${mock.questions.length} Questions`} size="small" variant="outlined" />
                          <Chip label={`Created: ${new Date(mock.createdAt || Date.now()).toLocaleDateString()}`} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={() => handleEditMock(mock._id)} sx={{ borderRadius: 2 }}>Edit</Button>
                        <Button variant="contained" color="error" sx={{ borderRadius: 2 }}>Delete</Button>
                      </Stack>
                    </Box>
                  </Card>
                ))}
                {mockTests.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                    <Typography variant="h6" color={textSecondary}>No mock tests created yet</Typography>
                    <Button variant="contained" color="primary" startIcon={<Add />} sx={{ mt: 2, borderRadius: 4, px: 3 }} onClick={handleCreateMock}>Create First Mock Test</Button>
                  </Box>
                )}
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mt: 3, mb: 2, color: textPrimary }}>Your Purchased Mock Exams</Typography>
              <Stack spacing={2}>
                {purchasedTests.map((mock, index) => {
                  const accuracy = getMockAccuracy(mock.id);
                  const submission = submissions.find(sub => sub.mock_test_id.toString() === mock.id.toString());
                  const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                            <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Chip label={`${mock.category}`} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }} />
                              <Chip label={`${mock.questions.length} Questions`} size="small" variant="outlined" />
                              <Chip
                                label={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? 'Attempted' : 'Not Attempted'}
                                size="small"
                                color={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? "success" : "default"}
                                variant={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? "filled" : "outlined"}
                              />
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            {submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? (
                              <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mock.id)}>
                                Review Test
                              </Button>
                            ) : (
                              <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mock.id}`)}>
                                Take Test
                              </Button>
                            )}
                            {submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) && (
                              <Button variant="outlined" sx={{ borderRadius: 4, px: 3 }} onClick={() => navigate(`/results/${mock.id}`)}>
                                View Results ({accuracy}%)
                              </Button>
                            )}
                            {accuracy >= 80 && (
                              <Button
                                variant="contained"
                                color="success"
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
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                    <Typography variant="h6" color={textSecondary}>No purchased mock tests available</Typography>
                    <Typography variant="body2" color={textSecondary} sx={{ mt: 1 }}>
                      You haven't purchased any mock tests yet. Visit the store to buy some!
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
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
                <Typography variant="h5" fontWeight="bold" color={textPrimary}>User Management</Typography>
                <Button variant="contained" onClick={handleViewUsers} sx={{ borderRadius: 2 }}>View All Users</Button>
              </Box>
              <TableContainer component={Paper} sx={{ boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>User</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>Email</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>Role</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>Tests Taken</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>Last Login</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold" color={textPrimary}>Actions</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userStats.slice(0, 10).map((user, index) => (
                      <TableRow key={index} sx={{ '&:hover': { bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' } }}>
                        <TableCell sx={{ color: textPrimary }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{user.name.charAt(0)}</Avatar>
                            {user.name}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: textPrimary }}>{user.email}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{user.role || 'user'}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{user.testsTaken || 0}</TableCell>
                        <TableCell sx={{ color: textPrimary }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Edit</Button>
                            <Button size="small" variant="outlined" color="error" sx={{ borderRadius: 2 }}>Delete</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {userStats.length === 0 && (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ color: textSecondary }}>No users found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mt: 3, mb: 2, color: textPrimary }}>Free TechMocks</Typography>
              <Stack spacing={2}>
                {(() => {
                  const freeMockTests = mockTests.filter(mock => mock.pricing_type === 'free');
                  console.log('Free mock tests:', freeMockTests);
                  return freeMockTests.map((mock, index) => {
                    const accuracy = getMockAccuracy(mock.id);
                    const submission = submissions.find(sub => sub.mock_test_id.toString() === mock.id.toString());
                    const answeredCount = submission ? Object.keys(submission.answers || {}).length : 0;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.01, boxShadow: darkMode ? '0 6px 12px rgba(255,255,255,0.05)' : '0 6px 12px rgba(0,0,0,0.08)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: theme.palette.background.default }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold" color={textPrimary}>{mock.title}</Typography>
                              <Typography variant="body2" color={textSecondary} sx={{ mt: 1, mb: 2 }}>{mock.description}</Typography>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Chip label={`${mock.category}`} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }} />
                                <Chip label={`${mock.questions.length} Questions`} size="small" variant="outlined" />
                                <Chip
                                  label="FREE"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                />
                                <Chip
                                  label={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? 'Attempted' : 'Not Attempted'}
                                  size="small"
                                  color={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? "primary" : "default"}
                                  variant={submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? "filled" : "outlined"}
                                />
                              </Box>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              {submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) ? (
                                <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => handleReviewMock(mock.id)}>
                                  Review Test
                                </Button>
                              ) : (
                                <Button variant="contained" sx={{ borderRadius: 4 }} onClick={() => navigate(`/mock-test/${mock.id}`)}>
                                  Take Test
                                </Button>
                              )}
                              {submissions.some(sub => sub.mock_test_id.toString() === mock.id.toString()) && (
                                <Button variant="outlined" sx={{ borderRadius: 4, px: 3 }} onClick={() => navigate(`/results/${mock.id}`)}>
                                  View Results ({accuracy}%)
                                </Button>
                              )}
                              {accuracy >= 80 && (
                                <Button
                                  variant="contained"
                                  color="success"
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
                {!mockTests.some(mock => mock.pricing_type === 'free') && (
                  <Box sx={{ textAlign: 'center', py: 5, bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: 2 }}>
                    <Typography variant="h6" color={textSecondary}>No free mock tests available</Typography>
                    <Typography variant="body2" color={textSecondary} sx={{ mt: 1 }}>Please check back later for new free mock tests</Typography>
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