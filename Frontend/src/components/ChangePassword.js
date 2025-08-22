import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ChangePassword = ({ darkMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem('token');

  const bgColor = darkMode ? '#121212' : '#f8f9fa';
  const cardBgColor = darkMode ? '#1e1e1e' : 'white';
  const textPrimary = darkMode ? '#ffffff' : 'text.primary';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/user/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        { headers: { Authorization: token } }
      );
      setSuccess('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate('/profile'), 2000); // Redirect to profile after 2 seconds
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 3,
        bgcolor: bgColor,
        color: textPrimary,
        minHeight: '90vh',
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: textPrimary }}>
          Change Password
        </Typography>

        <Box sx={{ bgcolor: cardBgColor, p: 3, borderRadius: 2, boxShadow: `0 2px 4px ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}` }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          {success && <Typography color="success.main" sx={{ mb: 2 }}>{success}</Typography>}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
              />
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
              />
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                variant="outlined"
                fullWidth
                sx={{ bgcolor: darkMode ? '#333' : '#fff' }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Stack>
          </form>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ChangePassword;