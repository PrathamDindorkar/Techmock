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
  Tooltip,
} from "@mui/material";
import {
  ArrowDownward,
  School,
  EmojiEvents,
  Analytics,
  LocalOffer,
  ContentCopy,
  Done,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const Landing = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("TECH25");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToFreeMocks = () => {
    window.location.href = "/mocks?type=free";
  };

  const glassStyle = {
    background: isDarkMode
      ? "rgba(255, 255, 255, 0.07)"
      : "rgba(255, 255, 255, 0.72)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.28)"}`,
    boxShadow: isDarkMode
      ? "0 8px 32px rgba(0,0,0,0.38)"
      : "0 8px 32px rgba(31,38,135,0.13)",
  };

  const benefits = [
    {
      icon: <School fontSize="large" />,
      title: "Industry-Relevant Content",
      description: "Curated by experts to match real certification exams and interviews.",
      color: "#00d4ff",
    },
    {
      icon: <Analytics fontSize="large" />,
      title: "Performance Analytics",
      description: "Track progress with detailed analytics and personalized insights.",
      color: "#4ecdc4",
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: "Earn Certifications",
      description: "Motivational certificates based on your mock exam scores.",
      color: "#ffd93d",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "transparent",
        color: theme.palette.text.primary,
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Top Promo Bar */}
      <motion.div initial={{ y: -60 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 90 }}>
        <Box
          sx={{
            background: "linear-gradient(90deg, #ec4899, #a855f7, #00d4ff)",
            py: { xs: 1, md: 1.2 },
            px: 2,
            textAlign: "center",
            color: "white",
            fontSize: { xs: "0.85rem", md: "0.95rem" },
            fontWeight: 600,
            letterSpacing: 0.5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <LocalOffer fontSize="small" />
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            LIMITED TIME:
          </Box>{" "}
          <strong>25% OFF</strong> paid exams with code <strong>TECH25</strong>
        </Box>
      </motion.div>

      {/* ==================== HERO SECTION ==================== */}
      <Box
        sx={{
          minHeight: { xs: "90vh", md: "100vh", lg: "110vh" },
          display: "flex",
          alignItems: "center",
          pt: { xs: 6, sm: 8, md: 10 },
          pb: { xs: 10, md: 14, lg: 16 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            {/* Title + Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <Box sx={{ position: "relative", display: "inline-block", mb: { xs: 3, md: 4 } }}>
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  style={{
                    position: "absolute",
                    right: isMobile ? "-15px" : "-65px",
                    top: isMobile ? "-20px" : "-35px",
                    background: "#ffd93d",
                    color: "#000",
                    padding: "6px 14px",
                    borderRadius: "50px",
                    fontWeight: 900,
                    fontSize: isMobile ? "0.75rem" : "0.85rem",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                    border: "2px solid white",
                    zIndex: 2,
                  }}
                >
                  SAVE 25% 🚀
                </motion.div>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.4rem", sm: "3.4rem", md: "4.6rem", lg: "5.2rem" },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    background:
                      "linear-gradient(135deg, #00d4ff 0%, #22c55e 50%, #a855f7 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Master Your Tech Journey
                </Typography>
              </Box>
            </motion.div>

            {/* Free Emphasis */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "#22c55e",
                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                }}
              >
                Start with <strong>100% Free</strong> Mock Exams
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: "680px",
                  mx: "auto",
                  mb: { xs: 4, md: 6 },
                  color: isDarkMode ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.78)",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  lineHeight: 1.5,
                }}
              >
                No credit card • Real exam experience
              </Typography>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 5 }}
                justifyContent="center"
                sx={{ mb: { xs: 8, md: 10 } }}
              >
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  onClick={goToFreeMocks}
                  sx={{
                    px: { xs: 5, sm: 7 },
                    py: 2,
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #22c55e, #10b981)",
                    borderRadius: "50px",
                    boxShadow: "0 10px 30px rgba(34,197,94,0.35)",
                    textTransform: "none",
                  }}
                >
                  Try Free Mock Exams →
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: { xs: 5, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1.05rem", sm: "1.15rem" },
                    borderRadius: "50px",
                    borderWidth: 2,
                    ...glassStyle,
                  }}
                >
                  Browse All Certifications
                </Button>
              </Stack>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <IconButton
                component={motion.button}
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                onClick={() => window.scrollTo({ top: window.innerHeight - 80, behavior: "smooth" })}
                sx={{
                  color: isDarkMode ? "white" : "black",
                  ...glassStyle,
                  width: 56,
                  height: 56,
                  mb: { xs: 6, md: 8 },
                }}
              >
                <ArrowDownward />
              </IconButton>
            </motion.div>

            {/* Tech Tags */}
            <Stack
              direction="row"
              spacing={{ xs: 1.5, sm: 2.5, md: 3 }}
              justifyContent="center"
              sx={{
                flexWrap: "wrap",
                gap: { xs: 1.5, sm: 2 },
                maxWidth: "900px",
                mx: "auto",
              }}
            >
              {["AWS", "Azure", "DSA", "SAP", "SAP Fiori", "OpenText VIM"].map((tech, i) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                >
                  <Box
                    sx={{
                      ...glassStyle,
                      px: { xs: 2.5, sm: 3.5 },
                      py: 1.2,
                      borderRadius: "20px",
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      fontWeight: 600,
                    }}
                  >
                    {tech}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Box>
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
      <Box sx={{ py: { xs: 8, md: 12 } }}>
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
      <Container sx={{ py: { xs: 10, md: 14 } }}>
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
        <Box sx={{ py: { xs: 10, md: 14 }, pb: { xs: 14, md: 18 } }}>
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