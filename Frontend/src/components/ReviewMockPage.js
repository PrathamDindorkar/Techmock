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
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);

        const [testRes, submissionRes] = await Promise.all([
          axios.get(`${backendUrl}/api/mock-test/${id}`, {
            headers: { Authorization: token },
          }),
          axios.get(`${backendUrl}/api/mock-test/${id}/submission`, {
            headers: { Authorization: token },
          }),
        ]);

        setTest(testRes.data);
        setSubmission(submissionRes.data);
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchReviewData();
  }, [id, token, backendUrl]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!test || !submission) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          Unable to load review data. Please try again later.
        </Typography>
      </Container>
    );
  }

  const userAnswers = submission.answers || {};

  // Only collect questions that were attempted AND answered WRONG
  const wrongAttemptedQuestions = [];

  let correctCount = 0;
  let attemptedCount = 0;

  // test.questions comes from the JSONB column in your mock_tests table
  test.questions.forEach((question, index) => {
    const userAnswer = userAnswers[index.toString()];

    // Skip if not attempted
    if (userAnswer === undefined || userAnswer === null || userAnswer === "") return;

    attemptedCount++;

    const isCorrect =
      String(userAnswer).trim().toLowerCase() ===
      String(question.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      correctCount++;
    } else {
      wrongAttemptedQuestions.push({
        question,
        index,
        userAnswer,
      });
    }
  });

  const totalQuestions = test.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Review: {test.title}
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 5,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9fd 100%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" color="primary.dark" gutterBottom>
            Score: {correctCount} / {totalQuestions} ({percentage}%)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Attempted: {attemptedCount} • Correct: {correctCount} • Wrong: {wrongAttemptedQuestions.length}
          </Typography>
        </Paper>
      </motion.div>

      {wrongAttemptedQuestions.length === 0 ? (
        <Paper
          elevation={4}
          sx={{
            p: 5,
            textAlign: 'center',
            bgcolor: '#e8f5e9',
            borderRadius: '16px',
            border: '2px dashed #81c784',
          }}
        >
          <Typography variant="h5" color="success.dark" gutterBottom>
            Great Job! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You didn't get any questions wrong among the ones you attempted!
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              mb: 4,
              color: 'error.main',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            Questions You Got Wrong
          </Typography>

          {wrongAttemptedQuestions.map(({ question, index, userAnswer }) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Paper
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: '12px',
                  border: '1px solid #ffcccb',
                  bgcolor: '#fff8f8',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" color="error.dark" gutterBottom>
                  Question {index + 1}
                </Typography>

                <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                  {question.questionText}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: '10px', border: '1px solid #ef9a9a' }}>
                    <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                      YOUR ANSWER
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {userAnswer}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: '10px', border: '1px solid #a5d6a7' }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                      CORRECT ANSWER
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {question.correctAnswer}
                    </Typography>
                  </Box>
                </Box>

                {/* This section displays the explanation from the JSONB questions column */}
                {(question.explaination || question.explanation) && (
                  <>
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', bgcolor: '#f0f7ff', p: 2, borderRadius: '8px' }}>
                      <InfoIcon color="primary" fontSize="small" sx={{ mt: 0.4 }} />
                      <Box>
                        <Typography variant="subtitle2" color="primary.main" fontWeight="bold" gutterBottom>
                          Explanation:
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          {question.explaination || question.explanation}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </motion.div>
          ))}
        </>
      )}

      <Box sx={{ textAlign: 'center', mt: 7 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/hello')}
          sx={{ minWidth: 220, py: 1.5, borderRadius: '12px' }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ReviewMockPage;