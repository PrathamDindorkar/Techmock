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

  if (!test || !submission) return null;

  const userAnswers = submission.answers || {};
  const score = test.questions.reduce(
    (acc, q, idx) => acc + (userAnswers[idx.toString()] === q.correctAnswer ? 1 : 0),
    0
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Review: {test.title}
        </Typography>
        <Typography variant="h6" align="center" sx={{ color: '#555', mb: 3 }}>
          Your Score: {score} / {test.questions.length}
        </Typography>
      </motion.div>

      {/* Questions Review */}
      <Box sx={{ mt: 4 }}>
        {test.questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '12px',
                background: userAnswers[index.toString()] === question.correctAnswer ? '#d4edd6ff' : '#ddbcc1ff',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1 }}>
                Q{index + 1}: {question.questionText}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Your Answer:</strong> {userAnswers[index.toString()] || 'Not answered'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Correct Answer:</strong> {question.correctAnswer}
              </Typography>
              <Chip
                icon={
                  userAnswers[index.toString()] === question.correctAnswer ? (
                    <CheckCircleIcon />
                  ) : (
                    <CancelIcon />
                  )
                }
                label={userAnswers[index.toString()] === question.correctAnswer ? 'Correct' : 'Incorrect'}
                color={userAnswers[index.toString()] === question.correctAnswer ? 'success' : 'error'}
                sx={{ fontWeight: 'bold' }}
              />
            </Paper>
          </motion.div>
        ))}
      </Box>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/hello')}
          sx={{
            mt: 4,
            display: 'block',
            mx: 'auto',
            px: 4,
            py: 1.5,
            borderRadius: '30px',
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)' },
          }}
        >
          Back to Home
        </Button>
      </motion.div>
    </Container>
  );
};

export default ReviewMockPage;