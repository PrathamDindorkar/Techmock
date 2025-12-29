import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  IconButton,
  Stack,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ArrowDownward,
  School,
  WorkOutline,
  TrendingUp,
  Speed,
  EmojiEvents,
  Analytics
} from "@mui/icons-material";
import { motion, useScroll, useTransform } from "framer-motion";

const Landing = ({ toggleColorMode }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const benefits = [
    {
      icon: <School fontSize="large" />,
      title: "Industry-Relevant Content",
      description: "Curated by experts to match real certification exams and interviews.",
      color: "#00d4ff"
    },
    {
      icon: <Analytics fontSize="large" />,
      title: "Performance Analytics",
      description: "Track progress with detailed analytics and personalized insights.",
      color: "#4ecdc4"
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: "Earn Certifications",
      description: "Motivational certificates based on your mock exam scores.",
      color: "#ffd93d"
    },
  ];

  const glassStyle = {
    background: isDarkMode 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`,
    boxShadow: isDarkMode 
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  };

  return (
    <Box sx={{
      bgcolor: 'transparent',
      color: theme.palette.text.primary,
      overflow: "hidden",
      position: "relative",
      minHeight: "100vh"
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          pt: 8
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "5rem" },
                fontWeight: 900,
                mb: 3,
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Master Your Tech Journey
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Typography
              variant="h5"
              sx={{ 
                maxWidth: "760px", 
                mx: "auto", 
                mb: 5, 
                fontWeight: 400,
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
              }}
            >
              Realistic mock exams for AWS, Azure, Opentext VIM, SAP, CompTIA, and more. 
              Practice with confidence and ace your certifications.
            </Typography>
          </motion.div>

          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center">
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  sx={{
                    px: 5, 
                    py: 2, 
                    fontSize: "1.1rem",
                    background: "linear-gradient(135deg, #00d4ff 0%, #0077b6 100%)",
                    borderRadius: "50px",
                    boxShadow: "0 10px 30px rgba(0, 212, 255, 0.3)",
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Start Free Trial • No Credit Card
                </Button>

                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 5, 
                    py: 2, 
                    fontSize: "1.1rem",
                    borderRadius: "50px",
                    borderWidth: 2,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                    color: isDarkMode ? 'white' : 'black',
                    textTransform: 'none',
                    fontWeight: 600,
                    ...glassStyle
                  }}
                >
                  Browse Certifications
                </Button>
              </Stack>
            </motion.div>
          )}

          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                variant="contained"
                size="large"
                sx={{
                  px: 6, 
                  py: 2, 
                  fontSize: "1.2rem",
                  background: "linear-gradient(135deg, #00d4ff 0%, #0077b6 100%)",
                  borderRadius: "50px",
                  boxShadow: "0 10px 30px rgba(0, 212, 255, 0.3)",
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            style={{ marginTop: "60px" }}
          >
            <IconButton
              component={motion.button}
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth"
                });
              }}
              sx={{ 
                color: isDarkMode ? 'white' : 'black',
                ...glassStyle,
                width: 56,
                height: 56
              }}
            >
              <ArrowDownward />
            </IconButton>
          </motion.div>

          {/* Floating Tech Logos */}
          <Stack 
            direction="row" 
            spacing={4} 
            justifyContent="center" 
            sx={{ mt: 8, flexWrap: "wrap", gap: 2 }}
          >
            {['AWS', 'Azure', 'GCP', 'Cisco', 'Python', 'React'].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Box sx={{
                  ...glassStyle,
                  px: 3,
                  py: 1.5,
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  {tech}
                </Box>
              </motion.div>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Certification Categories Section */}
      <Box sx={{ py: 12, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              align="center" 
              sx={{ 
                mb: 8, 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Choose Your Preparation Path
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {[
              {
                title: "Cloud Certifications",
                items: ["AWS Solutions Architect", "Azure Administrator", "GCP Cloud Architect", "AWS DevOps Engineer"],
                gradient: "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(138,43,226,0.2) 100%)"
              },
              {
                title: "Enterprise Softwares",
                items: ["SAP ERP", "Microsoft Novasion", "Salesforce", "ServiceNow"],
                gradient: "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,139,148,0.2) 100%)"
              },
              {
                title: "Interview Prep",
                items: ["JavaScript", "Java / Spring Boot", "React / Frontend", "Python / Data Science"],
                gradient: "linear-gradient(135deg, rgba(78,205,196,0.2) 0%, rgba(168,230,207,0.2) 100%)"
              }
            ].map((category, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ y: -10 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 4,
                      ...glassStyle,
                      background: category.gradient,
                      transition: "all 0.3s ease"
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                      {category.title}
                    </Typography>
                    <List dense>
                      {category.items.map((item, idx) => (
                        <ListItem key={idx} sx={{ px: 0 }}>
                          <ListItemText 
                            primary={item}
                            primaryTypographyProps={{
                              fontWeight: 500
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ 
                        mt: 3, 
                        borderRadius: "20px",
                        borderWidth: 2,
                        fontWeight: 600,
                        textTransform: 'none'
                      }}
                      component={motion.button}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Explore Exams
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 8,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Why Choose TechMock?
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 }
                }}
              >
                <Box
                  sx={{
                    p: 4,
                    borderRadius: "20px",
                    textAlign: "center",
                    ...glassStyle,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${benefit.color}, transparent)`,
                    }
                  }}
                >
                  <Box
                    sx={{
                      color: benefit.color,
                      mb: 2,
                      display: "flex",
                      justifyContent: "center",
                      '& svg': {
                        fontSize: '3rem'
                      }
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {benefit.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      {!isLoggedIn && (
        <Box sx={{ pb: 12, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: "30px",
                  p: { xs: 5, md: 8 },
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(102, 126, 234, 0.4)",
                }}
              >
                <Typography variant="h3" sx={{ mb: 3, fontWeight: 800, color: 'white' }}>
                  Ready to Excel?
                </Typography>

                <Typography variant="h6" sx={{ mb: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                  Join thousands of professionals accelerating their tech careers
                </Typography>

                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "white",
                    color: "#667eea",
                    px: 6,
                    py: 2,
                    borderRadius: "30px",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.95)"
                    }
                  }}
                >
                  Start Your Free Trial
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Landing;