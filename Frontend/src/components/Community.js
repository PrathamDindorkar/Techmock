import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Collapse,
  CircularProgress,
  Fade,
  Zoom,
  Slide,
  Divider,
  Stack,
  useTheme,
  Paper
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Comment,
  Send,
  ChatBubbleOutline,
  AccessTime
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Glassmorphism styled components with dark mode support
const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 46, 0.7)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
    : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 48px 0 rgba(0, 0, 0, 0.5)'
      : '0 12px 48px 0 rgba(31, 38, 135, 0.25)',
    background: theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 46, 0.85)'
      : 'rgba(255, 255, 255, 0.8)',
  }
}));

const GlassTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 46, 0.5)'
      : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(30, 30, 46, 0.7)'
        : 'rgba(255, 255, 255, 0.7)',
    },
    '&.Mui-focused': {
      background: theme.palette.mode === 'dark'
        ? 'rgba(30, 30, 46, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 20px rgba(139, 92, 246, 0.4)'
        : '0 4px 20px rgba(99, 102, 241, 0.3)',
    },
    '& fieldset': {
      border: theme.palette.mode === 'dark'
        ? '2px solid rgba(255, 255, 255, 0.2)'
        : '2px solid rgba(255, 255, 255, 0.4)',
    },
    '&:hover fieldset': {
      border: theme.palette.mode === 'dark'
        ? '2px solid rgba(139, 92, 246, 0.5)'
        : '2px solid rgba(99, 102, 241, 0.4)',
    },
    '&.Mui-focused fieldset': {
      border: theme.palette.mode === 'dark'
        ? '2px solid rgba(139, 92, 246, 0.7)'
        : '2px solid rgba(99, 102, 241, 0.6)',
    }
  },
  '& .MuiInputBase-input::placeholder': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
  }
}));

const GlassButton = styled(Button)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.2)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(139, 92, 246, 0.5)'
    : '0 4px 20px rgba(99, 102, 241, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(168, 85, 247, 1) 100%)'
      : 'linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(139, 92, 246, 1) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(139, 92, 246, 0.6)'
      : '0 8px 30px rgba(99, 102, 241, 0.5)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
}));

const GlassCommentBox = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(20, 20, 30, 0.6)'
    : 'rgba(249, 250, 251, 0.6)',
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(255, 255, 255, 0.4)',
  padding: theme.spacing(3),
}));

