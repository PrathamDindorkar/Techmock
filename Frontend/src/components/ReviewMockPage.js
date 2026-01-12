import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import InfoIcon from '@mui/icons-material/Info';

const ReviewMockPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
  }, [id, token, backendUrl]);

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

  // Logic: Filter ONLY wrong questions
  const wrongQuestions = [];
  let correctCount = 0;

  test.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index.toString()];
    
    // Normalize comparison to match backend logic
    const isCorrect = userAnswer && 
      userAnswer.toString().trim().toLowerCase() === question.correctAnswer.toString().trim().toLowerCase();

    if (isCorrect) {
      correctCount++;
    } else {
      wrongQuestions.push({ question, index, userAnswer });
    }
  });

  const totalQuestions = test.questions.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

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
            Your Score: {correctCount} / {totalQuestions} ({percentage}%)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {wrongQuestions.length === 0 
              ? "Perfect! You answered everything correctly 🎉" 
              : `Reviewing ${wrongQuestions.length} incorrect response${wrongQuestions.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </motion.div>

      {wrongQuestions.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9', borderRadius: '12px' }}>
          <Typography variant="h6" color="success.main" gutterBottom>
            Excellent Work!
          </Typography>
          <Typography color="text.secondary">
            You've mastered this test. No mistakes found.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
            Questions You Got Wrong!
          </Typography>

          {wrongQuestions.map(({ question, index, userAnswer }) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 4,
                  border: '1px solid #ffcdd2',
                  bgcolor: theme.palette.background.default,
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" color="error.main" gutterBottom>
                  Question {index + 1}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                  {question.questionText}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#ffebee', borderRadius: '8px' }}>
                    <Typography variant="caption" color="error.dark" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                      Your Answer
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                      {userAnswer || 'Not Attempted'}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: '8px' }}>
                    <Typography variant="caption" color="success.dark" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                      Correct Answer
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* EXPLANATION SECTION */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <InfoIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" color="primary.main" fontWeight="bold">
                      Explanation:
                    </Typography>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {question.explaination || "No specific explanation provided for this question."}
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
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => navigate('/hello')}
          sx={{ minWidth: 200, borderRadius: '8px', textTransform: 'none' }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ReviewMockPage;