import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Container } from '@mui/material';

const AdminPortal = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/add-mock-test',
        { title, description, questions },
        { headers: { Authorization: token } }
      );
      alert('Mock test added successfully!');
    } catch (error) {
      console.error('Error adding mock test', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" sx={{ marginTop: 3 }}>
        Admin Portal - Add Mock Test
      </Typography>
      <Box sx={{ mt: 4 }}>
        <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mt: 2 }} />

        {questions.map((q, qIndex) => (
          <Box key={qIndex} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label={`Question ${qIndex + 1}`}
              value={q.questionText}
              onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
            />
            {q.options.map((option, oIndex) => (
              <TextField
                key={oIndex}
                fullWidth
                label={`Option ${oIndex + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                sx={{ mt: 1 }}
              />
            ))}
            <TextField
              fullWidth
              label="Correct Answer"
              value={q.correctAnswer}
              onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        ))}
        <Button variant="contained" onClick={addQuestion} sx={{ mt: 2 }}>
          Add Question
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default AdminPortal;
