import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

/* ─────────────────────────────────────────────
   Inline global styles injected once
───────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0d12;
      --surface: #111520;
      --surface2: #161b28;
      --surface3: #1d2438;
      --border: rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.12);
      --accent: #7c6af7;
      --accent2: #a78bfa;
      --accent-glow: rgba(124,106,247,0.25);
      --teal: #2dd4bf;
      --teal-glow: rgba(45,212,191,0.2);
      --amber: #f59e0b;
      --red: #f87171;
      --green: #4ade80;
      --text: #e8eaf0;
      --text2: #8892aa;
      --text3: #4a5568;
      --font-serif: 'DM Serif Display', serif;
      --font-sans: 'Outfit', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --r: 14px;
      --r-sm: 8px;
      --r-lg: 20px;
    }

    body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

    .bg-orb {
      position: fixed; border-radius: 50%; filter: blur(80px);
      pointer-events: none; z-index: 0; opacity: 0.35;
      animation: orbDrift 18s ease-in-out infinite alternate;
    }
    @keyframes orbDrift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(40px, -30px) scale(1.1); }
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover { border-color: var(--border2); }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      font-family: var(--font-sans); font-size: 14px; font-weight: 500;
      border: none; cursor: pointer; border-radius: var(--r-sm);
      transition: all 0.18s; white-space: nowrap;
    }
    .btn-primary {
      background: var(--accent); color: #fff;
      padding: 10px 20px;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .btn-primary:hover { background: var(--accent2); box-shadow: 0 0 30px var(--accent-glow); transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-ghost {
      background: transparent; color: var(--text2);
      border: 1px solid var(--border2);
      padding: 9px 18px;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }

    .btn-danger {
      background: rgba(248,113,113,0.1); color: var(--red);
      border: 1px solid rgba(248,113,113,0.25);
      padding: 9px 18px;
    }
    .btn-danger:hover { background: rgba(248,113,113,0.2); }

    .btn-teal {
      background: rgba(45,212,191,0.12); color: var(--teal);
      border: 1px solid rgba(45,212,191,0.25);
      padding: 9px 18px;
    }
    .btn-teal:hover { background: var(--teal-glow); }

    /* NEW: Submit button - distinct green style */
    .btn-submit {
      background: rgba(74,222,128,0.15); color: var(--green);
      border: 1px solid rgba(74,222,128,0.35);
      padding: 10px 20px;
      font-weight: 600;
    }
    .btn-submit:hover { background: rgba(74,222,128,0.25); box-shadow: 0 0 20px rgba(74,222,128,0.2); transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 500; padding: 3px 10px;
      border-radius: 99px; font-family: var(--font-mono);
    }
    .chip-accent { background: rgba(124,106,247,0.15); color: var(--accent2); border: 1px solid rgba(124,106,247,0.25); }
    .chip-teal   { background: rgba(45,212,191,0.12);  color: var(--teal);   border: 1px solid rgba(45,212,191,0.2); }
    .chip-amber  { background: rgba(245,158,11,0.12);  color: var(--amber);  border: 1px solid rgba(245,158,11,0.2); }
    .chip-red    { background: rgba(248,113,113,0.12); color: var(--red);    border: 1px solid rgba(248,113,113,0.25); }
    .chip-green  { background: rgba(74,222,128,0.12);  color: var(--green);  border: 1px solid rgba(74,222,128,0.2); }

    .form-label { font-size: 12px; font-weight: 500; color: var(--text2); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em; display: block; }
    .form-input {
      width: 100%; background: var(--surface2); border: 1px solid var(--border2);
      border-radius: var(--r-sm); padding: 10px 14px; color: var(--text);
      font-family: var(--font-sans); font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s; outline: none;
    }
    .form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
    .form-input::placeholder { color: var(--text3); }
    select.form-input option { background: var(--surface2); }
    textarea.form-input { resize: vertical; min-height: 80px; }

    .dialog-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: fadeIn 0.2s;
    }
    .dialog-box {
      background: var(--surface); border: 1px solid var(--border2);
      border-radius: var(--r-lg); width: 100%; max-width: 680px;
      max-height: 90vh; overflow-y: auto;
      animation: slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .dialog-box.wide { max-width: 900px; }

    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .progress-track { height: 4px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
    .progress-fill  { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--teal)); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }

    @keyframes pulse {
      0%   { box-shadow: 0 0 0 0 rgba(248,113,113,0.5); }
      70%  { box-shadow: 0 0 0 10px rgba(248,113,113,0); }
      100% { box-shadow: 0 0 0 0 rgba(248,113,113,0); }
    }
    .recording-ring { animation: pulse 1.4s ease-in-out infinite; }

    /* NEW: Interim text pulse animation */
    @keyframes interimPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .interim-text { animation: interimPulse 1.5s ease-in-out infinite; }

    .wave-bar { display: inline-block; width: 3px; border-radius: 99px; background: var(--teal); margin: 0 1.5px; animation: waveAnim 0.8s ease-in-out infinite alternate; }
    @keyframes waveAnim { from { height: 4px; } to { height: 22px; } }

    .spinner {
      width: 40px; height: 40px; border-radius: 50%;
      border: 3px solid var(--border2); border-top-color: var(--accent);
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .score-ring { transform: rotate(-90deg); }
    .score-ring circle { transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }

    .toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: var(--surface2); border: 1px solid var(--border2);
      border-radius: var(--r); padding: 12px 18px;
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; max-width: 340px;
      animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    @keyframes itemIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
    .t-item-enter { animation: itemIn 0.3s ease; }

    @keyframes revealUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .reveal { animation: revealUp 0.4s ease both; }
    .reveal-1 { animation-delay: 0.05s; }
    .reveal-2 { animation-delay: 0.12s; }
    .reveal-3 { animation-delay: 0.2s; }

    .divider { height: 1px; background: var(--border); margin: 20px 0; }

    .alert { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: var(--r-sm); font-size: 13px; }
    .alert-warning { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); color: var(--amber); }
    .alert-error   { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); color: var(--red); }
    .alert-info    { background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.2); color: var(--accent2); }

    .scroll-area { overflow-y: auto; }
    .scroll-area::-webkit-scrollbar { width: 3px; }

    .timer-critical { color: var(--red) !important; animation: timerPulse 1s ease-in-out infinite; }
    @keyframes timerPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
  `}</style>
);

const Waveform = ({ bars = 5, delay = 0 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', height: 24 }}>
    {Array.from({ length: bars }).map((_, i) => (
      <span key={i} className="wave-bar" style={{ animationDelay: `${delay + i * 0.12}s` }} />
    ))}
  </span>
);

const ScoreRing = ({ score, size = 120 }) => {
  const r = 46; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#f59e0b' : '#f87171';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle className="score-ring" cx="50" cy="50" r={r} fill="none" stroke={color}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="50" y="54" textAnchor="middle" fill={color}
        style={{ fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>
        {score}
      </text>
    </svg>
  );
};

const Toast = ({ message, type = 'info', onClose }) => {
  const icon = type === 'warning' ? '⚠' : type === 'error' ? '✕' : '✓';
  const col = type === 'warning' ? '#f59e0b' : type === 'error' ? '#f87171' : '#4ade80';
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="toast">
      <span style={{ color: col, fontSize: 16 }}>{icon}</span>
      <span style={{ color: 'var(--text)' }}>{message}</span>
    </div>
  );
};

const InterviewPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  // FIX 1: Split interim (live typing) and final spoken text for clear display
  const [interimText, setInterimText] = useState('');
  const [finalBuffer, setFinalBuffer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [proctorViolations, setProctorViolations] = useState(0);
  const [interviewTimeLeft, setInterviewTimeLeft] = useState(0);
  const [phase, setPhase] = useState('reading');
  const [textInputValue, setTextInputValue] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInterview, setNewInterview] = useState({
    title: '', description: '', job_role: '',
    experience_level: 'intermediate', duration_minutes: 30,
    questions: [{ question_text: '', question_type: 'behavioral' }],
  });

  const mediaRecorderRef = useRef(null);
  const activeStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const violationCountRef = useRef(0);
  const transcriptEndRef = useRef(null);
  const currentIndexRef = useRef(0);
  const selectedInterviewRef = useRef(null);
  const currentAttemptRef = useRef(null);
  const transcriptRef = useRef([]);
  const proctorRef = useRef(0);
  const handledNextRef = useRef(false);
  // FIX 1: ref to accumulate final speech across recognition cycles
  const finalBufferRef = useRef('');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const isAdmin = role === 'admin';

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => { currentIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
  useEffect(() => { selectedInterviewRef.current = selectedInterview; }, [selectedInterview]);
  useEffect(() => { currentAttemptRef.current = currentAttempt; }, [currentAttempt]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { proctorRef.current = proctorViolations; }, [proctorViolations]);

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

  useEffect(() => {
    fetchInterviews();
    if (token) { fetchMyAttempts(); }
  }, [token]);

  useEffect(() => {
    const handleVis = () => {
      if (document.visibilityState === 'hidden' && selectedInterviewRef.current) {
        violationCountRef.current += 1;
        setProctorViolations(violationCountRef.current);
        if (violationCountRef.current >= 2) autoSubmitDueToProctoring();
        else speak(`Warning: tab switch detected. ${2 - violationCountRef.current} more will auto-submit.`);
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/interviews`);
      setInterviews(data || []);
    } catch { setError('Failed to load interviews'); }
  };

  const fetchMyAttempts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/interview-attempts`, {
        headers: { Authorization: token },
      });
      setMyAttempts(data || []);
    } catch {}
  };

  const speak = (text) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05;
    synthRef.current.speak(u);
  };

  const handleCreateInterview = async () => {
    if (!newInterview.title || !newInterview.job_role || newInterview.questions.length === 0) {
      showToast('Title, job role and at least one question are required', 'warning'); return;
    }
    try {
      setLoading(true);
      await axios.post(`${backendUrl}/api/interviews`, newInterview, { headers: { Authorization: token } });
      showToast('Interview created successfully!', 'info');
      setShowCreateForm(false);
      setNewInterview({ title: '', description: '', job_role: '', experience_level: 'intermediate', duration_minutes: 30, questions: [{ question_text: '', question_type: 'behavioral' }] });
      fetchInterviews();
    } catch { showToast('Failed to create interview', 'error'); }
    finally { setLoading(false); }
  };

  const addQuestionField = () => setNewInterview(p => ({ ...p, questions: [...p.questions, { question_text: '', question_type: 'behavioral' }] }));
  const updateQuestion = (i, f, v) => { const q = [...newInterview.questions]; q[i][f] = v; setNewInterview({ ...newInterview, questions: q }); };
  const removeQuestion = (i) => { if (newInterview.questions.length === 1) return; setNewInterview(p => ({ ...p, questions: p.questions.filter((_, j) => j !== i) })); };

  const startInterview = async (interview) => {
    if (!token) { showToast('Please login to start an interview', 'warning'); return; }
    try {
      setLoading(true);
      const { data: attempt } = await axios.post(`${backendUrl}/api/interview-attempts/start`,
        { interview_id: interview.id }, { headers: { Authorization: token } });
      setSelectedInterview(interview);
      setCurrentAttempt(attempt);
      setCurrentQuestionIndex(0);
      currentIndexRef.current = 0;
      setTranscript([]);
      transcriptRef.current = [];
      setInterimText('');
      setFinalBuffer('');
      finalBufferRef.current = '';
      setReport(null);
      setIsEvaluating(false);
      setProctorViolations(0);
      violationCountRef.current = 0;
      handledNextRef.current = false;
      activeStreamRef.current = null;
      setPhase('reading');
      setInterviewTimeLeft(interview.duration_minutes * 60);
      speak(`Welcome to the AI mock interview for ${interview.title}. You have ${interview.duration_minutes} minutes. Let's begin.`);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setInterviewTimeLeft(prev => { if (prev <= 1) { autoSubmitDueToTimeUp(); return 0; } return prev - 1; });
      }, 1000);
      setTimeout(() => startQuestion(interview, 0), 4000);
    } catch { setError('Failed to start interview'); }
    finally { setLoading(false); }
  };

  const startQuestion = (interview, idx) => {
    setPhase('reading');
    // FIX 1: Clear both interim and final buffer when new question starts
    setInterimText('');
    setFinalBuffer('');
    finalBufferRef.current = '';
    handledNextRef.current = false;
    const q = interview.interview_questions[idx];
    speak(`Question ${idx + 1}: ${q.question_text}`);
    setTimeout(() => { setPhase('listening'); autoStartVoiceInput(interview, idx); }, 2200);
  };

  const autoStartVoiceInput = async (interview, idx) => {
    try {
      if (!activeStreamRef.current) {
        activeStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setIsRecording(true);

      const SRA = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SRA) { setError('Speech recognition is not supported in this browser. Try Chrome or Edge.'); return; }

      if (recognitionRef.current) {
        try { recognitionRef.current.onresult = null; recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SRA();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // FIX 1: Proper real-time display — show both accumulated final text AND live interim text
      recognition.onresult = (event) => {
        let newFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (newFinal) {
          // Accumulate finals in ref so it persists across re-renders
          finalBufferRef.current = (finalBufferRef.current + newFinal).trim();
          setFinalBuffer(finalBufferRef.current);
          setInterimText(''); // Clear interim once it becomes final
        } else {
          // Show live interim text while user is still speaking
          setInterimText(currentInterim);
        }
      };

      const handleResult = recognition.onresult;

      recognition.onerror = (e) => {
        if (e.error === 'aborted') return;

        if (e.error === 'no-speech') {
          if (handledNextRef.current) return;
          try { recognition.stop(); } catch {}
          setTimeout(() => {
            if (handledNextRef.current) return;
            const r2 = new SRA();
            recognitionRef.current = r2;
            r2.continuous = true; r2.interimResults = true; r2.lang = 'en-US';
            r2.onresult = handleResult;
            r2.onerror = recognition.onerror;
            try { r2.start(); } catch {}
          }, 300);
          return;
        }

        if (e.error === 'network') {
          console.warn('SpeechRecognition: network error — switching to text input mode');
          try { recognition.onresult = null; recognition.stop(); } catch {}
          setIsRecording(false);
          setPhase('text-fallback');
          return;
        }

        console.warn('SpeechRecognition error:', e.error);
        try { recognition.onresult = null; recognition.stop(); } catch {}
        setIsRecording(false);
        setPhase('text-fallback');
      };

      recognition.start();
    } catch (err) {
      console.error('Mic access error:', err);
      setError('Microphone error: ' + err.message);
    }
  };

  // FIX 2: Explicit submit current answer — user clicks "Submit Answer" button
  const submitCurrentAnswer = () => {
    const iv = selectedInterviewRef.current;
    const idx = currentIndexRef.current;
    if (!iv || handledNextRef.current) return;

    // Use whatever has been accumulated (final buffer + any remaining interim)
    const answer = (finalBufferRef.current + ' ' + interimText).trim();
    if (!answer) {
      showToast('Please speak your answer before submitting', 'warning');
      return;
    }

    handledNextRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.onresult = null; recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);

    const entry = { question: iv.interview_questions[idx].question_text, answer };
    setTranscript(prev => {
      const updated = [...prev, entry];
      transcriptRef.current = updated;
      return updated;
    });
    setInterimText('');
    setFinalBuffer('');
    finalBufferRef.current = '';

    setTimeout(() => handleAutoNext(iv, idx), 800);
  };

  const handleAutoNext = (interview, idx) => {
    if (recognitionRef.current) { try { recognitionRef.current.onresult = null; recognitionRef.current.stop(); } catch {} }
    setIsRecording(false);
    const next = idx + 1;
    if (next < interview.interview_questions.length) {
      setCurrentQuestionIndex(next);
      currentIndexRef.current = next;
      setTimeout(() => startQuestion(interview, next), 800);
    } else {
      setPhase('done');
      setTimeout(() => finishInterview(), 500);
    }
  };

  const skipQuestion = () => {
    if (!selectedInterviewRef.current) return;
    const iv = selectedInterviewRef.current;
    const idx = currentIndexRef.current;
    if (handledNextRef.current) return;
    handledNextRef.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setTranscript(prev => {
      const updated = [...prev, { question: iv.interview_questions[idx].question_text, answer: '[Skipped]' }];
      transcriptRef.current = updated;
      return updated;
    });
    setInterimText('');
    setFinalBuffer('');
    finalBufferRef.current = '';
    handleAutoNext(iv, idx);
  };

  const finishInterview = async () => {
    const attempt = currentAttemptRef.current;
    if (!attempt) return;
    setIsEvaluating(true);
    speak('Your interview is complete. Our AI is now evaluating your responses. This takes about 20 seconds.');
    cleanupRecording();
    try {
      const response = await axios.post(
        `${backendUrl}/api/interview-attempts/${attempt.id}/complete`,
        { transcript: transcriptRef.current, proctor_violations: proctorRef.current },
        { headers: { Authorization: token } }
      );
      setReport(response.data.ai_feedback || response.data);
      speak('Your performance report is ready!');
      fetchMyAttempts();
    } catch { setError('Failed to submit interview. Please check history for results.'); }
    finally {
      setIsEvaluating(false);
      setSelectedInterview(null);
      setCurrentAttempt(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // FIX 3: End Early now properly submits what's answered instead of just cancelling
  const handleEndEarly = () => {
    const answeredCount = transcriptRef.current.length;
    if (answeredCount === 0) {
      if (window.confirm('You haven\'t answered any questions. Abandon interview without generating a report?')) {
        cleanupAll();
      }
      return;
    }
    if (window.confirm(`Submit your ${answeredCount} answered question(s) now and get a partial performance report?`)) {
      // If user is mid-answer, capture whatever they've said so far
      const iv = selectedInterviewRef.current;
      const idx = currentIndexRef.current;
      const pendingAnswer = (finalBufferRef.current + ' ' + interimText).trim();
      if (pendingAnswer && iv && !handledNextRef.current) {
        const entry = { question: iv.interview_questions[idx].question_text, answer: pendingAnswer };
        transcriptRef.current = [...transcriptRef.current, entry];
      }
      finishInterview();
    }
  };

  const autoSubmitDueToProctoring = async () => {
    speak('Multiple violations detected. Submitting automatically.');
    cleanupRecording();
    const attempt = currentAttemptRef.current;
    if (attempt) {
      try {
        await axios.post(`${backendUrl}/api/interview-attempts/${attempt.id}/complete`,
          { transcript: transcriptRef.current, proctor_violations: proctorRef.current, status: 'abandoned' },
          { headers: { Authorization: token } });
      } catch {}
    }
    cleanupAll();
  };

  const autoSubmitDueToTimeUp = async () => {
    speak('Time is up. Submitting your interview.');
    await finishInterview();
  };

  const cleanupRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) { try { recognitionRef.current.onresult = null; recognitionRef.current.stop(); } catch {} }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }
    if (synthRef.current.speaking) synthRef.current.cancel();
  };

  const cleanupAll = () => {
    cleanupRecording();
    setSelectedInterview(null);
    setCurrentAttempt(null);
    setCurrentQuestionIndex(0);
    setTranscript([]);
    setInterimText('');
    setFinalBuffer('');
    finalBufferRef.current = '';
    setProctorViolations(0);
    setPhase('reading');
    violationCountRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const isCritical = interviewTimeLeft < 120;

  // Combined spoken text for display: finalized text + live interim
  const displaySpokenText = [finalBuffer, interimText].filter(Boolean).join(' ');

  return (
    <>
      <GlobalStyle />

      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #7c6af7 0%, transparent 70%)', top: -100, left: -100 }} />
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)', bottom: 100, right: -80, animationDelay: '9s', animationDirection: 'alternate-reverse' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>

        <div className="reveal" style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎙</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI Mock Interview</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, color: 'var(--text)', fontWeight: 400 }}>
            Practice. Evaluate.<br /><span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, var(--accent2), var(--teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Improve.</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 15, marginTop: 12, maxWidth: 480 }}>
            Voice-driven interviews evaluated by AI. Get scored feedback on every answer within seconds.
          </p>
        </div>

        {error && (
          <div className="alert alert-error reveal" style={{ marginBottom: 20 }}>
            <span>⚠</span>
            <div>{error} <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', marginLeft: 8, fontSize: 13 }}>Dismiss</button></div>
          </div>
        )}

        {isAdmin && (
          <button className="btn btn-primary reveal" style={{ marginBottom: 32 }} onClick={() => setShowCreateForm(true)}>
            <span>+</span> Create Interview
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span className="chip chip-accent">{interviews.length}</span>
            </div>

            {interviews.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎤</div>
                <p style={{ color: 'var(--text2)', fontSize: 14 }}>No interviews available yet.</p>
              </div>
            ) : (
              interviews.map((iv, idx) => (
                <div key={iv.id} className="card reveal" style={{ padding: '20px 24px', marginBottom: 16, animationDelay: `${0.05 * idx}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>{iv.title}</h3>
                      {iv.description && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{iv.description}</p>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <span className="chip chip-accent">💼 {iv.job_role}</span>
                        <span className="chip chip-teal">⏱ {iv.duration_minutes}m</span>
                        <span className="chip chip-amber">❓ {iv.interview_questions?.length || 0} Qs</span>
                        {iv.experience_level && <span className="chip chip-accent" style={{ textTransform: 'capitalize' }}>{iv.experience_level}</span>}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => startInterview(iv)} disabled={loading} style={{ flexShrink: 0 }}>
                      {loading ? '...' : 'Start'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>My History</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {myAttempts.length === 0 ? (
              <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                <p style={{ color: 'var(--text3)', fontSize: 14 }}>No interviews attempted yet.</p>
              </div>
            ) : (
              myAttempts.map((attempt, idx) => (
                <div key={attempt.id} className="card reveal" style={{ padding: '16px 20px', marginBottom: 12, animationDelay: `${0.08 * idx}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{attempt.interviews?.title || 'Interview'}</p>
                      <p style={{ fontSize: 12, color: 'var(--text2)' }}>{attempt.interviews?.job_role}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {attempt.overall_score != null ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: attempt.overall_score >= 75 ? 'var(--green)' : attempt.overall_score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                          {attempt.overall_score}
                        </span>
                      ) : (
                        <span className="chip chip-amber">Pending</span>
                      )}
                    </div>
                  </div>
                  {attempt.ai_feedback && (
                    <button className="btn btn-teal" style={{ marginTop: 10, width: '100%', fontSize: 12 }} onClick={() => setReport(attempt.ai_feedback)}>
                      View Report →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══════════════ ACTIVE INTERVIEW DIALOG ══════════════ */}
      {selectedInterview && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  {selectedInterview.job_role}
                </p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>
                  {selectedInterview.title}
                </h2>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>TIME LEFT</p>
                <span className={`${isCritical ? 'timer-critical' : ''}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: isCritical ? 'var(--red)' : 'var(--text)' }}>
                  {fmtTime(interviewTimeLeft)}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>QUESTION</p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent2)' }}>
                  {currentQuestionIndex + 1} <span style={{ color: 'var(--text3)' }}>/ {selectedInterview.interview_questions.length}</span>
                </span>
              </div>
            </div>

            <div style={{ padding: '0 28px' }}>
              <div className="progress-track" style={{ marginTop: 16 }}>
                <div className="progress-fill" style={{ width: `${((currentQuestionIndex + (phase === 'done' ? 1 : 0)) / selectedInterview.interview_questions.length) * 100}%` }} />
              </div>
            </div>

            <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Question card */}
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '20px', border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    Q{currentQuestionIndex + 1}
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, lineHeight: 1.5, color: 'var(--text)', fontWeight: 400 }}>
                    {selectedInterview.interview_questions[currentQuestionIndex]?.question_text}
                  </p>
                </div>

                {/* FIX 1: Recording status with proper real-time text display */}
                <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r)', padding: '16px 20px', border: phase === 'listening' ? '1px solid rgba(45,212,191,0.3)' : '1px solid var(--border)', transition: 'border-color 0.3s', minHeight: 130 }}>
                  {phase === 'reading' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text2)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.4s infinite' }} />
                      <span style={{ fontSize: 14 }}>AI is reading the question aloud...</span>
                    </div>
                  )}

                  {phase === 'listening' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div className="recording-ring" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: 'var(--teal)' }}>Listening — speak your answer</span>
                        <Waveform bars={6} />
                      </div>

                      {/* FIX 1: Live transcript display box */}
                      <div style={{
                        minHeight: 56,
                        background: 'rgba(124,106,247,0.06)',
                        borderRadius: 8,
                        padding: '10px 14px',
                        borderLeft: '2px solid var(--accent)',
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--text)',
                      }}>
                        {displaySpokenText ? (
                          <>
                            {/* Finalized text in solid color */}
                            {finalBuffer && (
                              <span style={{ color: 'var(--text)' }}>{finalBuffer} </span>
                            )}
                            {/* Interim (still-being-spoken) text dimmed and pulsing */}
                            {interimText && (
                              <span className="interim-text" style={{ color: 'var(--text2)', fontStyle: 'italic' }}>
                                {interimText}
                              </span>
                            )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>
                            Start speaking — your words will appear here in real time...
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {phase === 'text-fallback' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--amber)' }}>⚠ Voice unavailable — type your answer below</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                        Speech recognition needs internet access to Google servers. You can type your answer instead.
                      </p>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Type your answer here..."
                        value={textInputValue}
                        onChange={e => setTextInputValue(e.target.value)}
                        style={{ marginBottom: 8 }}
                        autoFocus
                      />
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: 13 }}
                        onClick={() => {
                          if (!textInputValue.trim()) return;
                          const iv = selectedInterviewRef.current;
                          const idx = currentIndexRef.current;
                          const entry = { question: iv.interview_questions[idx].question_text, answer: textInputValue.trim() };
                          setTranscript(prev => {
                            const updated = [...prev, entry];
                            transcriptRef.current = updated;
                            return updated;
                          });
                          setTextInputValue('');
                          setPhase('reading');
                          handleAutoNext(iv, idx);
                        }}
                      >
                        Submit Answer →
                      </button>
                    </>
                  )}

                  {phase === 'done' && (
                    <p style={{ fontSize: 14, color: 'var(--green)' }}>✓ All questions answered</p>
                  )}
                </div>

                {/* FIX 2 & 3: Action buttons — Submit Answer + Skip + End Early */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                  {/* FIX 2: Prominent Submit Answer button when listening */}
                  {phase === 'listening' && (
                    <button
                      className="btn btn-submit"
                      style={{ width: '100%', fontSize: 14, padding: '12px 20px' }}
                      onClick={submitCurrentAnswer}
                      disabled={!displaySpokenText}
                    >
                      ✓ Submit Answer
                      {currentQuestionIndex < selectedInterview.interview_questions.length - 1
                        ? ' → Next Question'
                        : ' → Finish Interview'}
                    </button>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    {/* Skip only shows during listening/text-fallback */}
                    {(phase === 'listening' || phase === 'text-fallback') && (
                      <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={skipQuestion}>
                        Skip Question →
                      </button>
                    )}

                    {/* FIX 3: End Early now properly submits via handleEndEarly */}
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1, fontSize: 13 }}
                      onClick={handleEndEarly}
                    >
                      {transcript.length > 0 ? '⬆ Submit & End Early' : '✕ Abandon Interview'}
                    </button>
                  </div>
                </div>

                {proctorViolations > 0 && (
                  <div className="alert alert-warning">
                    <span>⚠</span>
                    <span>Proctoring violation {proctorViolations}/2 — switching tabs again will auto-submit</span>
                  </div>
                )}
              </div>

              {/* Right — running transcript */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Transcript</p>
                  <span className="chip chip-teal">{transcript.length} answered</span>
                </div>

                <div className="scroll-area" style={{ flex: 1, maxHeight: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {transcript.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                      Your answered questions will appear here as you submit each one.
                    </div>
                  ) : (
                    transcript.map((entry, i) => (
                      <div key={i} className="t-item-enter" style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>Q{i + 1}: {entry.question}</p>
                        <p style={{ fontSize: 13, color: entry.answer === '[Skipped]' ? 'var(--text3)' : 'var(--text)', lineHeight: 1.5 }}>
                          {entry.answer === '[Skipped]' ? <em>Skipped</em> : entry.answer}
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ EVALUATING DIALOG ══════════════ */}
      {isEvaluating && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="spinner" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, color: 'var(--text)', marginBottom: 10 }}>
                Evaluating your responses
              </h2>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
                Our AI is reading your full transcript, scoring each answer, and generating a detailed performance report.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <Waveform bars={7} delay={0} />
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: 20 }}>
              <span>⏱</span>
              <div>
                <strong>Estimated wait: 15–30 seconds</strong>
                <p style={{ fontSize: 12, marginTop: 3, color: 'var(--text2)' }}>
                  You can safely close this page. Your report will appear in <strong>My History</strong> once ready.
                </p>
              </div>
            </div>

            {transcriptRef.current.length > 0 && (
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Your transcript — {transcriptRef.current.length} questions
                </p>
                <div className="scroll-area" style={{ maxHeight: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {transcriptRef.current.map((entry, i) => (
                    <div key={i} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Q{i + 1}: {entry.question}</p>
                      <p style={{ fontSize: 13, color: entry.answer === '[Skipped]' ? 'var(--text3)' : 'var(--text)', lineHeight: 1.5 }}>
                        {entry.answer === '[Skipped]' ? <em>Skipped</em> : entry.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ REPORT DIALOG ══════════════ */}
      {report && !isEvaluating && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ padding: '28px 32px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <ScoreRing score={report.overall_score || 0} size={110} />
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Interview Complete</p>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>Performance Report</h2>
                {report.summary && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 440 }}>{report.summary}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Strengths', content: report.strengths, color: 'var(--green)', bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', icon: '✦' },
                { label: 'Weaknesses', content: report.weaknesses, color: 'var(--red)', bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.2)', icon: '△' },
                { label: 'Suggestions', content: report.suggestions, color: 'var(--accent2)', bg: 'rgba(124,106,247,0.06)', border: 'rgba(124,106,247,0.15)', icon: '◇' },
              ].map(({ label, content, color, bg, border, icon }) => (
                <div key={label} style={{ background: bg, borderRadius: 'var(--r)', padding: '16px 18px', border: `1px solid ${border}` }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                    {icon} {label}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{content || '—'}</p>
                </div>
              ))}
            </div>

            {report.per_question && report.per_question.length > 0 && (
              <>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Question Breakdown</p>
                <div className="scroll-area" style={{ maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {report.per_question.map((pq, i) => {
                    const sc = pq.score || 0;
                    const col = sc >= 75 ? 'var(--green)' : sc >= 50 ? 'var(--amber)' : 'var(--red)';
                    return (
                      <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: col }}>{sc}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>/100</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Q{i + 1}: {pq.question}</p>
                          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{pq.feedback}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setReport(null)}>
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* ══════════════ CREATE INTERVIEW DIALOG (ADMIN) ══════════════ */}
      {showCreateForm && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--text)' }}>Create Interview</h2>
              <button className="btn btn-ghost" onClick={() => setShowCreateForm(false)} style={{ padding: '6px 12px' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Interview Title', key: 'title', type: 'text' },
                { label: 'Job Role', key: 'job_role', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" value={newInterview[key]} onChange={e => setNewInterview({ ...newInterview, [key]: e.target.value })} placeholder={label} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" value={newInterview.description} onChange={e => setNewInterview({ ...newInterview, description: e.target.value })} placeholder="Brief description..." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <label className="form-label">Experience Level</label>
                <select className="form-input" value={newInterview.experience_level} onChange={e => setNewInterview({ ...newInterview, experience_level: e.target.value })}>
                  {['beginner', 'intermediate', 'advanced', 'expert'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={newInterview.duration_minutes} onChange={e => setNewInterview({ ...newInterview, duration_minutes: parseInt(e.target.value) })} min={5} max={120} />
              </div>
            </div>

            <div className="divider" />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Questions</p>

            <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {newInterview.questions.map((q, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: 'var(--r-sm)', padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>Question {i + 1}</span>
                    {newInterview.questions.length > 1 && (
                      <button onClick={() => removeQuestion(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                    )}
                  </div>
                  <textarea className="form-input" value={q.question_text} onChange={e => updateQuestion(i, 'question_text', e.target.value)} placeholder="Enter question..." style={{ marginBottom: 10 }} />
                  <select className="form-input" value={q.question_type} onChange={e => updateQuestion(i, 'question_type', e.target.value)}>
                    {['behavioral', 'technical', 'system_design', 'hr'].map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={addQuestionField}>+ Add Question</button>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleCreateInterview} disabled={loading}>
                {loading ? 'Creating...' : 'Create Interview'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default InterviewPage;