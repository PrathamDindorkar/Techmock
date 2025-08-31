import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Container,
  Box,
  Link,
  useMediaQuery,
  IconButton,
  useTheme
} from "@mui/material";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ArrowDownward,
  School,
  WorkOutline,
  TrendingUp
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import image1 from "./freepik__the-style-is-candid-image-photography-with-natural__89544.jpeg";

const Landing = ({ toggleColorMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const benefits = [
    {
      icon: <School fontSize="large" />,
      title: "Industry-Relevant Content",
      description: "Our questions are curated by experts to match real certification exams and interviews."
    },
    {
      icon: <WorkOutline fontSize="large" />,
      title: "Career Advancement",
      description: "95% of our users report increased confidence in their technical interviews."
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and personalized recommendations."
    }
  ];

  return (
    <Box sx={{
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary,
      transition: "all 0.3s ease-in-out",
      overflow: "hidden"
    }}>
      {/* Header with theme toggle */}
      <Box
        component={motion.div}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        sx={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 4,
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? 3 : 0,
          bgcolor: scrolled ? (isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)') : 'transparent',
          transition: "all 0.3s ease"
        }}
      >
      </Box>

      {/* Hero Section */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        sx={{
          height: "100vh",
          width: "100%",
          borderRadius: '50px',
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Background with overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: isDarkMode ? "brightness(0.4)" : "brightness(0.7)",
            transition: "filter 0.5s ease",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkMode
                ? "linear-gradient(to bottom, rgba(0, 128, 255, 1), rgba(25,25,25,0.9))"
                : "linear-gradient(to bottom, rgba(0, 128, 255, 1), rgba(255, 255, 255, 1))",
            }
          }}
        />

        {/* Hero Content */}
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                mb: 2,
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                color: isDarkMode ? "white" : "white",
              }}
            >
              Ace Your Tech Career
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
                mb: 4,
                fontWeight: 400,
                color: isDarkMode ? "rgba(255,255,255,0.9)" : "white",
                textShadow: "0 1px 5px rgba(0,0,0,0.2)",
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Practice with our intelligent mock exams designed by industry experts.
              Stand out in interviews and certification exams with confidence.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mt: 5 }}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: "30px",
                  background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  boxShadow: "0 3px 15px rgba(33, 150, 243, 0.3)",
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Get Started
              </Button>

              <Button
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                variant="outlined"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: "30px",
                  borderWidth: "2px",
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderWidth: "2px",
                    borderColor: "white",
                    background: "rgba(255,255,255,0.1)"
                  }
                }}
              >
                Learn More
              </Button>
            </Box>
          </motion.div>

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
              sx={{ color: "white" }}
            >
              <ArrowDownward />
            </IconButton>
          </motion.div>
        </Container>
      </Box>

      {/* Main Content Section */}
      <Container
        maxWidth="lg"
        sx={{
          py: 10,
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            alignItems: "center",
            gap: 6,
            mb: 10
          }}
        >
          {/* Left Content */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 3
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                lineHeight: 1.2,
                mb: 2
              }}
            >
              Empower Your Career with Tailored Mock Exams
            </Typography>

            <Typography variant="body1" sx={{ fontSize: "1.1rem", mb: 3 }}>
              Prepare for success with <strong>TechMock</strong>, the ultimate platform for mock exams designed to sharpen your technical skills. Whether you're gearing up for certifications, job interviews, or skill assessments, we've got you covered with industry-relevant questions and real-time results.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: "10px",
                  py: 1.5,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Login Now
              </Button>

              <Button
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: "10px",
                  py: 1.5,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Create Account
              </Button>
            </Box>
          </Box>

          {/* Right Content: Image */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            sx={{
              flex: 1,
              position: "relative"
            }}
          >
            <Box
              component={motion.div}
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              sx={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: isDarkMode
                  ? "0 20px 40px rgba(0,0,0,0.4)"
                  : "0 20px 40px rgba(0,0,0,0.15)",
                transform: "rotate(-2deg)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: isDarkMode
                    ? "linear-gradient(45deg, rgba(33,150,243,0.2), rgba(33,203,243,0.2))"
                    : "linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,203,243,0.1))",
                  zIndex: 1
                }
              }}
            >
              <img
                src={image1}
                alt="TechMock Illustration"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Benefits Section */}
        <Typography
          variant="h4"
          component={motion.h3}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          sx={{
            textAlign: "center",
            mb: 8,
            fontWeight: 700
          }}
        >
          Why Choose TechMock?
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 4,
            mb: 10
          }}
        >
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              component={motion.div}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                boxShadow: theme.shadows[10]
              }}
              sx={{
                p: 4,
                borderRadius: "16px",
                textAlign: "center",
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[4],
                transition: "all 0.3s ease",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  color: theme.palette.primary.main,
                  mb: 2,
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {benefit.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {benefit.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {benefit.description}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Call to Action */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            borderRadius: "20px",
            p: { xs: 4, md: 6 },
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(33, 150, 243, 0.3)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
              transform: "rotate(30deg)",
            }
          }}
        >
          <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
            Ready to excel in your tech career?
          </Typography>

          <Typography variant="h6" sx={{ mb: 4, maxWidth: "700px", mx: "auto", fontWeight: 400 }}>
            Join thousands of professionals who've accelerated their careers with TechMock's personalized practice exams.
          </Typography>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            variant="contained"
            size="large"
            onClick={() => navigate("/register")}
            sx={{
              bgcolor: "white",
              color: theme.palette.primary.main,
              px: 5,
              py: 1.5,
              borderRadius: "30px",
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)"
              }
            }}
          >
            Start Free Trial
          </Button>
        </Box>
      </Container>

      {/* Footer Section */}
      <Box
        component={motion.footer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)', // Frosted white with transparency
          backdropFilter: 'blur(12px)', // Apply blur
          color: theme.palette.text.secondary,
          py: 6,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderRadius: '90px',
          mt: 10
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
              gap: 4
            }}
          >
            <Box sx={{ maxWidth: "350px" }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  mb: 2,
                  background: "-webkit-linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                TechMock
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Empowering tech professionals with industry-leading practice exams
                and personalized learning paths.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "center", md: "flex-start" }
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Connect</Typography>
              <Link
                component={motion.a}
                whileHover={{ x: 5 }}
                href="https://mail.google.com/mail/?view=cm&fs=1&to=techmock972@gmail.com"
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

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: { xs: "center", md: "flex-start" }
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Legal</Typography>
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
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;