const ReactionButton = styled(IconButton)(({ theme, active, color }) => ({
  background: active 
    ? `rgba(${color}, 0.15)` 
    : theme.palette.mode === 'dark'
      ? 'rgba(30, 30, 46, 0.6)'
      : 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '8px 16px',
  border: active 
    ? `1.5px solid rgba(${color}, 0.3)`
    : theme.palette.mode === 'dark'
      ? '1.5px solid rgba(255, 255, 255, 0.1)'
      : '1.5px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `rgba(${color}, 0.2)`,
    transform: 'scale(1.1)',
    borderColor: `rgba(${color}, 0.5)`,
  }
}));

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeComments, setActiveComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isPosting, setIsPosting] = useState(false);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const getConfig = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: token } } : {};
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/community/posts`, getConfig());
      setPosts(res.data);
    } catch (err) {
      console.error("API Error Details:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      await axios.post(`${backendUrl}/api/community/posts`, { content: newPost }, getConfig());
      setNewPost('');
      fetchPosts();
    } catch (err) {
      console.error("Post creation error:", err.response || err);
      alert("Please login to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleReaction = async (postId, type) => {
    try {
      await axios.post(`${backendUrl}/api/community/posts/${postId}/react`, { type }, getConfig());
      fetchPosts();
    } catch (err) {
      console.error("Reaction error:", err.response || err);
      alert("Please login to react");
    }
  };

  const toggleComments = async (postId) => {
    if (activeComments[postId]) {
      const next = { ...activeComments };
      delete next[postId];
      setActiveComments(next);
    } else {
      try {
        const res = await axios.get(`${backendUrl}/api/community/posts/${postId}/comments`);
        setActiveComments({ ...activeComments, [postId]: res.data });
      } catch (err) {
        console.error("Comments fetch error:", err);
      }
    }
  };

  const handlePostComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await axios.post(`${backendUrl}/api/community/posts/${postId}/comments`, { content }, getConfig());
      setCommentInputs({ ...commentInputs, [postId]: '' });
      const res = await axios.get(`${backendUrl}/api/community/posts/${postId}/comments`);
      setActiveComments({ ...activeComments, [postId]: res.data });
      fetchPosts();
    } catch (err) {
      console.error("Comment post error:", err.response || err);
      alert("Please login to comment");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            Loading Community...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'transparent',
        py: 6,
        px: 2
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                background: isDarkMode
                  ? 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
                letterSpacing: '-0.02em'
              }}
            >
              Community Hub
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: isDarkMode 
                  ? 'rgba(167, 139, 250, 0.8)' 
                  : 'rgba(102, 126, 234, 0.8)',
                fontWeight: 400
              }}
            >
              Share your thoughts and connect with peers
            </Typography>
          </Box>
        </Fade>

        {/* Post Creation */}
        <Zoom in timeout={600}>
          <GlassCard sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleCreatePost}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: isDarkMode
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 700,
                      fontSize: '20px'
                    }}
                  >
                    {localStorage.getItem('userName')?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <GlassTextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="What's on your mind? Share your experience..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isDarkMode 
                            ? 'rgba(255, 255, 255, 0.5)' 
                            : 'rgba(0, 0, 0, 0.5)' 
                        }}
                      >
                        {newPost.length > 0 && `${newPost.length} characters`}
                      </Typography>
                      <GlassButton
                        type="submit"
                        disabled={isPosting || !newPost.trim()}
                        startIcon={isPosting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      >
                        {isPosting ? 'Posting...' : 'Post'}
                      </GlassButton>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </GlassCard>
        </Zoom>

        {/* Posts Feed */}
        <Stack spacing={3}>
          {posts.length === 0 ? (
            <Fade in timeout={1000}>
              <GlassCard>
                <CardContent sx={{ py: 8, textAlign: 'center' }}>
                  <ChatBubbleOutline 
                    sx={{ 
                      fontSize: 80, 
                      color: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.2)', 
                      mb: 2 
                    }} 
                  />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      color: theme.palette.text.primary, 
                      mb: 1 
                    }}
                  >
                    No posts yet
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Be the first to share something!
                  </Typography>
                </CardContent>
              </GlassCard>
            </Fade>
          ) : (
            posts.map((post, index) => (
              <Slide
                key={post.id}
                direction="up"
                in
                timeout={400 + index * 100}
              >
                <GlassCard>
                  <CardContent sx={{ p: 3 }}>
                    {/* Post Header */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          background: isDarkMode
                            ? 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          fontWeight: 700
                        }}
                      >
                        {post.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            color: theme.palette.text.primary 
                          }}
                        >
                          {post.userName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime 
                            sx={{ 
                              fontSize: 14, 
                              color: theme.palette.text.secondary 
                            }} 
                          />
                          <Typography 
                            variant="caption" 
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Post Content */}
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 3,
                        color: theme.palette.text.primary,
                        lineHeight: 1.7,
                        fontSize: '15px'
                      }}
                    >
                      {post.content}
                    </Typography>

                    <Divider sx={{ mb: 2, opacity: 0.3 }} />

                    {/* Reactions */}
                    <Stack direction="row" spacing={1.5}>
                      <ReactionButton
                        active={post.myReaction === 'like'}
                        color="59, 130, 246"
                        onClick={() => handleReaction(post.id, 'like')}
                      >
                        <ThumbUp
                          sx={{
                            fontSize: 18,
                            color: post.myReaction === 'like' ? '#3b82f6' : theme.palette.text.secondary,
                            mr: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: post.myReaction === 'like' ? '#3b82f6' : theme.palette.text.secondary
                          }}
                        >
                          {post.likes}
                        </Typography>
                      </ReactionButton>

                      <ReactionButton
                        active={post.myReaction === 'dislike'}
                        color="239, 68, 68"
                        onClick={() => handleReaction(post.id, 'dislike')}
                      >
                        <ThumbDown
                          sx={{
                            fontSize: 18,
                            color: post.myReaction === 'dislike' ? '#ef4444' : theme.palette.text.secondary,
                            mr: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: post.myReaction === 'dislike' ? '#ef4444' : theme.palette.text.secondary
                          }}
                        >
                          {post.dislikes}
                        </Typography>
                      </ReactionButton>

                      <ReactionButton
                        color="168, 85, 247"
                        onClick={() => toggleComments(post.id)}
                      >
                        <Comment
                          sx={{
                            fontSize: 18,
                            color: 'rgba(168, 85, 247, 0.7)',
                            mr: 0.5
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'rgba(168, 85, 247, 0.8)'
                          }}
                        >
                          {post.commentCount}
                        </Typography>
                      </ReactionButton>
                    </Stack>

                    {/* Comments Section */}
                    <Collapse in={!!activeComments[post.id]} timeout={400}>
                      <GlassCommentBox sx={{ mt: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          💭 Comments ({activeComments[post.id]?.length || 0})
                        </Typography>

                        <Stack spacing={2} sx={{ mb: 2, maxHeight: 400, overflowY: 'auto' }}>
                          {activeComments[post.id]?.map((comment, idx) => (
                            <Fade key={comment.id} in timeout={300 + idx * 50}>
                              <Box
                                sx={{
                                  background: isDarkMode
                                    ? 'rgba(30, 30, 46, 0.7)'
                                    : 'rgba(255, 255, 255, 0.7)',
                                  backdropFilter: 'blur(10px)',
                                  borderRadius: '16px',
                                  p: 2,
                                  border: isDarkMode
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(255, 255, 255, 0.5)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: isDarkMode
                                      ? 'rgba(30, 30, 46, 0.9)'
                                      : 'rgba(255, 255, 255, 0.9)',
                                    transform: 'translateX(4px)'
                                  }
                                }}
                              >
                                <Stack direction="row" spacing={1.5}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      background: isDarkMode
                                        ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                                        : 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                                      fontSize: '14px',
                                      fontWeight: 700
                                    }}
                                  >
                                    {(comment.users?.name || 'U').charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ 
                                        fontWeight: 700, 
                                        color: theme.palette.text.primary, 
                                        mb: 0.5 
                                      }}
                                    >
                                      {comment.users?.name || 'User'}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ 
                                        color: theme.palette.text.secondary, 
                                        lineHeight: 1.5 
                                      }}
                                    >
                                      {comment.content}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            </Fade>
                          ))}
                        </Stack>

                        {/* Comment Input */}
                        <Stack direction="row" spacing={1}>
                          <GlassTextField
                            fullWidth
                            size="small"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handlePostComment(post.id);
                              }
                            }}
                          />
                          <IconButton
                            onClick={() => handlePostComment(post.id)}
                            sx={{
                              background: isDarkMode
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                                : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              color: 'white',
                              borderRadius: '12px',
                              '&:hover': {
                                background: isDarkMode
                                  ? 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'
                                  : 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Send sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Stack>
                      </GlassCommentBox>
                    </Collapse>
                  </CardContent>
                </GlassCard>
              </Slide>
            ))
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default CommunityPage;