import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const Footer = () => {
  const theme = useTheme();

  return (
    <>
      <Divider sx={{ mt: 10 }} /> {/* Optional subtle separator before footer */}

      <Box
        component={motion.footer}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        sx={{
          backgroundColor: 'background.paper', // Flat, matches page background or use 'transparent' if needed
          color: 'text.secondary',
          py: { xs: 4, md: 6 },
          mt: 'auto', // Helps push footer to bottom if using flex on parent
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
              gap: 4,
              alignItems: 'start',
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {/* Brand & Description */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  background: '-webkit-linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TechMocks
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Empowering tech professionals with industry-leading practice exams and personalized learning paths.
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'warning.main' }}>
                Disclaimer: TechMocks certifications are generated based on your scores purely for motivational purposes. Our platform is designed solely for exam and interview preparations. We do not promise or guarantee any specific outcomes, such as 100% pass rates, passing real certifications, or securing jobs. Results depend on individual effort.
              </Typography>
            </Box>

            {/* Connect Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'center', md: 'start' } }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Connect
              </Typography>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@techmocks.com"
                target="_blank"
                rel="noopener"
                color="inherit"
                underline="hover"
              >
                Email Us
              </Link>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="https://github.com/PrathamDindorkar"
                target="_blank"
                rel="noopener"
                color="inherit"
                underline="hover"
              >
                GitHub
              </Link>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="https://www.linkedin.com/in/pratham-d-22b53b1ab/"
                target="_blank"
                rel="noopener"
                color="inherit"
                underline="hover"
              >
                LinkedIn
              </Link>
            </Box>

            {/* Legal Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: { xs: 'center', md: 'start' } }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Legal
              </Typography>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="/Privacy Policy.pdf"
                color="inherit"
                underline="hover"
                target="_blank"
              >
                Privacy Policy
              </Link>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="/Terms of Service.pdf"
                color="inherit"
                underline="hover"
                target="_blank"
              >
                Terms & Conditions
              </Link>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="https://mail.google.com/mail/?view=cm&fs=1&to=techmock972@gmail.com"
                color="inherit"
                underline="hover"
              >
                Contact Us
              </Link>
            </Box>
          </Box>

          {/* Bottom copyright bar */}
          <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} TechMock. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Footer;