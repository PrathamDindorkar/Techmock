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
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import Chip from '@mui/material/Chip';

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
  }
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

const techStack = [
  { 
    name: "Python", 
    logo: "https://cdn.simpleicons.org/python/3776AB"
  },
  { 
    name: "React", 
    logo: "https://cdn.simpleicons.org/react/61DAFB"
  },
  { 
    name: "JavaScript", 
    logo: "https://cdn.simpleicons.org/javascript/F7DF1E"
  },
  { 
    name: "Node.js", 
    logo: "https://cdn.simpleicons.org/nodedotjs/339933"
  },
  { 
    name: "Data Structure & Algorithms", 
    logo: null 
  },
  {
    name: "SAP",
    logo: "https://cdn.simpleicons.org/sap/0FAAFF",
    isEnterprise: true,
  },
  {
    name: "OpenText VIM",
    // Using a generic enterprise/document icon
    logo: "https://cdn.simpleicons.org/files/4285F4",
    isEnterprise: true,
  },
  { 
    name: "Enterprise", 
    logo: null, 
    isEnterprise: true 
  },
];

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
                    fontSize: { xs: "2rem", sm: "3rem", md: "4.2rem", lg: "4.8rem" },
                    fontWeight: 900,
                    lineHeight: 1.05,
                    background:
                      "linear-gradient(135deg, #00d4ff 0%, #22c55e 50%, #a855f7 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Practice with Confidence. Certify for Real.
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
                  onClick={handleBrowseClick}
                  sx={{
                    px: { xs: 5, sm: 6 },
                    py: 2,
                    fontSize: { xs: "1.05rem", sm: "1.15rem" },
                    borderRadius: "50px",
                    borderWidth: 2,
                    ...glassStyle,
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
            <Box
              sx={{
                py: { xs: 8, md: 10 },
                position: "relative",
              }}
            >
              <Container maxWidth="lg">
                {/* Header Badge */}
                <Box sx={{ textAlign: "center", mb: 6 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 3,
                        py: 1.2,
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.15) 100%)"
                            : "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(147,51,234,0.08) 100%)",
                        border: (theme) =>
                          theme.palette.mode === "dark"
                            ? "1px solid rgba(59,130,246,0.4)"
                            : "1px solid rgba(59,130,246,0.3)",
                        borderRadius: "50px",
                        mb: 3,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1.3rem",
                        }}
                      >
                        🏆
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "dark" ? "#60a5fa" : "#2563eb",
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
                        color: (theme) => theme.palette.text.primary,
                        fontWeight: 800,
                        fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                        mb: 2,
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)"
                            : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Built on Real-World Enterprise Experience
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
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

                {/* Enterprise Highlights Cards */}
                <Grid container spacing={3} sx={{ mb: 7 }}>
                  {[
                    {
                      icon: "🏢",
                      title: "SAP Implementations",
                      desc: "End-to-end SAP solution deployment and integration expertise",
                      gradient: {
                        dark: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.08) 100%)",
                        light: "linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(37,99,235,0.02) 100%)",
                      },
                      borderColor: { dark: "rgba(59,130,246,0.3)", light: "rgba(59,130,246,0.2)" },
                    },
                    {
                      icon: "📋",
                      title: "OpenText VIM for SAP",
                      desc: "Vendor Invoice Management optimization and implementation",
                      gradient: {
                        dark: "linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(126,34,206,0.08) 100%)",
                        light: "linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(126,34,206,0.02) 100%)",
                      },
                      borderColor: { dark: "rgba(147,51,234,0.3)", light: "rgba(147,51,234,0.2)" },
                    },
                    {
                      icon: "🏗️",
                      title: "Enterprise Architecture",
                      desc: "Large-scale system design, planning, and infrastructure management",
                      gradient: {
                        dark: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)",
                        light: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)",
                      },
                      borderColor: { dark: "rgba(16,185,129,0.3)", light: "rgba(16,185,129,0.2)" },
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
                            background: (theme) =>
                              theme.palette.mode === "dark"
                                ? item.gradient.dark
                                : item.gradient.light,
                            border: (theme) =>
                              `1.5px solid ${theme.palette.mode === "dark" ? item.borderColor.dark : item.borderColor.light}`,
                            height: "100%",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(10px)",
                            boxShadow: (theme) =>
                              theme.palette.mode === "dark"
                                ? "0 4px 20px rgba(0,0,0,0.3)"
                                : "0 4px 20px rgba(0,0,0,0.08)",
                            "&:hover": {
                              border: (theme) =>
                                `1.5px solid ${theme.palette.mode === "dark" ? item.borderColor.dark.replace("0.3", "0.6") : item.borderColor.light.replace("0.2", "0.4")}`,
                              boxShadow: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "0 12px 40px rgba(59,130,246,0.25)"
                                  : "0 12px 40px rgba(59,130,246,0.15)",
                              transform: "translateY(-4px)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              fontSize: "3rem",
                              mb: 2.5,
                              display: "inline-block",
                              transform: "scale(1)",
                              transition: "transform 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.1) rotate(5deg)",
                              },
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: (theme) => theme.palette.text.primary,
                              fontWeight: 700,
                              mb: 1.5,
                              fontSize: "1.25rem",
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: (theme) => theme.palette.text.secondary,
                              lineHeight: 1.7,
                              fontSize: "0.95rem",
                            }}
                          >
                            {item.desc}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>

                {/* Tech Stack Section */}
                <Box
                  sx={{
                    p: { xs: 4, sm: 5, md: 6 },
                    borderRadius: "28px",
                    background: (theme) =>
                      theme.palette.mode === "dark"
                        ? "linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.7) 100%)"
                        : "linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.9) 100%)",
                    border: (theme) =>
                      theme.palette.mode === "dark"
                        ? "1.5px solid rgba(255,255,255,0.1)"
                        : "1.5px solid rgba(0,0,0,0.08)",
                    backdropFilter: "blur(20px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 8px 32px rgba(0,0,0,0.4)"
                        : "0 8px 32px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 5 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        background: "linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        boxShadow: "0 4px 16px rgba(59,130,246,0.4)",
                      }}
                    >
                      ✓
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        color: (theme) => theme.palette.text.primary,
                        fontWeight: 800,
                        fontSize: { xs: "1.4rem", sm: "1.6rem" },
                      }}
                    >
                      Technology Stack Mastery
                    </Typography>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2.5 }}
                    justifyContent="center"
                    sx={{
                      flexWrap: "wrap",
                      gap: { xs: 2.5, sm: 3 },
                    }}
                  >
                    {techStack.map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.5 + i * 0.08,
                          type: "spring",
                          stiffness: 150,
                          damping: 15,
                        }}
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
                            background: (theme) =>
                              tech.isEnterprise
                                ? theme.palette.mode === "dark"
                                  ? "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(37,99,235,0.15) 100%)"
                                  : "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.06) 100%)"
                                : theme.palette.mode === "dark"
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.03)",
                            border: (theme) =>
                              tech.isEnterprise
                                ? theme.palette.mode === "dark"
                                  ? "2px solid rgba(59,130,246,0.5)"
                                  : "2px solid rgba(59,130,246,0.3)"
                                : theme.palette.mode === "dark"
                                  ? "1px solid rgba(255,255,255,0.12)"
                                  : "1px solid rgba(0,0,0,0.1)",
                            minWidth: { xs: "95px", sm: "110px" },
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            backdropFilter: "blur(10px)",
                            "&:hover": {
                              background: (theme) =>
                                tech.isEnterprise
                                  ? theme.palette.mode === "dark"
                                    ? "linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(37,99,235,0.25) 100%)"
                                    : "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.1) 100%)"
                                  : theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.05)",
                              border: (theme) =>
                                tech.isEnterprise
                                  ? theme.palette.mode === "dark"
                                    ? "2px solid rgba(59,130,246,0.7)"
                                    : "2px solid rgba(59,130,246,0.5)"
                                  : theme.palette.mode === "dark"
                                    ? "1px solid rgba(255,255,255,0.25)"
                                    : "1px solid rgba(0,0,0,0.2)",
                              boxShadow: tech.isEnterprise
                                ? "0 12px 40px rgba(59,130,246,0.35)"
                                : (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "0 8px 24px rgba(255,255,255,0.1)"
                                    : "0 8px 24px rgba(0,0,0,0.12)",
                            },
                            "&::before": tech.isEnterprise
                              ? {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "35px",
                                height: "35px",
                                background: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "linear-gradient(135deg, #3b82f6 0%, transparent 100%)"
                                    : "linear-gradient(135deg, #60a5fa 0%, transparent 100%)",
                                opacity: 0.5,
                              }
                              : {},
                          }}
                        >
                          {tech.isEnterprise && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                fontSize: "0.8rem",
                                filter: "drop-shadow(0 2px 4px rgba(59,130,246,0.6))",
                              }}
                            >
                              ⭐
                            </Box>
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
                                filter: tech.isEnterprise
                                  ? "drop-shadow(0 4px 12px rgba(59,130,246,0.6))"
                                  : "none",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                },
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              color: (theme) =>
                                tech.isEnterprise
                                  ? theme.palette.mode === "dark"
                                    ? "#60a5fa"
                                    : "#2563eb"
                                  : theme.palette.text.primary,
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

                  <Box
                    sx={{
                      mt: 6,
                      pt: 5,
                      borderTop: (theme) =>
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "1px solid rgba(0,0,0,0.08)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: (theme) => theme.palette.text.secondary,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        lineHeight: 1.8,
                        maxWidth: "900px",
                        mx: "auto",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          color: (theme) =>
                            theme.palette.mode === "dark" ? "#60a5fa" : "#2563eb",
                          fontWeight: 800,
                        }}
                      >
                        All mock tests
                      </Box>{" "}
                      are designed with insights from hands-on enterprise implementations, real-world architectural
                      challenges, and production-level best practices developed through years of SAP and enterprise solution delivery
                    </Typography>
                  </Box>
                </Box>
              </Container>
            </Box>
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
                mb: 10,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Choose Your Preparation Path
            </Typography>
          </motion.div>

          <Grid
            container
            spacing={4}
            justifyContent="center"           // ← Centers the cards horizontally
            alignItems="stretch"
          >
            {[
              {
                title: "Enterprise Softwares",
                items: [
                  { text: "SAP ERP" },
                  { text: "Opentext VIM" },
                  { text: "Salesforce", comingSoon: true },
                  { text: "Microsoft Novasion", comingSoon: true }
                ],
                gradient: "linear-gradient(135deg, rgba(255,107,107,0.18) 0%, rgba(255,139,148,0.18) 100%)"
              },
              {
                title: "Interview Prep",
                items: [
                  { text: "JavaScript" },
                  { text: "Node.js / Backend" },
                  { text: "React / Frontend" },
                  { text: "Python / Data Science" }
                ],
                gradient: "linear-gradient(135deg, rgba(78,205,196,0.18) 0%, rgba(168,230,207,0.18) 100%)"
              }
            ].map((category, index) => (
              <Grid
                item
                xs={12}
                sm={10}
                md={5}                    // Slightly wider cards + centered layout
                lg={4.5}
                key={index}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      height: "100%",
                      borderRadius: 5,
                      background: category.gradient,
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transition: "all 0.4s ease",
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                      }
                    }}
                  >
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        mb: 4,
                        color: 'text.primary'
                      }}
                    >
                      {category.title}
                    </Typography>

                    <List dense disablePadding>
                      {category.items.map((item, idx) => (
                        <ListItem
                          key={idx}
                          disablePadding
                          sx={{
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5
                          }}
                        >
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              fontSize: '1.05rem'
                            }}
                          />

                          {item.comingSoon && (
                            <Chip
                              label="Coming Soon"
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 193, 7, 0.9)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                borderRadius: '12px',
                                px: 1,
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
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