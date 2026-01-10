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
  useMediaQuery,
  Tooltip
} from "@mui/material";
import {
  ArrowDownward,
  School,
  EmojiEvents,
  Analytics,
  LocalOffer,
  ContentCopy,
  Done
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const Landing = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("TECH25");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <Box sx={{
      bgcolor: 'transparent',
      color: theme.palette.text.primary,
      overflow: "hidden",
      position: "relative",
      minHeight: "100vh"
    }}>
      
      {/* 1. ANIMATED TOP PROMO BAR */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 120 }}
      >
        <Box sx={{
          background: "linear-gradient(90deg, #ec4899, #a855f7, #00d4ff)",
          py: 1,
          borderRadius: 50,
          textAlign: "center",
          color: "white",
          fontWeight: 700,
          fontSize: "0.9rem",
          letterSpacing: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}>
          <LocalOffer fontSize="small" />
          LIMITED TIME: 25% OFF ALL PAID EXAMS
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: '2px 8px', 
              borderRadius: '4px',
              border: '1px dashed white'
            }}
          >
            CODE: TECH25
          </motion.span>
        </Box>
      </motion.div>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 1,
          pt: 4
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 2. FLOATING BADGE NEAR TITILE */}
            <Box sx={{ display: 'inline-block', position: 'relative' }}>
                <motion.div
                    animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    style={{
                        position: 'absolute',
                        right: isMobile ? '-20px' : '-60px',
                        top: '-30px',
                        background: '#ffd93d',
                        color: '#000',
                        padding: '8px 15px',
                        borderRadius: '50px',
                        fontWeight: 900,
                        fontSize: '0.8rem',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        zIndex: 2,
                        border: '2px solid white'
                    }}
                >
                    SAVE 25% 🚀
                </motion.div>
                <Typography
                variant="h1"
                sx={{
                    fontSize: { xs: "2.8rem", md: "5rem" },
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
            </Box>
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
              Realistic mock exams for AWS, Azure, SAP, and OpenText.
              Practice with confidence, ace your certifications & interviews.
            </Typography>
          </motion.div>

          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center" alignItems="center">
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
                  Start Free Trial
                </Button>

                <Button
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
            <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            sx={{ mt: 8, flexWrap: "wrap", gap: 2 }}
          >
            {['Amazon Web Services', 'Azure', 'Data Structures & Algorithms', 'Software Application Program (SAP)', 'SAP Fiori', 'OpenText Vendor Invoice Management'].map((tech, index) => (
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
          </motion.div>
        </Container>
      </Box>

      {/* 3. ENHANCED FLASH SALE SECTION */}
      <Container maxWidth="md" sx={{ mt: -4, mb: 8, position: 'relative', zIndex: 10 }}>
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
        >
            <Box
                sx={{
                borderRadius: "24px",
                p: 1,
                background: "linear-gradient(90deg, #00d4ff, #a855f7, #ec4899)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(168, 85, 247, 0.4)",
                }}
            >
                <Box sx={{
                    bgcolor: isDarkMode ? "#0f172a" : "#fff",
                    borderRadius: "20px",
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 3,
                    textAlign: { xs: "center", md: "left" }
                }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                           Special Launch Offer 🎊
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.8 }}>
                            Use the code at checkout to unlock your 25% discount.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                            onClick={copyToClipboard}
                            sx={{
                                border: '2px dashed #a855f7',
                                px: 4,
                                py: 1.5,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                position: 'relative',
                                bgcolor: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                                transition: '0.3s',
                                '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.2)' }
                            }}
                        >
                            <Typography variant="h4" sx={{ 
                                fontWeight: 900, 
                                letterSpacing: 4, 
                                color: "#a855f7",
                                fontFamily: 'monospace'
                            }}>
                                TECH25
                            </Typography>
                            <Tooltip title={copied ? "Copied!" : "Click to copy"}>
                                <Box sx={{ position: 'absolute', top: -10, right: -10, bgcolor: '#a855f7', borderRadius: '50%', p: 0.5, color: 'white', display: 'flex' }}>
                                    {copied ? <Done fontSize="small" /> : <ContentCopy fontSize="small" />}
                                </Box>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </motion.div>
      </Container>

      {/* Certification Categories Section */}
      <Box sx={{ py: 8, position: 'relative', zIndex: 1 }}>
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
                            primaryTypographyProps={{ fontWeight: 500 }}
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
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
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
                whileHover={{ y: -10 }}
              >
                <Box sx={{
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
                  <Box sx={{ color: benefit.color, mb: 2, display: "flex", justifyContent: "center", '& svg': { fontSize: '3rem' } }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{benefit.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>{benefit.description}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
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
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, color: 'white' }}>
                  Ready to Excel?
                </Typography>
                
                {/* 4. REINFORCE COUPON IN FINAL CTA */}
                <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                  Join thousands of professionals. Use code <strong style={{ color: '#ffd93d' }}>TECH25</strong> for instant savings!
                </Typography>

                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
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
                    "&:hover": { bgcolor: "white" }
                  }}
                >
                  Get Started with 25% Off
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