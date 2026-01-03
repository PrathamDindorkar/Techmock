import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Fade,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ReviewMockPage = () => {
 const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        const testResponse = await axios.get(`${backendUrl}/api/mock-test/${id}`, {
          headers: { Authorization: token },
        });
        setTest(testResponse.data);

        const submissionResponse = await axios.get(`${backendUrl}/api/mock-test/${id}/submission`, {
          headers: { Authorization: token },
        });
        setSubmission(submissionResponse.data);
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewData();
  }, [id, token]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} sx={{ color: '#1976d2' }} />
      </Container>
    );
  }

  if (!test || !submission) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Unable to load test review data
        </Typography>
      </Container>
    );
  }

  const userAnswers = submission.answers || {};

  // Calculate score & collect only wrong questions
  const wrongQuestions = [];
  let correctCount = 0;

  test.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index.toString()];
    const isCorrect = userAnswer && 
      userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase();

    if (isCorrect) {
      correctCount++;
    } else {
      wrongQuestions.push({ question, index, userAnswer });
    }
  });

  const totalQuestions = test.questions.length;
  const score = correctCount;
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
          Review: {test.title}
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h5" color="primary" gutterBottom>
            Your Score: {score} / {totalQuestions} ({percentage}%)
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {wrongQuestions.length === 0 
              ? "Perfect! You answered everything correctly 🎉" 
              : `You got ${wrongQuestions.length} question${wrongQuestions.length !== 1 ? 's' : ''} wrong`}
          </Typography>
        </Box>
      </motion.div>

      {wrongQuestions.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}
        >
          <Typography variant="h6" color="success.main" gutterBottom>
            Congratulations! No mistakes this time.
          </Typography>
          <Typography color="text.secondary">
            Keep up the great work!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#d32f2f' }}>
            Questions You Got Wrong:
          </Typography>

          {wrongQuestions.map(({ question, index, userAnswer }) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 3,
                  borderLeft: '6px solid #d32f2f',
                  bgcolor: '#fff5f5',
                  borderRadius: '8px',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Question {index + 1}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {question.questionText}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Your answer:</strong>
                    </Typography>
                    <Typography color="error.main">
                      {userAnswer || '— not answered —'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Correct answer:</strong>
                    </Typography>
                    <Typography color="success.main" fontWeight="medium">
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          ))}
        </Box>
      )}

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/hello')}
          sx={{ minWidth: 200, py: 1.5 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ReviewMockPage;