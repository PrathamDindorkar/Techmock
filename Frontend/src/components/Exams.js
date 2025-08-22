import React, { useEffect, useState } from 'react';
import { Stack, Card, CardContent, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Exams = () => {
  const navigate = useNavigate();
  const [mockTests, setMockTests] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/mock-tests', {
          headers: { Authorization: token },
        });
        setMockTests(response.data);
      } catch (error) {
        console.error('Error fetching mock tests:', error);
      }
    };

    fetchMockTests();
  }, [token]);

  const startTest = (id) => {
    navigate(`/mock-test/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        All Mock Tests
      </Typography>

      <Stack spacing={2} justifyContent="center" alignItems="center">
        {mockTests.map((mock) => (
          <Card
            key={mock._id}
            variant="outlined"
            onClick={() => startTest(mock._id)}
            sx={{
              width: '80%',
              transition: '0.3s',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
              },
              cursor: 'pointer',
              backgroundColor: 'background.paper',
            }}
          >
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                {mock.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {mock.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Exams;
