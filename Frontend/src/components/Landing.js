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
  Chip,
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
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

const Landing = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
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

  const handleBrowseClick = () => {
    navigate('/mocks');
  };

  const glassStyle = {
    background: isDarkMode
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(255, 255, 255, 0.70)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,157,224,0.18)"}`,
    boxShadow: isDarkMode
      ? "0 8px 32px rgba(0,0,0,0.35)"
      : "0 8px 32px rgba(0,157,224,0.08)",
  };

  const sapBlue = "#009DE0";
  const sapHighlightBlue = "#007CC0";
  const sapDeepBlue = "#0057D1";

  const techStack = [
    { name: "Python", logo: "https://cdn.simpleicons.org/python/3776AB" },
    { name: "React", logo: "https://cdn.simpleicons.org/react/61DAFB" },
    { name: "JavaScript", logo: "https://cdn.simpleicons.org/javascript/F7DF1E" },
    { name: "Node.js", logo: "https://cdn.simpleicons.org/nodedotjs/339933" },
    { name: "Data Structure & Algorithms", logo: null },
    { name: "SAP", logo: "https://cdn.simpleicons.org/sap/0FAAFF", isEnterprise: true },
    { name: "OpenText VIM", logo: "https://cdn.simpleicons.org/files/4285F4", isEnterprise: true },
    { name: "Enterprise", logo: null, isEnterprise: true },
  ];

  const benefits = [
    {
      icon: <School fontSize="large" />,
      title: "Industry-Relevant Content",
      description: "Curated by experts to match real certification exams and interviews.",
      color: sapBlue,
    },
    {
      icon: <Analytics fontSize="large" />,
      title: "Performance Analytics",
      description: "Track progress with detailed analytics and personalized insights.",
      color: sapHighlightBlue,
    },
    {
      icon: <EmojiEvents fontSize="large" />,
      title: "Earn Certifications",
      description: "Motivational certificates based on your mock exam scores.",
      color: sapDeepBlue,
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
            background: `linear-gradient(90deg, ${sapBlue}, ${sapHighlightBlue})`,
            py: { xs: 1, md: 1.2 },
            px: 2,
            borderRadius: 50,
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

      {/* HERO SECTION */}
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
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
            >
              <Box sx={{ position: "relative", display: "inline-block", mb: { xs: 3, md: 4 } }}>
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                  style={{
                    position: "absolute",
                    right: isMobile ? "-15px" : "-65px",
                    top: isMobile ? "-20px" : "-35px",
                    background: sapHighlightBlue,
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "50px",
                    fontWeight: 900,
                    fontSize: isMobile ? "0.75rem" : "0.85rem",
                    boxShadow: "0 8px 16px rgba(0,157,224,0.3)",
                    border: "2px solid white",
                    zIndex: 2,
                  }}
                >
                  SAVE 25% →
                </motion.div>

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2rem", sm: "3rem", md: "4.2rem", lg: "4.8rem" },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    background: `linear-gradient(135deg, ${sapBlue} 0%, ${sapHighlightBlue} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Practice with Confidence. Certify for Real.
                </Typography>
              </Box>
            </motion.div>

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
                  color: sapBlue,
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
                  color: isDarkMode ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.75)",
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.2rem" },
                  lineHeight: 1.5,
                }}
              >
                No credit card • Real exam experience
              </Typography>
            </motion.div>

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
                    background: `linear-gradient(90deg, ${sapBlue}, ${sapHighlightBlue})`,
                    borderRadius: "50px",
                    boxShadow: `0 10px 30px ${isDarkMode ? "rgba(0,157,224,0.4)" : "rgba(0,124,192,0.25)"}`,
                    textTransform: "none",
                  }}
                >
                  Try Free Mock Exams →
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBrowseClick}
                  sx={{
                    px: { xs: 5, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1.05rem", sm: "1.15rem" },
                    borderRadius: "50px",
                    borderWidth: 2,
                    borderColor: sapBlue,
                    color: sapBlue,
                    ...glassStyle,
                    '&:hover': {
                      borderColor: sapHighlightBlue,
                      background: `${sapBlue}10`,
                    }
                  }}
                >
                  Browse All Mocks
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
                  color: sapBlue,
                  ...glassStyle,
                  width: 56,
                  height: 56,
                  mb: { xs: 6, md: 8 },
                }}
              >
                <ArrowDownward />
              </IconButton>
            </motion.div>

            {/* Tech Tags / Enterprise Highlights */}
            <Box sx={{ py: { xs: 8, md: 10 }, position: "relative" }}>
              <Container maxWidth="lg">
                {/* Challenge Message – centered, animated, high contrast */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      mb: { xs: 6, md: 8 },
                      px: { xs: 2, sm: 4 },
                    }}
                  >
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{
                        fontWeight: 900,
                        color: "#c62828", // deep red – signals difficulty/challenge
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.9rem", lg: "2.2rem" },
                        lineHeight: 1.35,
                        mb: 1.5,
                        textShadow: isDarkMode
                          ? "0 3px 12px rgba(0,0,0,0.7)"
                          : "0 3px 12px rgba(198,40,40,0.25)",
                      }}
                    >
                      We’ve built a test most people can’t clear.
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: isDarkMode ? "#ff8a80" : "#d32f2f",
                        fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.4rem" },
                        letterSpacing: 0.5,
                        mb: 4,
                      }}
                    >
                      If you think you’re ready — prove it.
                    </Typography>

                    {/* Subtle animated underline / accent line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                      style={{ originX: 0.5 }}
                    >
                      <Box
                        sx={{
                          height: "4px",
                          width: { xs: "140px", md: "220px" },
                          background: "linear-gradient(90deg, transparent, #d32f2f, transparent)",
                          mx: "auto",
                          borderRadius: "4px",
                          mb: 2,
                        }}
                      />
                    </motion.div>
                  </Box>
                </motion.div>

                {/* Original enterprise content continues here */}
                <Box sx={{ textAlign: "center", mb: 6 }}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 3,
                        py: 1.2,
                        background: `${sapBlue}15`,
                        border: `1px solid ${sapBlue}40`,
                        borderRadius: "50px",
                        mb: 3,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Box component="span" sx={{ fontSize: "1.3rem" }}>🏆</Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: sapBlue,
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                          fontSize: "0.95rem",
                        }}
                      >
                        Enterprise-Grade Expertise
                      </Typography>
                    </Box>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                        mb: 2,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Built on Real-World Enterprise Experience
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: { xs: "1.05rem", sm: "1.15rem" },
                        maxWidth: "750px",
                        mx: "auto",
                        lineHeight: 1.7,
                      }}
                    >
                      Mock tests crafted with insights from SAP implementations and large-scale enterprise architectures
                    </Typography>
                  </motion.div>
                </Box>

                {/* Enterprise Cards - now blue themed */}
                <Grid container spacing={3} sx={{ mb: 7 }}>
                  {[
                    {
                      icon: "💻",
                      title: "Programming Languages",
                      desc: "Practice mocks for Python • Java • React • React Advanced",
                      color: sapBlue,
                    },
                    {
                      icon: "📊",
                      title: "DSA + SQL",
                      desc: "Data Structures, Algorithms & Database / SQL mocks",
                      color: sapHighlightBlue,
                    },
                    {
                      icon: "📋",
                      title: "SAP VIM",
                      desc: "Vendor Invoice Management • Archiving • Document Types",
                      color: sapDeepBlue,
                    },
                  ].map((item, i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                      >
                        <Box
                          sx={{
                            p: 4,
                            borderRadius: "20px",
                            background: `${item.color}08`,
                            border: `1.5px solid ${item.color}30`,
                            height: "100%",
                            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                            backdropFilter: "blur(10px)",
                            boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,157,224,0.08)",
                            '&:hover': {
                              borderColor: `${item.color}70`,
                              boxShadow: `0 12px 40px ${item.color}30`,
                            },
                          }}
                        >
                          <Box sx={{ fontSize: "3rem", mb: 2.5, color: item.color }}>{item.icon}</Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: theme.palette.text.primary }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {/* Tech Stack - blue accents for enterprise items */}
                <Box
                  sx={{
                    p: { xs: 4, sm: 5, md: 6 },
                    borderRadius: "28px",
                    background: isDarkMode ? "rgba(15,23,42,0.6)" : "rgba(248,250,252,0.85)",
                    border: `1.5px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : `${sapBlue}15`}`,
                    backdropFilter: "blur(20px)",
                    boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,157,224,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        background: `linear-gradient(135deg, ${sapBlue}, ${sapHighlightBlue})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        color: "white",
                        boxShadow: `0 4px 16px ${sapBlue}50`,
                      }}
                    >
                      ✓
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                      Technology Stack Mastery
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2.5 }}
                    justifyContent="center"
                    sx={{ flexWrap: "wrap", gap: { xs: 2.5, sm: 3 } }}
                  >
                    {techStack.map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 150, damping: 15 }}
                        whileHover={{ scale: 1.12, y: -5 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                            px: { xs: 2.5, sm: 3.5 },
                            py: { xs: 2.5, sm: 3 },
                            borderRadius: "18px",
                            background: tech.isEnterprise ? `${sapBlue}12` : (isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                            border: tech.isEnterprise
                              ? `2px solid ${sapBlue}40`
                              : `1px solid ${isDarkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`,
                            minWidth: { xs: "95px", sm: "110px" },
                            position: "relative",
                            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                            '&:hover': {
                              background: tech.isEnterprise ? `${sapBlue}25` : (isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                              borderColor: tech.isEnterprise ? `${sapBlue}70` : sapBlue,
                            },
                          }}
                        >
                          {tech.isEnterprise && (
                            <Box sx={{ position: "absolute", top: 6, right: 6, fontSize: "0.8rem", color: sapBlue }}>★</Box>
                          )}
                          {tech.logo && (
                            <Box
                              component="img"
                              src={tech.logo}
                              alt={`${tech.name} logo`}
                              loading="lazy"
                              sx={{
                                width: { xs: 40, sm: 44 },
                                height: { xs: 40, sm: 44 },
                                objectFit: "contain",
                                borderRadius: "10px",
                                filter: tech.isEnterprise ? `drop-shadow(0 4px 12px ${sapBlue}50)` : "none",
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: tech.isEnterprise ? sapBlue : theme.palette.text.primary,
                              fontWeight: tech.isEnterprise ? 800 : 700,
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              textAlign: "center",
                            }}
                          >
                            {tech.name}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>

                  <Box sx={{ mt: 6, pt: 5, borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, textAlign: "center" }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: "900px", mx: "auto", lineHeight: 1.8 }}>
                      <Box component="span" sx={{ color: sapBlue, fontWeight: 800 }}>
                        All mock tests
                      </Box>{" "}
                      are designed with insights from hands-on enterprise implementations, real-world architectural challenges, and production-level best practices.
                    </Typography>
                  </Box>
                </Box>
              </Container>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Flash Sale / Coupon Section – blue themed */}
      <Container maxWidth="md" sx={{ mt: -4, mb: 8, position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}>
          <Box
            sx={{
              borderRadius: "24px",
              p: 1,
              background: `linear-gradient(90deg, ${sapBlue}, ${sapHighlightBlue})`,
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 15px 40px ${sapBlue}40`,
            }}
          >
            <Box
              sx={{
                bgcolor: isDarkMode ? "#0f172a" : "#fff",
                borderRadius: "20px",
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Special Launch Offer
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.85 }}>
                  Use the code at checkout to unlock your 25% discount.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  onClick={copyToClipboard}
                  sx={{
                    border: `2px dashed ${sapBlue}`,
                    px: 4,
                    py: 1.5,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: `${sapBlue}08`,
                    transition: '0.3s',
                    '&:hover': { bgcolor: `${sapBlue}15` },
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: 4,
                      color: sapBlue,
                      fontFamily: 'monospace',
                    }}
                  >
                    TECH25
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Click to copy"}>
                    <Box sx={{ position: 'absolute', top: -10, right: -10, bgcolor: sapBlue, borderRadius: '50%', p: 0.5, color: 'white', display: 'flex' }}>
                      {copied ? <Done fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Container>

      {/* Certification Categories – blue accents */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                mb: 10,
                fontWeight: 800,
                color: sapBlue,
              }}
            >
              Choose Your Preparation Path
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center" alignItems="stretch">
            {[
              {
                title: "Enterprise Softwares",
                items: [
                  { text: "SAP ERP" },
                  { text: "Opentext VIM" },
                  { text: "Salesforce", comingSoon: true },
                  { text: "Microsoft Novasion", comingSoon: true }
                ],
                color: sapBlue,
              },
              {
                title: "Interview Prep",
                items: [
                  { text: "JavaScript" },
                  { text: "Node.js / Backend" },
                  { text: "React / Frontend" },
                  { text: "Python / Data Science" }
                ],
                color: sapHighlightBlue,
              }
            ].map((category, index) => (
              <Grid item xs={12} sm={10} md={5} lg={4.5} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -12 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      height: "100%",
                      borderRadius: 5,
                      background: `${category.color}0D`,
                      border: `1px solid ${category.color}20`,
                      transition: "all 0.4s ease",
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${category.color}20`,
                        borderColor: `${category.color}50`,
                      }
                    }}
                  >
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 4, color: category.color }}>
                      {category.title}
                    </Typography>

                    <List dense disablePadding>
                      {category.items.map((item, idx) => (
                        <ListItem key={idx} disablePadding sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ fontWeight: 500, fontSize: '1.05rem' }}
                          />
                          {item.comingSoon && (
                            <Chip
                              label="Coming Soon"
                              size="small"
                              sx={{
                                backgroundColor: `${sapHighlightBlue}CC`,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                borderRadius: '12px',
                              }}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section – unified blue icons */}
      <Container sx={{ py: { xs: 10, md: 14 } }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 8,
              fontWeight: 800,
              color: sapBlue,
            }}
          >
            Why Choose TechMocks?
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
                  <Box sx={{ color: benefit.color, mb: 2, display: "flex", justifyContent: "center" }}>
                    {React.cloneElement(benefit.icon, { fontSize: "inherit", style: { fontSize: '3.5rem' } })}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{benefit.title}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>{benefit.description}</Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Trust / Testimonial Section – blue border accents
      <Box sx={{ py: { xs: 10, md: 14 }, bgcolor: isDarkMode ? "rgba(15,23,42,0.35)" : "rgba(248,250,252,0.5)" }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <Typography
              variant="h3"
              align="center"
              sx={{
                mb: 3,
                fontWeight: 800,
                color: sapBlue,
              }}
            >
              Why Learners Trust TechMocks
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{
                maxWidth: "800px",
                mx: "auto",
                mb: 8,
                color: theme.palette.text.secondary,
                fontSize: { xs: "1.05rem", md: "1.15rem" },
                lineHeight: 1.8,
              }}
            >
              Built from real enterprise experience (SAP implementations, large-scale architecture), our mocks help thousands prepare smarter — not harder.<br />
              <strong>Real results. Real confidence. No fluff.</strong>
            </Typography>
          </motion.div>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: "100%",
                    ...glassStyle,
                    borderLeft: `5px solid ${sapBlue}`,
                  }}
                >
                  <Typography variant="body1" sx={{ fontStyle: "italic", mb: 3, lineHeight: 1.7 }}>
                    "The VIM archiving and document type questions were spot-on — almost identical to what I faced in my OpenText certification..."
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: sapBlue, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      AS
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Ankit Sharma</Typography>
                      <Typography variant="body2" color="text.secondary">SAP Consultant • Cleared OpenText VIM Cert</Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    height: "100%",
                    ...glassStyle,
                    borderLeft: `5px solid ${sapHighlightBlue}`,
                  }}
                >
                  <Typography variant="body1" sx={{ fontStyle: "italic", mb: 3, lineHeight: 1.7 }}>
                    "Switched from just LeetCode to TechMocks for React Advanced + DSA mocks — the explanations are clear..."
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: sapHighlightBlue, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      RP
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Riya Patel</Typography>
                      <Typography variant="body2" color="text.secondary">React Developer • Recent Job Switch</Typography>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={4} justifyContent="center" alignItems="center" sx={{ mt: 10, textAlign: "center" }}>
            <Box><Typography variant="h4" sx={{ fontWeight: 800, color: sapBlue }}>5,000+</Typography><Typography variant="body2" color="text.secondary">Mock Exams Taken</Typography></Box>
            <Box><Typography variant="h4" sx={{ fontWeight: 800, color: sapHighlightBlue }}>87%</Typography><Typography variant="body2" color="text.secondary">First-Time Pass Rate (Reported)</Typography></Box>
            <Box><Typography variant="h4" sx={{ fontWeight: 800, color: sapDeepBlue }}>4.8/5</Typography><Typography variant="body2" color="text.secondary">Average User Rating</Typography></Box>
          </Stack>
        </Container>
      </Box>
        */}
      {/* Final CTA */}
      {!isLoggedIn && (
        <Box sx={{ py: { xs: 10, md: 14 }, pb: { xs: 14, md: 18 } }}>
          <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${sapBlue}, ${sapHighlightBlue})`,
                  borderRadius: "30px",
                  p: { xs: 5, md: 8 },
                  textAlign: "center",
                  boxShadow: `0 20px 60px ${sapBlue}40`,
                }}
              >
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 800, color: 'white' }}>
                  Ready to Excel?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
                  Join thousands of professionals. Use code <strong style={{ color: '#ffffff', fontWeight: 700 }}>TECH25</strong> for instant savings!
                </Typography>

                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "white",
                    color: sapDeepBlue,
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