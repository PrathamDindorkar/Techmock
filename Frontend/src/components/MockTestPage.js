import React, { useState, useEffect } from 'react';
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
  Divider, 
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
  QuestionMark 
} from '@mui/icons-material';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
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

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } }
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
  
  // Calculate progress
  const progress = test ? Object.keys(answers).length / test.questions.length * 100 : 0;
  const timeProgress = test && timeLeft ? (timeLeft / (test.timeLimit * 60)) * 100 : 100;

  // Check authentication
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch test data
  useEffect(() => {
  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/mock-test/${id}`, {
        headers: { Authorization: token },
      });
      const testData = response.data;
      setTest(testData);
      setTimeLeft(testData.time_limit ? testData.time_limit * 60 : 600);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching test:', error);
      setError('Failed to load the test. Please try again.');
      setLoading(false);
    }
  };
  
  if (token) {
    fetchTest();
  }
}, [id, token]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      
      // Set warning when less than 20% time remains
      if (test && timeLeft < test.timeLimit * 60 * 0.2) {
        setTimeWarning(true);
      }
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted, test]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Open confirmation dialog before submitting
  const openConfirmDialog = () => {
    setConfirmDialog(true);
  };

  // Submit test answers
  const handleSubmit = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      setConfirmDialog(false);
      const response = await axios.post(
        `http://localhost:5000/api/mock-test/${id}/submit`,
        { answers },
        { headers: { Authorization: token } }
      );
      
      setScore(response.data.score || 0);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Failed to submit the test. Please try again.');
    }
  };

  // Handle question navigation
  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ width: '300px', textAlign: 'center', mb: 4 }}>
            <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>Loading Your Test</Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </Box>
        </motion.div>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/hello')}
            startIcon={<Home />}
          >
            Back to Home
          </Button>
        </motion.div>
      </Container>
    );
  }

  // If no test data is available
  if (!test || timeLeft === null) return null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <Container maxWidth="md" sx={{ py: 4 }}>
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
        {!submitted ? (
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
        ) : (
          // Results Section
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card elevation={4} sx={{ mb: 4, borderRadius: '12px', overflow: 'hidden' }}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'success.main', 
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Test Completed!
                </Typography>
              </Box>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <AssignmentTurnedIn sx={{ fontSize: 80, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" sx={{ mb: 2, color: 'success.main', fontWeight: 700 }}>
                  Your Score: {score !== null ? score : '...'}%
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You've successfully completed the test. Thank you for your participation!
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
                  onClick={() => navigate('/hello')}
                  sx={{ px: 4 }}
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation and Submit Controls */}
        {!submitted && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
            </motion.div>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentQuestion < test.questions.length - 1 ? (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleNextQuestion}
                  >
                    Next
                  </Button>
                </motion.div>
              ) : (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="contained"
                    color="success"
                    endIcon={<AssignmentTurnedIn />}
                    onClick={openConfirmDialog}
                  >
                    Submit Test
                  </Button>
                </motion.div>
              )}
              
              <Tooltip title="Get help">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ minWidth: '48px', width: '48px', p: 0 }}
                  >
                    <Help />
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Box>
        )}
        
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog}
          onClose={() => setConfirmDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Submit your test?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You've answered {Object.keys(answers).length} out of {test.questions.length} questions. 
              {Object.keys(answers).length < test.questions.length && 
                ` There are ${test.questions.length - Object.keys(answers).length} unanswered questions.`}
              <br /><br />
              Are you sure you want to submit your test now? You won't be able to change your answers after submission.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)} color="primary">
              Continue Working
            </Button>
            <Button onClick={handleSubmit} color="error" autoFocus>
              Submit Now
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default MockTestPage;