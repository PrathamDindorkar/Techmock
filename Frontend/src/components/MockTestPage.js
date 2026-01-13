import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Timer,
  ArrowBack,
  ArrowForward,
  Check,
  Home,
  Help,
  AssignmentTurnedIn,
  School,
  QuestionMark,
  Warning,
  Send
} from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_ALLOWED_SWITCHES = 3;
const WARNING_SWITCH_COUNT = 2;

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } }
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.03, boxShadow: "0px 8px 25px rgba(0,0,0,0.15)", transition: { duration: 0.2 } }
};

const MockTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  // Anti-cheat states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [autoSubmitReason, setAutoSubmitReason] = useState(null);

  const lastBlurTime = useRef(Date.now());

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Auth check
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Fetch test
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/mock-test/${id}`, {
          headers: { Authorization: token },
        });
        setTest(data);
        setTimeLeft((data.time_limit || 10) * 60);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load test. Please try again.');
        setLoading(false);
      }
    };
    if (token) fetchTest();
  }, [id, token, backendUrl]);

  // Fullscreen handling
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(console.warn);
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Tab switch / app minimize detection
  useEffect(() => {
    if (submitted || !test) return;

    const detectSwitch = () => {
      const now = Date.now();
      const timeSinceLastBlur = now - lastBlurTime.current;

      if (document.hidden || timeSinceLastBlur > 800) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;

          if (newCount === WARNING_SWITCH_COUNT) {
            setShowWarningDialog(true);
          }

          if (newCount >= MAX_ALLOWED_SWITCHES) {
            handleAutoSubmit('Multiple tab/app switches detected');
          }

          return newCount;
        });
      }

      lastBlurTime.current = now;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) detectSwitch();
    };

    const handleBlur = () => {
      lastBlurTime.current = Date.now();
      detectSwitch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', detectSwitch);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', detectSwitch);
    };
  }, [submitted, test]);

  const handleAutoSubmit = async (reason) => {
    if (submitted) return;

    setAutoSubmitReason(reason);
    console.log('Auto-submitting test. Reason:', reason);
    console.log('Answers being submitted:', answers);
    
    try {
      const res = await axios.post(
        `${backendUrl}/api/mock-test/${id}/submit`,
        {
          answers,
          autoSubmitted: true,
          reason
        },
        { headers: { Authorization: token } }
      );
      console.log('Auto-submit response:', res.data);
      setScore(res.data.score);
      setSubmitted(true);
    } catch (err) {
      console.error('Auto-submit failed:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(`Auto-submit failed: ${errorMsg}`);
      
      // Still mark as submitted to prevent further attempts
      setSubmitted(true);
    }
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit('Time expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (test && timeLeft < (test.time_limit || 10) * 60 * 0.2) {
      setTimeWarning(true);
    }

    return () => clearInterval(interval);
  }, [timeLeft, submitted, test]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qIndex, value) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (test?.questions?.length - 1 || 0))
      setCurrentQuestion(currentQuestion + 1);
  };

  const openConfirmDialog = () => setConfirmDialog(true);

  const handleSubmit = async () => {
    setConfirmDialog(false);
    console.log('Submitting test manually');
    console.log('Answers being submitted:', answers);
    
    try {
      const res = await axios.post(
        `${backendUrl}/api/mock-test/${id}/submit`,
        { answers, autoSubmitted: false },
        { headers: { Authorization: token } }
      );
      console.log('Submit response:', res.data);
      setScore(res.data.score);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      const errorDetails = err.response?.data?.details;
      
      setError(`Failed to submit test: ${errorMsg}${errorDetails ? '\n' + errorDetails : ''}`);
    }
  };

  const handleQuestionClick = (index) => setCurrentQuestion(index);

  const progress = test ? (Object.keys(answers).length / test.questions.length) * 100 : 0;
  const timeProgress = test && timeLeft ? (timeLeft / ((test.time_limit || 10) * 60)) * 100 : 100;

  if (loading) {
    return (
      <Container sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center">
          <School fontSize="large" color="primary" />
          <Typography variant="h5" mt={2}>Loading Test...</Typography>
          <LinearProgress sx={{ mt: 3, width: 300 }} />
        </Box>
      </Container>
    );
  }

  if (error && !test) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!test) return null;

  if (!isFullscreen && !submitted) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', p: 4 }}>
        <Warning sx={{ fontSize: 90, color: 'error.main', mb: 3 }} />
        <Typography variant="h4" color="error" gutterBottom>
          Fullscreen Required
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 600, mb: 5 }}>
          This test must be taken in fullscreen mode for security reasons.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={enterFullscreen}
          sx={{ px: 6, py: 2 }}
        >
          Enter Fullscreen & Start
        </Button>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card elevation={4} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{
              p: 2,
              backgroundColor: autoSubmitReason ? 'warning.main' : 'success.main',
              color: 'white',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {autoSubmitReason ? 'Test Auto-Submitted' : 'Test Completed!'}
              </Typography>
            </Box>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {autoSubmitReason && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Automatic Submission</AlertTitle>
                  Reason: {autoSubmitReason}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <AssignmentTurnedIn sx={{ fontSize: 80, color: autoSubmitReason ? 'warning.main' : 'success.main' }} />
              </Box>
              
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                To View Your Score, Visit the Dashboard
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                Your answers have been submitted successfully. Check your dashboard for detailed results and performance analysis.
              </Typography>

              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Home />}
                onClick={() => navigate('/dashboard')}
                sx={{ px: 4, mr: 2 }}
              >
                Go to Dashboard
              </Button>

              <Button
                component={motion.button}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/hello')}
                sx={{ px: 4 }}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <>
      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onClose={() => setShowWarningDialog(false)}>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 1.5 }} />
          Warning: Tab Switching Detected
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have switched tabs or applications <strong>{tabSwitchCount}</strong> time(s).<br />
            You are allowed only <strong>{MAX_ALLOWED_SWITCHES}</strong> switches in total.<br /><br />
            <strong>One more switch will automatically submit your test!</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarningDialog(false)} variant="contained" color="primary">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Submit Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Submit Test?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your test? You have answered{' '}
            <strong>{Object.keys(answers).length}</strong> out of{' '}
            <strong>{test.questions.length}</strong> questions.
            <br /><br />
            Once submitted, you cannot change your answers.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="success" startIcon={<Send />}>
            Submit Test
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Test Header */}
        <Paper
          elevation={3}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            color: 'white'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                {test.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                {test.description}
              </Typography>
              <Chip
                icon={<School />}
                label={`${test.questions.length} Questions`}
                sx={{ mr: 1, mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                p: 2,
                borderRadius: '8px',
                backgroundColor: timeWarning ? 'error.dark' : 'rgba(255,255,255,0.2)',
                animation: timeWarning ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' }
                }
              }}>
                <Timer sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={timeProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: timeWarning ? 'error.light' : 'success.light'
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Progress Indicators */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Your Progress: {Math.round(progress)}% Complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="body2">
                Question {currentQuestion + 1} of {test.questions.length}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Question Navigation */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '8px',
            backgroundColor: '#f5f7fa',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <Grid container spacing={1}>
            {test.questions.map((_, index) => (
              <Grid item key={index}>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title={answers[index] ? "Answered" : "Unanswered"}>
                    <Button
                      variant={currentQuestion === index ? "contained" : "outlined"}
                      color={answers[index] ? "success" : "primary"}
                      onClick={() => handleQuestionClick(index)}
                      sx={{
                        minWidth: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        boxShadow: currentQuestion === index ? 3 : 0
                      }}
                    >
                      {answers[index] ? <Check fontSize="small" /> : index + 1}
                    </Button>
                  </Tooltip>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              component={motion.div}
              variants={cardVariants}
              whileHover="hover"
              elevation={4}
              sx={{
                mb: 4,
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <Box sx={{
                p: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <QuestionMark fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  Question {currentQuestion + 1}
                </Typography>
              </Box>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                  {test.questions[currentQuestion].questionText}
                </Typography>
                <RadioGroup
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                >
                  {test.questions[currentQuestion].options.map((option, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Paper
                        elevation={answers[currentQuestion] === option ? 3 : 0}
                        sx={{
                          mb: 2,
                          p: 1,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: answers[currentQuestion] === option ? 'primary.main' : 'divider',
                          backgroundColor: answers[currentQuestion] === option ? 'primary.light' : 'background.paper',
                          color: answers[currentQuestion] === option ? 'primary.contrastText' : 'text.primary',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <FormControlLabel
                          value={option}
                          control={<Radio color="primary" />}
                          label={option}
                          sx={{
                            width: '100%',
                            m: 0,
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      </Paper>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Button
            component={motion.button}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
            sx={{ px: 3 }}
          >
            Previous
          </Button>

          {currentQuestion === test.questions.length - 1 ? (
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="contained"
              color="success"
              size="large"
              startIcon={<Send />}
              onClick={openConfirmDialog}
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              Submit Test
            </Button>
          ) : (
            <Button
              component={motion.button}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={handleNextQuestion}
              sx={{ px: 3 }}
            >
              Next
            </Button>
          )}
        </Box>
      </Container>
    </>
  );
};

export default MockTestPage;