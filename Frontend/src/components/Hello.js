import React, { useEffect, useState } from 'react';
import { Stack, Card, CardContent, Typography, Box, Button, Tabs, Tab, Avatar, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
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
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Get current date and generate certificate ID
  const currentDate = new Date();
  const date = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const certificateId = `HR-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  // HackerRank color scheme
  const colors = {
    primary: [0, 184, 169],      // HackerRank teal/green
    secondary: [39, 79, 74],     // Dark green
    text: [52, 73, 94],          // Dark blue-gray
    lightText: [127, 140, 141],  // Light gray
    background: [255, 255, 255], // White
    accent: [241, 196, 15]       // Golden yellow for badges
  };

  // White background
  doc.setFillColor(...colors.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Top header section with colored background
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // HackerRank logo text (since we can't embed actual logo)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('HackerRank', 25, 25);

  // Certificate of Achievement text in header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('Certificate of Achievement', pageWidth - 25, 25, { align: 'right' });

  // Main content area
  // "This is to certify that" text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...colors.text);
  doc.text('This is to certify that', pageWidth / 2, 70, { align: 'center' });

  // Recipient name (large, bold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...colors.secondary);
  doc.text(userName || 'Recipient Name', pageWidth / 2, 95, { align: 'center' });

  // Underline for name
  doc.setLineWidth(0.8);
  doc.setDrawColor(...colors.primary);
  const nameWidth = doc.getTextWidth(userName || 'Recipient Name') * 1.1;
  doc.line((pageWidth - nameWidth) / 2, 100, (pageWidth + nameWidth) / 2, 100);

  // "has successfully completed" text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...colors.text);
  doc.text('has successfully completed the', pageWidth / 2, 120, { align: 'center' });

  // Course/Test name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...colors.secondary);
  doc.text(mockTitle || 'Skills Verification Test', pageWidth / 2, 140, { align: 'center' });

  // Score section
  if (accuracy !== undefined && accuracy !== null) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.text('with a score of', pageWidth / 2, 160, { align: 'center' });
    
    // Score badge
    doc.setFillColor(...colors.accent);
    doc.roundedRect(pageWidth / 2 - 20, 165, 40, 15, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`${accuracy}%`, pageWidth / 2, 175, { align: 'center' });
  }

  // Date section
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...colors.text);
  doc.text(`Completed on ${date}`, pageWidth / 2, 200, { align: 'center' });

  // Certificate ID
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.lightText);
  doc.text(`Certificate ID: ${certificateId}`, pageWidth / 2, 210, { align: 'center' });

  // Verification URL (placeholder)
  doc.text('Verify at: www.hackerrank.com/certificates/verify', pageWidth / 2, 220, { align: 'center' });

  // Bottom section with signatures
  const leftX = 60;
  const rightX = pageWidth - 60;
  const sigY = pageHeight - 40;

  // Left signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...colors.text);
  doc.text('Vivek Ravisankar', leftX, sigY, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(...colors.lightText);
  doc.text('Co-founder & CEO', leftX, sigY + 8, { align: 'center' });

  // Right signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...colors.text);
  doc.text('Hari Karunanidhi', rightX, sigY, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(...colors.lightText);
  doc.text('Co-founder & CTO', rightX, sigY + 8, { align: 'center' });

  // Side decorative elements
  // Left side accent
  doc.setFillColor(...colors.primary);
  doc.rect(0, 50, 5, 120, 'F');

  // Right side accent
  doc.rect(pageWidth - 5, 50, 5, 120, 'F');

  // Skills badge (if high score)
  if (accuracy && accuracy >= 80) {
    // Badge background
    doc.setFillColor(...colors.primary);
    doc.circle(pageWidth - 40, 60, 25, 'F');
    
    // Badge inner circle
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth - 40, 60, 20, 'F');
    
    // Badge text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.primary);
    doc.text('VERIFIED', pageWidth - 40, 55, { align: 'center' });
    doc.text('SKILLS', pageWidth - 40, 63, { align: 'center' });
  }

  // Footer with HackerRank branding
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.lightText);
  doc.text('HackerRank - Technical Skills Assessment Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Subtle border
  doc.setLineWidth(0.5);
  doc.setDrawColor(...colors.primary);
  doc.rect(10, 45, pageWidth - 20, pageHeight - 60, 'S');

  // Generate filename and save
  const cleanTitle = (mockTitle || 'Assessment').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanName = (userName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `HackerRank_Certificate_${cleanTitle}_${cleanName}_${currentDate.getFullYear()}.pdf`;
  
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
        bgcolor: bgColor,
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

      <Box sx={{ bgcolor: cardBgColor, borderRadius: 2, mb: 3, boxShadow: `0 2px 4px ${borderColor}` }}>
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
                  <Card sx={{ flex: '1 1 300px', p: 3, borderRadius: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.05)', bgcolor: cardBgColor }}>
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
                            bgcolor: cardBgColor,
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
                      <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
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
                        <Card sx={{ p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${borderColor}`, bgcolor: cardBgColor }}>
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