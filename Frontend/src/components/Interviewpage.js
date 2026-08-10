import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { getCurrencyByCountry } from './getCurrencyByCountry';
import AIAvatar from './AIAvatar';

/* ─── CSS Variables + Global Styles ─────────────────────────────────────── */
const GlobalStyle = ({ darkMode: dm }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:${dm?'#0a0d12':'#eef0f7'};--surface:${dm?'#111520':'#fff'};--surface2:${dm?'#161b28':'#f4f5fb'};
      --surface3:${dm?'#1d2438':'#e8eaf4'};--border:${dm?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)'};
      --border2:${dm?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.14)'};
      --text:${dm?'#e8eaf0':'#1a1d2e'};--text2:${dm?'#8892aa':'#4a5270'};--text3:${dm?'#4a5568':'#9098b5'};
      --accent:#7c6af7;--accent2:#a78bfa;--glow:rgba(124,106,247,0.25);
      --teal:#2dd4bf;--tglow:rgba(45,212,191,0.2);--amber:#f59e0b;--red:#f87171;--green:#4ade80;
      --fs:'DM Serif Display',serif;--fm:'Outfit',sans-serif;--fmo:'DM Mono',monospace;
      --r:14px;--rsm:8px;--rlg:20px;
    }
    body{background:var(--bg);color:var(--text);font-family:var(--fm)}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:99px}
    .bg-orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;
      opacity:${dm?'0.35':'0.18'};animation:orbDrift 18s ease-in-out infinite alternate}
    @keyframes orbDrift{from{transform:translate(0,0) scale(1)}to{transform:translate(40px,-30px) scale(1.1)}}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--rlg);
      transition:border-color .2s,transform .2s;${!dm?'box-shadow:0 2px 16px rgba(0,0,0,0.06)':''}}
    .card:hover{border-color:var(--border2)}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--fm);
      font-size:14px;font-weight:500;border:none;cursor:pointer;border-radius:var(--rsm);
      transition:all .18s;white-space:nowrap}
    .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;box-shadow:none!important}
    .btn-primary{background:var(--accent);color:#fff;padding:10px 20px;box-shadow:0 0 20px var(--glow)}
    .btn-primary:hover{background:var(--accent2);box-shadow:0 0 30px var(--glow);transform:translateY(-1px)}
    .btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2);padding:9px 18px}
    .btn-ghost:hover{border-color:var(--accent);color:var(--accent);background:var(--glow)}
    .btn-danger{background:rgba(248,113,113,.1);color:var(--red);border:1px solid rgba(248,113,113,.25);padding:9px 18px}
    .btn-danger:hover{background:rgba(248,113,113,.2)}
    .btn-teal{background:rgba(45,212,191,.12);color:var(--teal);border:1px solid rgba(45,212,191,.25);padding:9px 18px}
    .btn-teal:hover{background:var(--tglow)}
    .btn-amber{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.3);padding:10px 20px;font-weight:600}
    .btn-amber:hover{background:rgba(245,158,11,.22);box-shadow:0 0 20px rgba(245,158,11,.2);transform:translateY(-1px)}
    .btn-submit{background:rgba(74,222,128,.15);color:var(--green);border:1px solid rgba(74,222,128,.35);padding:10px 20px;font-weight:600}
    .btn-submit:hover{background:rgba(74,222,128,.25);box-shadow:0 0 20px rgba(74,222,128,.2);transform:translateY(-1px)}
    .chip{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:500;padding:3px 10px;
      border-radius:99px;font-family:var(--fmo)}
    .chip-accent{background:rgba(124,106,247,.15);color:var(--accent2);border:1px solid rgba(124,106,247,.25)}
    .chip-teal{background:rgba(45,212,191,.12);color:var(--teal);border:1px solid rgba(45,212,191,.2)}
    .chip-amber{background:rgba(245,158,11,.12);color:var(--amber);border:1px solid rgba(245,158,11,.2)}
    .chip-red{background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.25)}
    .chip-green{background:rgba(74,222,128,.12);color:var(--green);border:1px solid rgba(74,222,128,.2)}
    .chip-paid{background:rgba(245,158,11,.18);color:var(--amber);border:1px solid rgba(245,158,11,.4);font-weight:600}
    .chip-unlocked{background:rgba(74,222,128,.15);color:var(--green);border:1px solid rgba(74,222,128,.35);font-weight:600}
    .form-label{font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px;
      text-transform:uppercase;letter-spacing:.06em;display:block}
    .form-input{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--rsm);
      padding:10px 14px;color:var(--text);font-family:var(--fm);font-size:14px;
      transition:border-color .2s,box-shadow .2s;outline:none}
    .form-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--glow)}
    .form-input::placeholder{color:var(--text3)}
    select.form-input option{background:var(--surface2);color:var(--text)}
    textarea.form-input{resize:vertical;min-height:80px}
    .dialog-overlay{position:fixed;inset:0;z-index:1200;
      background:${dm?'rgba(0,0,0,0.78)':'rgba(15,15,40,0.55)'};backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;padding:80px 20px 20px;
      animation:fadeIn .2s;overflow-y:auto}
    .dialog-box{background:var(--surface);border:1px solid var(--border2);border-radius:var(--rlg);
      width:100%;max-width:680px;max-height:calc(100vh - 100px);overflow-y:auto;
      animation:slideUp .25s cubic-bezier(.34,1.56,.64,1);
      box-shadow:${dm?'0 24px 64px rgba(0,0,0,0.5)':'0 24px 64px rgba(0,0,0,0.18)'}}
    .dialog-box.wide{max-width:960px}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .progress-track{height:4px;background:var(--surface3);border-radius:99px;overflow:hidden}
    .progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--teal));transition:width .5s cubic-bezier(.4,0,.2,1)}
    @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(248,113,113,.5)}70%{box-shadow:0 0 0 10px rgba(248,113,113,0)}100%{box-shadow:0 0 0 0 rgba(248,113,113,0)}}
    .recording-ring{animation:pulse 1.4s ease-in-out infinite}
    @keyframes interimPulse{0%,100%{opacity:1}50%{opacity:.7}}
    .interim-text{animation:interimPulse 1.5s ease-in-out infinite}
    .wave-bar{display:inline-block;width:3px;border-radius:99px;background:var(--teal);margin:0 1.5px;animation:waveAnim .8s ease-in-out infinite alternate}
    @keyframes waveAnim{from{height:4px}to{height:22px}}
    .score-ring circle{transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)}
    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--surface2);
      border:1px solid var(--border2);border-radius:var(--r);padding:12px 18px;
      display:flex;align-items:center;gap:10px;font-size:14px;max-width:340px;
      animation:toastIn .3s cubic-bezier(.34,1.56,.64,1);box-shadow:0 8px 32px rgba(0,0,0,.4)}
    @keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes itemIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    .t-item-enter{animation:itemIn .3s ease}
    @keyframes revealUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    .reveal{animation:revealUp .4s ease both}
    .reveal-1{animation-delay:.05s}.reveal-2{animation-delay:.12s}.reveal-3{animation-delay:.2s}
    .divider{height:1px;background:var(--border);margin:20px 0}
    .alert{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-radius:var(--rsm);font-size:13px}
    .alert-warning{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:var(--amber)}
    .alert-error{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:var(--red)}
    .alert-info{background:rgba(124,106,247,.1);border:1px solid rgba(124,106,247,.2);color:var(--accent2)}
    .scroll-area{overflow-y:auto}.scroll-area::-webkit-scrollbar{width:3px}
    .timer-critical{color:var(--red)!important;animation:timerPulse 1s ease-in-out infinite}
    @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.6}}
  `}</style>
);

/* ─── Small reusable components ──────────────────────────────────────────── */
const Waveform = ({ bars = 5, delay = 0 }) => (
  <span style={{ display:'inline-flex', alignItems:'center', height:24 }}>
    {Array.from({ length: bars }).map((_, i) => (
      <span key={i} className="wave-bar" style={{ animationDelay:`${delay + i * 0.12}s` }} />
    ))}
  </span>
);

const ScoreRing = ({ score, size = 120 }) => {
  const r = 46, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#4ade80' : score >= 50 ? '#f59e0b' : '#f87171';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50" y="54" textAnchor="middle" fill={color}
        style={{ fontSize:22, fontWeight:600, fontFamily:'DM Mono, monospace' }}>{score}</text>
    </svg>
  );
};

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const [icon, col] = type === 'warning' ? ['⚠','#f59e0b'] : type === 'error' ? ['✕','#f87171'] : ['✓','#4ade80'];
  return (
    <div className="toast">
      <span style={{ color: col, fontSize:16 }}>{icon}</span>
      <span style={{ color:'var(--text)' }}>{message}</span>
    </div>
  );
};

const currencySymbol = c => ({ INR:'₹', USD:'$', GBP:'£', EUR:'€' }[c] || c);

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
const InterviewPage = () => {
  const { darkMode = false } = useOutletContext() || {};

  const [interviews,        setInterviews]        = useState([]);
  const [myAttempts,        setMyAttempts]        = useState([]);
  const [accessMap,         setAccessMap]         = useState({});
  const [accessLoading,     setAccessLoading]     = useState({});
  const [cartLoading,       setCartLoading]       = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [currentAttempt,    setCurrentAttempt]    = useState(null);
  const [currentQIdx,       setCurrentQIdx]       = useState(0);
  const [isRecording,       setIsRecording]       = useState(false);
  const [transcript,        setTranscript]        = useState([]);
  const [interimText,       setInterimText]       = useState('');
  const [finalBuffer,       setFinalBuffer]       = useState('');
  const [loading,           setLoading]           = useState(false);
  const [isEvaluating,      setIsEvaluating]      = useState(false);
  const [report,            setReport]            = useState(null);
  const [error,             setError]             = useState(null);
  const [toast,             setToast]             = useState(null);
  const [proctorViol,       setProctorViol]       = useState(0);
  const [timeLeft,          setTimeLeft]          = useState(0);
  const [phase,             setPhase]             = useState('reading');
  const [textInput,         setTextInput]         = useState('');
  const [showCreateForm,    setShowCreateForm]    = useState(false);
  const [userCurrency,      setUserCurrency]      = useState('INR');
  const [avatarState,       setAvatarState]       = useState('idle');
  const [editingId,         setEditingId]         = useState(null);
  const [deleteLoading,     setDeleteLoading]     = useState({});
  const [newInterview,      setNewInterview]      = useState({
    title:'', description:'', job_role:'', experience_level:'intermediate',
    duration_minutes:30, pricing_type:'free',
    prices:{ INR:299, USD:4, GBP:3, EUR:2 },
    questions:[{ question_text:'', question_type:'behavioral' }],
  });

  // Refs
  const streamRef       = useRef(null);
  const recognitionRef  = useRef(null);
  const synthRef        = useRef(window.speechSynthesis);
  const timerRef        = useRef(null);
  const violRef         = useRef(0);
  const transcriptEnd   = useRef(null);
  const qIdxRef         = useRef(0);
  const ivRef           = useRef(null);
  const attemptRef      = useRef(null);
  const transcriptRef   = useRef([]);
  const handledRef      = useRef(false);
  const finalRef        = useRef('');
  const voiceRef        = useRef(null);
  // KEY FIX: track committed result index to avoid re-processing on restart
  const lastResultIdx   = useRef(0);
  // KEY FIX: whether recognition stop was intentional (no restart needed)
  const intentionalStop = useRef(false);

  const token      = localStorage.getItem('token');
  const role       = localStorage.getItem('role');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  const isAdmin    = role === 'admin';
  const showToast  = (msg, type = 'info') => setToast({ message: msg, type });

  // Sync refs
  useEffect(() => { qIdxRef.current      = currentQIdx;        }, [currentQIdx]);
  useEffect(() => { ivRef.current        = selectedInterview;  }, [selectedInterview]);
  useEffect(() => { attemptRef.current   = currentAttempt;     }, [currentAttempt]);
  useEffect(() => { transcriptRef.current = transcript;        }, [transcript]);
  useEffect(() => { transcriptEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [transcript]);

  // Avatar ↔ phase
  useEffect(() => {
    setAvatarState(phase === 'reading' ? 'speaking' : phase === 'listening' ? 'listening' : phase === 'done' ? 'thinking' : 'idle');
  }, [phase]);

  // Geo detection
  useEffect(() => {
    const saved = localStorage.getItem('userCurrency');
    if (saved) { setUserCurrency(saved); return; }
    axios.get('https://ipapi.co/json/')
      .then(({ data }) => {
        const cur = getCurrencyByCountry(data.country_code || 'IN');
        localStorage.setItem('userCurrency', cur);
        localStorage.setItem('userCountry', data.country_code || 'IN');
        setUserCurrency(cur);
      })
      .catch(() => { localStorage.setItem('userCurrency','INR'); });
  }, []);

  // Fetch on mount
  useEffect(() => { fetchInterviews(); if (token) fetchMyAttempts(); }, [token]);
  useEffect(() => {
    if (!token || !interviews.length) return;
    interviews.forEach(iv => { if (iv.pricing_type === 'paid') checkAccess(iv.id); });
  }, [interviews, token]);

  // Voice selection
  useEffect(() => {
    const pick = () => {
      const voices = synthRef.current.getVoices();
      if (!voices.length) return;
      const preferred = [
        'Google UK English Female','Google US English','Google UK English Male',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Jenny Online (Natural) - English (United States)',
        'Samantha','Karen','Moira',
      ];
      let v = preferred.reduce((found, name) => found || voices.find(v => v.name === name), null)
        || voices.find(v => v.lang.startsWith('en') && /female/i.test(v.name))
        || voices.find(v => v.lang.startsWith('en'));
      voiceRef.current = v || null;
    };
    pick();
    synthRef.current.addEventListener('voiceschanged', pick);
    return () => synthRef.current.removeEventListener('voiceschanged', pick);
  }, []);

  // Proctoring
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'hidden' || !ivRef.current) return;
      violRef.current += 1;
      setProctorViol(violRef.current);
      if (violRef.current >= 2) autoSubmitProctor();
      else speak(`Warning: tab switch ${violRef.current}/2. One more auto-submits.`);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  /* ─── API ──────────────────────────────────────────────────────────────── */
  const fetchInterviews = async () => {
    try { const { data } = await axios.get(`${backendUrl}/api/interviews`); setInterviews(data || []); }
    catch { setError('Failed to load interviews'); }
  };
  const fetchMyAttempts = async () => {
    try { const { data } = await axios.get(`${backendUrl}/api/interview-attempts`, { headers:{ Authorization:token } }); setMyAttempts(data || []); }
    catch { }
  };
  const checkAccess = async (id) => {
    setAccessLoading(p => ({ ...p, [id]:true }));
    try { const { data } = await axios.get(`${backendUrl}/api/interviews/${id}/access`, { headers:{ Authorization:token } }); setAccessMap(p => ({ ...p, [id]:data.hasAccess })); }
    catch { setAccessMap(p => ({ ...p, [id]:false })); }
    finally { setAccessLoading(p => ({ ...p, [id]:false })); }
  };
  const handleAddToCart = async (iv) => {
    if (!token) { showToast('Please login to purchase','warning'); return; }
    setCartLoading(p => ({ ...p, [iv.id]:true }));
    try {
      await axios.post(`${backendUrl}/api/user/cart/add-interview`, { interviewId:iv.id, currency:userCurrency }, { headers:{ Authorization:token } });
      showToast('Interview added to cart!','info');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to add to cart';
      showToast(msg, msg.toLowerCase().includes('already') ? 'warning' : 'error');
    } finally { setCartLoading(p => ({ ...p, [iv.id]:false })); }
  };

  /* ─── TTS ──────────────────────────────────────────────────────────────── */
  const speak = (text, onDone) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    setAvatarState('speaking');
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
    const next = (i) => {
      if (i >= sentences.length) { setAvatarState('idle'); onDone?.(); return; }
      const s = sentences[i].trim();
      if (!s) { next(i + 1); return; }
      const u = new SpeechSynthesisUtterance(s);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 0.92; u.pitch = 1.0; u.volume = 1.0;
      u.onend = () => setTimeout(() => next(i + 1), 130);
      synthRef.current.speak(u);
    };
    next(0);
  };

  /* ─── Price/card helpers ───────────────────────────────────────────────── */
  const getPriceDisplay = (iv) => {
    if (iv.pricing_type === 'free') return null;
    const amt = iv.prices?.[userCurrency] || iv.prices?.['INR'];
    if (!amt) return null;
    return `${currencySymbol(iv.prices?.[userCurrency] ? userCurrency : 'INR')}${amt}`;
  };

  const renderCardAction = (iv) => {
    const isPaid = iv.pricing_type === 'paid';
    if (!token) return <button className="btn btn-ghost" style={{ flexShrink:0 }} onClick={() => showToast('Please login to continue','warning')}>Login</button>;
    if (!isPaid || accessMap[iv.id]) return <button className="btn btn-primary" style={{ flexShrink:0 }} onClick={() => startInterview(iv)} disabled={loading}>{loading ? '…' : 'Start →'}</button>;
    if (accessLoading[iv.id]) return <button className="btn btn-ghost" style={{ flexShrink:0 }} disabled><span style={{ opacity:.5,fontSize:13 }}>Checking…</span></button>;
    return <button className="btn btn-amber" style={{ flexShrink:0,fontSize:13,padding:'9px 16px' }} onClick={() => handleAddToCart(iv)} disabled={cartLoading[iv.id]}>{cartLoading[iv.id] ? '…' : '🛒 Add to Cart'}</button>;
  };

  /* ─── Admin: Create / Edit / Delete Interview ──────────────────────────── */
  const emptyInterviewForm = () => ({
    title:'', description:'', job_role:'', experience_level:'intermediate',
    duration_minutes:30, pricing_type:'free',
    prices:{ INR:299, USD:4, GBP:3, EUR:2 },
    questions:[{ question_text:'', question_type:'behavioral' }],
  });

  const openCreateForm = () => {
    setEditingId(null);
    setNewInterview(emptyInterviewForm());
    setShowCreateForm(true);
  };

  const openEditForm = (iv) => {
    setEditingId(iv.id);
    setNewInterview({
      title: iv.title || '',
      description: iv.description || '',
      job_role: iv.job_role || '',
      experience_level: iv.experience_level || 'intermediate',
      duration_minutes: iv.duration_minutes || 30,
      pricing_type: iv.pricing_type || 'free',
      prices: iv.prices && Object.keys(iv.prices).length ? iv.prices : { INR:299, USD:4, GBP:3, EUR:2 },
      questions: (iv.interview_questions && iv.interview_questions.length)
        ? iv.interview_questions.map(q => ({ id:q.id, question_text:q.question_text, question_type:q.question_type || 'behavioral' }))
        : [{ question_text:'', question_type:'behavioral' }],
    });
    setShowCreateForm(true);
  };

  const closeInterviewForm = () => {
    setShowCreateForm(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newInterview.title || !newInterview.job_role || !newInterview.questions.length) {
      showToast('Title, job role and at least one question required','warning'); return;
    }
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${backendUrl}/api/interviews/${editingId}`, newInterview, { headers:{ Authorization:token } });
        showToast('Interview updated!','info');
      } else {
        await axios.post(`${backendUrl}/api/interviews`, newInterview, { headers:{ Authorization:token } });
        showToast('Interview created!','info');
      }
      setShowCreateForm(false);
      setEditingId(null);
      setNewInterview(emptyInterviewForm());
      fetchInterviews();
    } catch { showToast(editingId ? 'Failed to update interview' : 'Failed to create interview','error'); }
    finally { setLoading(false); }
  };

  const handleDeleteInterview = async (iv) => {
    if (!window.confirm(`Delete "${iv.title}"? This cannot be undone.`)) return;
    setDeleteLoading(p => ({ ...p, [iv.id]:true }));
    try {
      await axios.delete(`${backendUrl}/api/interviews/${iv.id}`, { headers:{ Authorization:token } });
      showToast('Interview deleted','info');
      fetchInterviews();
    } catch { showToast('Failed to delete interview','error'); }
    finally { setDeleteLoading(p => ({ ...p, [iv.id]:false })); }
  };

  const addQ    = () => setNewInterview(p => ({ ...p, questions:[...p.questions, {question_text:'',question_type:'behavioral'}] }));
  const updQ    = (i,f,v) => { const q=[...newInterview.questions]; q[i][f]=v; setNewInterview({...newInterview,questions:q}); };
  const removeQ = (i) => { if (newInterview.questions.length<2) return; setNewInterview(p=>({...p,questions:p.questions.filter((_,j)=>j!==i)})); };

  /* ════════════════════════════════════════════════════════════════════════
     INTERVIEW FLOW
  ════════════════════════════════════════════════════════════════════════ */
  const startInterview = async (iv) => {
    if (!token) { showToast('Please login','warning'); return; }
    if (iv.pricing_type === 'paid' && !accessMap[iv.id]) { showToast('Purchase this interview first','warning'); return; }
    try {
      setLoading(true);
      const { data: attempt } = await axios.post(`${backendUrl}/api/interview-attempts/start`, { interview_id:iv.id }, { headers:{ Authorization:token } });
      setSelectedInterview(iv); ivRef.current = iv;
      setCurrentAttempt(attempt); attemptRef.current = attempt;
      setCurrentQIdx(0); qIdxRef.current = 0;
      setTranscript([]); transcriptRef.current = [];
      setInterimText(''); setFinalBuffer(''); finalRef.current = '';
      setReport(null); setIsEvaluating(false);
      setProctorViol(0); violRef.current = 0;
      handledRef.current = false;
      setPhase('reading'); setAvatarState('speaking');
      setTimeLeft(iv.duration_minutes * 60);
      speak(`Welcome to the mock interview for ${iv.title}. You have ${iv.duration_minutes} minutes. Let's get started.`);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(p => { if (p <= 1) { autoSubmitTime(); return 0; } return p - 1; });
      }, 1000);
      setTimeout(() => startQuestion(iv, 0), 4000);
    } catch { setError('Failed to start interview'); }
    finally { setLoading(false); }
  };

  const startQuestion = (iv, idx) => {
    setPhase('reading'); setAvatarState('speaking');
    setInterimText(''); setFinalBuffer(''); finalRef.current = '';
    handledRef.current = false;
    lastResultIdx.current = 0; // reset per question
    speak(
      `Question ${idx + 1}: ${iv.interview_questions[idx].question_text}`,
      () => { setPhase('listening'); setAvatarState('listening'); startVoiceInput(iv, idx); }
    );
  };

  /* ════════════════════════════════════════════════════════════════════════
     ACCURATE SPEECH RECOGNITION
     Fixes vs. original:
     1. lastResultIdx tracks which results were already committed — restart
        resets resultIndex to 0 but we skip anything below lastResultIdx.
     2. intentionalStop flag: prevents onend from restarting after a deliberate stop.
     3. Pick highest-confidence alternative on final results.
     4. No-speech & network errors restart silently without resetting buffer.
     5. Accumulated finals across restarts never lost.
  ════════════════════════════════════════════════════════════════════════ */
  const startVoiceInput = async (iv, idx) => {
    try {
      if (!streamRef.current) streamRef.current = await navigator.mediaDevices.getUserMedia({ audio:true });
      setIsRecording(true);
      const SRA = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SRA) { setError('Speech recognition not supported. Use Chrome or Edge.'); setPhase('text-fallback'); setIsRecording(false); return; }

      const launch = (retries = 0) => {
        if (handledRef.current) return;

        // Stop any existing instance cleanly
        if (recognitionRef.current) {
          intentionalStop.current = true;
          try { recognitionRef.current.onresult = null; recognitionRef.current.onend = null; recognitionRef.current.stop(); } catch { }
        }

        intentionalStop.current = false;
        const rec = new SRA();
        recognitionRef.current = rec;
        rec.continuous      = true;
        rec.interimResults  = true;
        rec.lang            = 'en-US';
        rec.maxAlternatives = 3;

        rec.onresult = (e) => {
          let newFinals = '';
          let latestInterim = '';

          for (let i = e.resultIndex; i < e.results.length; i++) {
            // KEY FIX: skip results we've already committed in a previous recognition instance
            if (i < lastResultIdx.current) continue;

            const result = e.results[i];
            if (result.isFinal) {
              // KEY FIX: pick highest-confidence alternative
              let best = result[0].transcript, bestConf = result[0].confidence ?? 0;
              for (let a = 1; a < result.length; a++) {
                if ((result[a].confidence ?? 0) > bestConf) { bestConf = result[a].confidence; best = result[a].transcript; }
              }
              newFinals += best + ' ';
              lastResultIdx.current = i + 1; // advance committed index
            } else {
              latestInterim = result[0].transcript; // always use latest interim
            }
          }

          if (newFinals) {
            finalRef.current = (finalRef.current + newFinals).trimStart();
            setFinalBuffer(finalRef.current);
            setInterimText('');
          } else if (latestInterim) {
            setInterimText(latestInterim);
          }
        };

        rec.onerror = (e) => {
          if (e.error === 'aborted') return;
          if (e.error === 'no-speech' || e.error === 'network') {
            // Seamless restart — buffer is preserved, lastResultIdx is preserved
            intentionalStop.current = true;
            try { rec.onresult = null; rec.stop(); } catch { }
            const delay = Math.min(300 * Math.pow(1.5, retries), 3000);
            setTimeout(() => { if (!handledRef.current) launch(retries + 1); }, delay);
            return;
          }
          // Unrecoverable (not-allowed, service-not-allowed)
          intentionalStop.current = true;
          try { rec.onresult = null; rec.stop(); } catch { }
          setIsRecording(false); setPhase('text-fallback'); setAvatarState('idle');
        };

        rec.onend = () => {
          // KEY FIX: only restart if it wasn't intentional
          if (!intentionalStop.current && !handledRef.current) {
            setTimeout(() => { if (!handledRef.current) launch(retries); }, 200);
          }
        };

        try { rec.start(); } catch { }
      };

      launch();
    } catch (err) { setError('Microphone error: ' + err.message); setPhase('text-fallback'); setIsRecording(false); }
  };

  // Let the user deliberately switch to typing, e.g. if voice isn't detecting well
  const switchToTextMode = () => {
    intentionalStop.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.onresult = null; recognitionRef.current.stop(); } catch { } }
    setIsRecording(false);
    setPhase('text-fallback');
  };

  // Let the user switch back to speaking their answer
  const switchToVoiceMode = () => {
    setTextInput('');
    setPhase('listening');
    setAvatarState('listening');
    startVoiceInput(ivRef.current, qIdxRef.current);
  };

  const submitAnswer = () => {
    const iv = ivRef.current, idx = qIdxRef.current;
    if (!iv || handledRef.current) return;
    const answer = (finalRef.current + ' ' + interimText).trim();
    if (!answer) { showToast('Please speak your answer first','warning'); return; }
    handledRef.current = true;
    intentionalStop.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.onresult=null; recognitionRef.current.stop(); } catch { } }
    setIsRecording(false);
    const entry = { question:iv.interview_questions[idx].question_text, answer };
    setTranscript(p => { const u=[...p,entry]; transcriptRef.current=u; return u; });
    setInterimText(''); setFinalBuffer(''); finalRef.current = '';
    setAvatarState('thinking');
    setTimeout(() => advanceQuestion(iv, idx), 800);
  };

  const advanceQuestion = (iv, idx) => {
    intentionalStop.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.onresult=null; recognitionRef.current.stop(); } catch { } }
    setIsRecording(false);
    const next = idx + 1;
    if (next < iv.interview_questions.length) {
      setCurrentQIdx(next); qIdxRef.current = next;
      setTimeout(() => startQuestion(iv, next), 800);
    } else {
      setPhase('done'); setAvatarState('thinking');
      setTimeout(finishInterview, 500);
    }
  };

  const skipQuestion = () => {
    const iv = ivRef.current, idx = qIdxRef.current;
    if (!iv || handledRef.current) return;
    handledRef.current = true;
    intentionalStop.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { } }
    setTranscript(p => { const u=[...p,{question:iv.interview_questions[idx].question_text,answer:'[Skipped]'}]; transcriptRef.current=u; return u; });
    setInterimText(''); setFinalBuffer(''); finalRef.current = '';
    advanceQuestion(iv, idx);
  };

  const finishInterview = async () => {
    const attempt = attemptRef.current; if (!attempt) return;
    setIsEvaluating(true); setAvatarState('thinking');
    speak('Great work. Our AI is reviewing your responses and generating a detailed report. This takes about twenty seconds.');
    cleanupRecording();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/interview-attempts/${attempt.id}/complete`,
        { transcript:transcriptRef.current, proctor_violations:violRef.current },
        { headers:{ Authorization:token } }
      );
      setReport(data.ai_feedback || data);
      speak('Your performance report is ready. Well done!');
      fetchMyAttempts();
    } catch { setError('Failed to submit. Check history for results.'); }
    finally {
      setIsEvaluating(false); setSelectedInterview(null); setCurrentAttempt(null);
      setAvatarState('idle');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleEndEarly = () => {
    const count = transcriptRef.current.length;
    if (count === 0) { if (window.confirm("No answers recorded. Abandon?")) cleanupAll(); return; }
    if (window.confirm(`Submit ${count} answered question(s) for a partial report?`)) {
      const iv = ivRef.current, idx = qIdxRef.current;
      const pending = (finalRef.current + ' ' + interimText).trim();
      if (pending && iv && !handledRef.current)
        transcriptRef.current = [...transcriptRef.current, { question:iv.interview_questions[idx].question_text, answer:pending }];
      finishInterview();
    }
  };

  const autoSubmitProctor = async () => {
    speak('Multiple violations detected. Submitting automatically.');
    cleanupRecording();
    const attempt = attemptRef.current;
    if (attempt) {
      try { await axios.post(`${backendUrl}/api/interview-attempts/${attempt.id}/complete`, { transcript:transcriptRef.current, proctor_violations:violRef.current, status:'abandoned' }, { headers:{ Authorization:token } }); }
      catch { }
    }
    cleanupAll();
  };

  const autoSubmitTime = () => { speak('Time is up. Submitting now.'); finishInterview(); };

  const cleanupRecording = () => {
    setIsRecording(false);
    intentionalStop.current = true;
    if (recognitionRef.current) { try { recognitionRef.current.onresult=null; recognitionRef.current.stop(); } catch { } }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (synthRef.current.speaking) synthRef.current.cancel();
  };

  const cleanupAll = () => {
    cleanupRecording();
    setSelectedInterview(null); setCurrentAttempt(null); setCurrentQIdx(0);
    setTranscript([]); setInterimText(''); setFinalBuffer(''); finalRef.current = '';
    setProctorViol(0); setPhase('reading'); setAvatarState('idle');
    violRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const fmtTime   = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const isCrit    = timeLeft < 120;
  const spoken    = [finalBuffer, interimText].filter(Boolean).join(' ');
  const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <GlobalStyle darkMode={darkMode} />
      <div className="bg-orb" style={{ width:500,height:500,background:'radial-gradient(circle,#7c6af7 0%,transparent 70%)',top:-100,left:-100 }} />
      <div className="bg-orb" style={{ width:400,height:400,background:'radial-gradient(circle,#2dd4bf 0%,transparent 70%)',bottom:100,right:-80,animationDelay:'9s',animationDirection:'alternate-reverse' }} />

      <div style={{ position:'relative',zIndex:1,maxWidth:1100,margin:'0 auto',padding:'40px 24px 80px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom:48 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--accent),var(--teal))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🎙</div>
            <span style={{ fontFamily:'var(--fmo)',fontSize:12,color:'var(--accent2)',letterSpacing:'.12em',textTransform:'uppercase' }}>AI Mock Interview</span>
          </div>
          <h1 style={{ fontFamily:'var(--fs)',fontSize:'clamp(32px,5vw,48px)',lineHeight:1.1,color:'var(--text)',fontWeight:400 }}>
            Practice. Evaluate.<br />
            <span style={{ fontStyle:'italic',background:'linear-gradient(135deg,var(--accent2),var(--teal))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>Improve.</span>
          </h1>
          <p style={{ color:'var(--text2)',fontSize:15,marginTop:12,maxWidth:480 }}>
            Voice-driven interviews evaluated by AI. Get scored feedback on every answer within seconds.
          </p>
        </div>

        {error && (
          <div className="alert alert-error reveal" style={{ marginBottom:20 }}>
            <span>⚠</span>
            <div>{error}<button onClick={() => setError(null)} style={{ background:'none',border:'none',color:'var(--red)',cursor:'pointer',marginLeft:8,fontSize:13 }}>Dismiss</button></div>
          </div>
        )}

        {isAdmin && (
          <button className="btn btn-primary reveal" style={{ marginBottom:32 }} onClick={openCreateForm}>
            <span>+</span> Create Interview
          </button>
        )}

        <div style={{ display:'grid',gridTemplateColumns:'minmax(0,1.4fr) minmax(0,1fr)',gap:28,alignItems:'start' }}>

          {/* Interview list */}
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
              <span style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em' }}>Available</span>
              <div style={{ flex:1,height:1,background:'var(--border)' }} />
              <span className="chip chip-accent">{interviews.length}</span>
            </div>
            {interviews.length === 0 ? (
              <div className="card" style={{ padding:40,textAlign:'center' }}>
                <div style={{ fontSize:32,marginBottom:12 }}>🎤</div>
                <p style={{ color:'var(--text2)',fontSize:14 }}>No interviews available yet.</p>
              </div>
            ) : (
              interviews.map((iv, idx) => {
                const isPaid = iv.pricing_type === 'paid', price = getPriceDisplay(iv);
                return (
                  <div key={iv.id} className="card reveal" style={{ padding:'20px 24px',marginBottom:16,animationDelay:`${0.05*idx}s` }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16 }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <h3 style={{ fontFamily:'var(--fs)',fontSize:20,fontWeight:400,color:'var(--text)',marginBottom:6,lineHeight:1.3 }}>{iv.title}</h3>
                        {iv.description && <p style={{ color:'var(--text2)',fontSize:13,marginBottom:10,lineHeight:1.5 }}>{iv.description}</p>}
                        <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
                          <span className="chip chip-accent">💼 {iv.job_role}</span>
                          <span className="chip chip-teal">⏱ {iv.duration_minutes}m</span>
                          <span className="chip chip-amber">❓ {iv.interview_questions?.length||0} Qs</span>
                          {iv.experience_level && <span className="chip chip-accent" style={{ textTransform:'capitalize' }}>{iv.experience_level}</span>}
                          {!isPaid && <span className="chip chip-green">✓ Free</span>}
                          {isPaid && accessLoading[iv.id] && <span className="chip chip-amber" style={{ opacity:.55 }}>Checking…</span>}
                          {isPaid && !accessLoading[iv.id] && accessMap[iv.id]  && <span className="chip chip-unlocked">✓ Unlocked</span>}
                          {isPaid && !accessLoading[iv.id] && !accessMap[iv.id] && price && <span className="chip chip-paid">💰 {price}</span>}
                        </div>
                        {isPaid && !accessLoading[iv.id] && !accessMap[iv.id] && <p style={{ fontSize:12,color:'var(--text3)',marginTop:8 }}>🔒 Purchase to unlock</p>}
                      </div>
                      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                        {renderCardAction(iv)}
                        {isAdmin && (
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => openEditForm(iv)}>✎ Edit</button>
                            <button className="btn btn-danger" style={{ padding:'6px 12px', fontSize:12 }} onClick={() => handleDeleteInterview(iv)} disabled={deleteLoading[iv.id]}>
                              {deleteLoading[iv.id] ? '…' : '🗑 Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* History */}
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20 }}>
              <span style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em' }}>My History</span>
              <div style={{ flex:1,height:1,background:'var(--border)' }} />
            </div>
            {myAttempts.length === 0 ? (
              <div className="card" style={{ padding:32,textAlign:'center' }}>
                <p style={{ color:'var(--text3)',fontSize:14 }}>No interviews attempted yet.</p>
              </div>
            ) : (
              myAttempts.map((a, idx) => (
                <div key={a.id} className="card reveal" style={{ padding:'16px 20px',marginBottom:12,animationDelay:`${0.08*idx}s` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <div>
                      <p style={{ fontWeight:500,fontSize:14,color:'var(--text)',marginBottom:4 }}>{a.interviews?.title||'Interview'}</p>
                      <p style={{ fontSize:12,color:'var(--text2)' }}>{a.interviews?.job_role}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      {a.overall_score != null
                        ? <span style={{ fontFamily:'var(--fmo)',fontSize:20,fontWeight:500,color:a.overall_score>=75?'var(--green)':a.overall_score>=50?'var(--amber)':'var(--red)' }}>{a.overall_score}</span>
                        : <span className="chip chip-amber">Pending</span>}
                    </div>
                  </div>
                  {a.ai_feedback && <button className="btn btn-teal" style={{ marginTop:10,width:'100%',fontSize:12 }} onClick={() => setReport(a.ai_feedback)}>View Report →</button>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ══ ACTIVE INTERVIEW ══ */}
      {selectedInterview && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ display:'flex',flexDirection:'column',gap:0 }}>
            {/* Header */}
            <div style={{ padding:'20px 28px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16 }}>
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4 }}>{selectedInterview.job_role}</p>
                <h2 style={{ fontFamily:'var(--fs)',fontSize:20,fontWeight:400,color:'var(--text)' }}>{selectedInterview.title}</h2>
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',marginBottom:2 }}>TIME LEFT</p>
                <span className={isCrit?'timer-critical':''} style={{ fontFamily:'var(--fmo)',fontSize:22,fontWeight:500,color:isCrit?'var(--red)':'var(--text)' }}>{fmtTime(timeLeft)}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',marginBottom:4 }}>QUESTION</p>
                <span style={{ fontFamily:'var(--fmo)',fontSize:18,color:'var(--accent2)' }}>{currentQIdx+1} <span style={{ color:'var(--text3)' }}>/ {selectedInterview.interview_questions.length}</span></span>
              </div>
            </div>
            {/* Progress */}
            <div style={{ padding:'0 28px' }}>
              <div className="progress-track" style={{ marginTop:16 }}>
                <div className="progress-fill" style={{ width:`${((currentQIdx+(phase==='done'?1:0))/selectedInterview.interview_questions.length)*100}%` }} />
              </div>
            </div>
            {/* Body */}
            <div style={{ padding:'24px 28px',display:'grid',gridTemplateColumns:'140px 1fr 1fr',gap:20 }}>
              {/* Avatar */}
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:16,paddingTop:8 }}>
                <AIAvatar state={avatarState} size={130} />
                <div style={{ textAlign:'center',paddingTop:8 }}>
                  <p style={{ fontFamily:'var(--fmo)',fontSize:9,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6 }}>AI Interviewer</p>
                  {phase === 'listening' && <div style={{ display:'flex',justifyContent:'center' }}><Waveform bars={5} /></div>}
                </div>
              </div>
              {/* Q + Input */}
              <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                <div style={{ background:'var(--surface2)',borderRadius:'var(--r)',padding:20,border:'1px solid var(--border)' }}>
                  <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10 }}>Q{currentQIdx+1}</p>
                  <p style={{ fontFamily:'var(--fs)',fontSize:17,lineHeight:1.5,color:'var(--text)',fontWeight:400 }}>{selectedInterview.interview_questions[currentQIdx]?.question_text}</p>
                </div>
                <div style={{ background:'var(--surface2)',borderRadius:'var(--r)',padding:'16px 20px',border:phase==='listening'?'1px solid rgba(45,212,191,0.3)':'1px solid var(--border)',transition:'border-color .3s',minHeight:120 }}>
                  {phase === 'reading' && (
                    <div style={{ display:'flex',alignItems:'center',gap:12,color:'var(--text2)' }}>
                      <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--accent)',animation:'pulse 1.4s infinite' }} />
                      <span style={{ fontSize:14 }}>AI is reading the question aloud…</span>
                    </div>
                  )}
                  {phase === 'listening' && (
                    <>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,marginBottom:10 }}>
                        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                          <div className="recording-ring" style={{ width:10,height:10,borderRadius:'50%',background:'var(--red)',flexShrink:0 }} />
                          <span style={{ fontSize:13,color:'var(--teal)' }}>Listening — speak your answer</span>
                          <Waveform bars={6} />
                        </div>
                        <button onClick={switchToTextMode} style={{ background:'none',border:'none',color:'var(--text3)',fontSize:11,cursor:'pointer',textDecoration:'underline',padding:0,flexShrink:0 }}>
                          ⌨ Type instead
                        </button>
                      </div>
                      <div style={{ minHeight:56,background:'rgba(124,106,247,0.06)',borderRadius:8,padding:'10px 14px',borderLeft:'2px solid var(--accent)',fontSize:13,lineHeight:1.6,color:'var(--text)' }}>
                        {spoken ? (
                          <>
                            {finalBuffer  && <span style={{ color:'var(--text)' }}>{finalBuffer} </span>}
                            {interimText  && <span className="interim-text" style={{ color:'var(--text2)',fontStyle:'italic' }}>{interimText}</span>}
                          </>
                        ) : (
                          <span style={{ color:'var(--text3)',fontStyle:'italic' }}>Start speaking — your words appear here in real time…</span>
                        )}
                      </div>
                    </>
                  )}
                  {phase === 'text-fallback' && (
                    <>
                      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:10 }}>
                        <span style={{ fontSize:13,color:'var(--amber)' }}>⌨ Typing mode</span>
                        {speechSupported && (
                          <button onClick={switchToVoiceMode} style={{ background:'none',border:'none',color:'var(--teal)',fontSize:11,cursor:'pointer',textDecoration:'underline',padding:0 }}>
                            🎤 Use voice instead
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize:11,color:'var(--text3)',marginBottom:10 }}>Type your answer below, or switch back to voice anytime.</p>
                      <textarea className="form-input" rows={3} placeholder="Type your answer…"
                        value={textInput} onChange={e => setTextInput(e.target.value)} style={{ marginBottom:8 }} autoFocus />
                      <button className="btn btn-primary" style={{ width:'100%',fontSize:13 }} onClick={() => {
                        if (!textInput.trim()) return;
                        const iv=ivRef.current, idx=qIdxRef.current;
                        const entry={question:iv.interview_questions[idx].question_text, answer:textInput.trim()};
                        setTranscript(p => { const u=[...p,entry]; transcriptRef.current=u; return u; });
                        setTextInput(''); setPhase('reading'); advanceQuestion(iv, idx);
                      }}>Submit Answer →</button>
                    </>
                  )}
                  {phase === 'done' && <p style={{ fontSize:14,color:'var(--green)' }}>✓ All questions answered</p>}
                </div>
                {/* Buttons */}
                <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
                  {phase === 'listening' && (
                    <button className="btn btn-submit" style={{ width:'100%',fontSize:14,padding:'12px 20px' }}
                      onClick={submitAnswer} disabled={!spoken}>
                      ✓ Submit Answer {currentQIdx < selectedInterview.interview_questions.length-1 ? '→ Next Question' : '→ Finish Interview'}
                    </button>
                  )}
                  <div style={{ display:'flex',gap:8 }}>
                    {(phase==='listening'||phase==='text-fallback') && <button className="btn btn-ghost" style={{ flex:1,fontSize:13 }} onClick={skipQuestion}>Skip →</button>}
                    <button className="btn btn-danger" style={{ flex:1,fontSize:13 }} onClick={handleEndEarly}>
                      {transcript.length>0?'⬆ Submit & End Early':'✕ Abandon'}
                    </button>
                  </div>
                </div>
                {proctorViol > 0 && (
                  <div className="alert alert-warning">
                    <span>⚠</span>
                    <span>Violation {proctorViol}/2 — one more will auto-submit</span>
                  </div>
                )}
              </div>
              {/* Transcript */}
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                  <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em' }}>Live Transcript</p>
                  <span className="chip chip-teal">{transcript.length} answered</span>
                </div>
                <div className="scroll-area" style={{ flex:1,maxHeight:380,display:'flex',flexDirection:'column',gap:10 }}>
                  {transcript.length===0
                    ? <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:13,textAlign:'center',padding:20 }}>Answered questions appear here.</div>
                    : transcript.map((e,i) => (
                      <div key={i} className="t-item-enter" style={{ background:'var(--surface2)',borderRadius:10,padding:'12px 14px',border:'1px solid var(--border)' }}>
                        <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',marginBottom:6 }}>Q{i+1}: {e.question}</p>
                        <p style={{ fontSize:13,color:e.answer==='[Skipped]'?'var(--text3)':'var(--text)',lineHeight:1.5 }}>
                          {e.answer==='[Skipped]'?<em>Skipped</em>:e.answer}
                        </p>
                      </div>
                    ))}
                  <div ref={transcriptEnd} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EVALUATING ══ */}
      {isEvaluating && (
        <div className="dialog-overlay">
          <div className="dialog-box" style={{ padding:32 }}>
            <div style={{ textAlign:'center',marginBottom:28 }}>
              <div style={{ display:'flex',justifyContent:'center',marginBottom:20 }}><AIAvatar state="thinking" size={110} /></div>
              <h2 style={{ fontFamily:'var(--fs)',fontSize:26,fontWeight:400,color:'var(--text)',marginBottom:10 }}>Evaluating your responses</h2>
              <p style={{ color:'var(--text2)',fontSize:14,lineHeight:1.6 }}>AI is scoring each answer and generating a detailed report.</p>
            </div>
            <div className="alert alert-info" style={{ marginBottom:20 }}>
              <span>⏱</span>
              <div><strong>Estimated wait: 15–30 seconds</strong><p style={{ fontSize:12,marginTop:3,color:'var(--text2)' }}>Your report will appear in <strong>My History</strong> once ready.</p></div>
            </div>
            {transcriptRef.current.length > 0 && (
              <div>
                <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12 }}>Your transcript — {transcriptRef.current.length} questions</p>
                <div className="scroll-area" style={{ maxHeight:220,display:'flex',flexDirection:'column',gap:8 }}>
                  {transcriptRef.current.map((e,i) => (
                    <div key={i} style={{ background:'var(--surface2)',borderRadius:8,padding:'10px 14px',border:'1px solid var(--border)' }}>
                      <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',marginBottom:4 }}>Q{i+1}: {e.question}</p>
                      <p style={{ fontSize:13,color:e.answer==='[Skipped]'?'var(--text3)':'var(--text)',lineHeight:1.5 }}>{e.answer==='[Skipped]'?<em>Skipped</em>:e.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ REPORT ══ */}
      {report && !isEvaluating && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ padding:'28px 32px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:24,marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border)' }}>
              <ScoreRing score={report.overall_score||0} size={110} />
              <div>
                <p style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6 }}>Interview Complete</p>
                <h2 style={{ fontFamily:'var(--fs)',fontSize:28,fontWeight:400,color:'var(--text)',marginBottom:8 }}>Performance Report</h2>
                {report.summary && <p style={{ fontSize:14,color:'var(--text2)',lineHeight:1.6,maxWidth:440 }}>{report.summary}</p>}
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24 }}>
              {[
                { label:'Strengths',  content:report.strengths,   color:'var(--green)',   bg:'rgba(74,222,128,0.06)',   border:'rgba(74,222,128,0.2)',   icon:'✦' },
                { label:'Weaknesses', content:report.weaknesses,  color:'var(--red)',     bg:'rgba(248,113,113,0.06)', border:'rgba(248,113,113,0.2)', icon:'△' },
                { label:'Suggestions',content:report.suggestions, color:'var(--accent2)', bg:'rgba(124,106,247,0.06)', border:'rgba(124,106,247,0.15)', icon:'◇' },
              ].map(({ label,content,color,bg,border,icon }) => (
                <div key={label} style={{ background:bg,borderRadius:'var(--r)',padding:'16px 18px',border:`1px solid ${border}` }}>
                  <p style={{ fontFamily:'var(--fmo)',fontSize:10,color,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10 }}>{icon} {label}</p>
                  <p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.6 }}>{content||'—'}</p>
                </div>
              ))}
            </div>
            {report.per_question?.length > 0 && (
              <>
                <p style={{ fontFamily:'var(--fmo)',fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14 }}>Question Breakdown</p>
                <div className="scroll-area" style={{ maxHeight:280,display:'flex',flexDirection:'column',gap:10,marginBottom:24 }}>
                  {report.per_question.map((pq,i) => {
                    const sc=pq.score||0, col=sc>=75?'var(--green)':sc>=50?'var(--amber)':'var(--red)';
                    return (
                      <div key={i} style={{ background:'var(--surface2)',borderRadius:10,padding:'14px 16px',border:'1px solid var(--border)',display:'flex',gap:16,alignItems:'flex-start' }}>
                        <div style={{ textAlign:'center',flexShrink:0 }}>
                          <div style={{ fontFamily:'var(--fmo)',fontSize:18,fontWeight:500,color:col }}>{sc}</div>
                          <div style={{ fontFamily:'var(--fmo)',fontSize:9,color:'var(--text3)' }}>/100</div>
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:12,color:'var(--text3)',marginBottom:4 }}>Q{i+1}: {pq.question}</p>
                          <p style={{ fontSize:13,color:'var(--text2)',lineHeight:1.5 }}>{pq.feedback}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => setReport(null)}>Close Report</button>
          </div>
        </div>
      )}

      {/* ══ CREATE / EDIT INTERVIEW (ADMIN) ══ */}
      {showCreateForm && (
        <div className="dialog-overlay">
          <div className="dialog-box wide" style={{ padding:'28px 32px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24 }}>
              <h2 style={{ fontFamily:'var(--fs)',fontSize:24,fontWeight:400,color:'var(--text)' }}>{editingId ? 'Edit Interview' : 'Create Interview'}</h2>
              <button className="btn btn-ghost" onClick={closeInterviewForm} style={{ padding:'6px 12px' }}>✕</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
              {[{label:'Interview Title',key:'title'},{label:'Job Role',key:'job_role'}].map(({label,key}) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input type="text" className="form-input" value={newInterview[key]} onChange={e => setNewInterview({...newInterview,[key]:e.target.value})} placeholder={label} />
                </div>
              ))}
            </div>
            <div style={{ marginTop:16 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" value={newInterview.description} onChange={e => setNewInterview({...newInterview,description:e.target.value})} placeholder="Brief description…" />
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16 }}>
              <div>
                <label className="form-label">Experience Level</label>
                <select className="form-input" value={newInterview.experience_level} onChange={e => setNewInterview({...newInterview,experience_level:e.target.value})}>
                  {['beginner','intermediate','advanced','expert'].map(l => <option key={l} value={l}>{l[0].toUpperCase()+l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={newInterview.duration_minutes} onChange={e => setNewInterview({...newInterview,duration_minutes:parseInt(e.target.value)})} min={5} max={120} />
              </div>
            </div>
            <div style={{ marginTop:16 }}>
              <label className="form-label">Pricing Type</label>
              <select className="form-input" value={newInterview.pricing_type} onChange={e => setNewInterview(p=>({...p,pricing_type:e.target.value,prices:e.target.value==='free'?{}:p.prices}))}>
                <option value="free">Free</option><option value="paid">Paid</option>
              </select>
            </div>
            {newInterview.pricing_type==='paid' && (
              <div style={{ marginTop:16 }}>
                <label className="form-label">Prices</label>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                  {['INR','USD','GBP','EUR'].map(c => (
                    <div key={c}>
                      <label className="form-label">{c}{c==='INR'?' (required)':''}</label>
                      <input type="number" className="form-input" value={newInterview.prices[c]||''} onChange={e => setNewInterview(p=>({...p,prices:{...p.prices,[c]:parseFloat(e.target.value)||0}}))} placeholder="0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="divider" />
            <p style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14 }}>Questions</p>
            <div style={{ maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:12 }}>
              {newInterview.questions.map((q,i) => (
                <div key={q.id || i} style={{ background:'var(--surface2)',borderRadius:'var(--rsm)',padding:'14px 16px',border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <span style={{ fontFamily:'var(--fmo)',fontSize:11,color:'var(--text3)' }}>Question {i+1}</span>
                    {newInterview.questions.length > 1 && <button onClick={() => removeQ(i)} style={{ background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:13 }}>Remove</button>}
                  </div>
                  <textarea className="form-input" value={q.question_text} onChange={e => updQ(i,'question_text',e.target.value)} placeholder="Enter question…" style={{ marginBottom:10 }} />
                  <select className="form-input" value={q.question_type} onChange={e => updQ(i,'question_type',e.target.value)}>
                    {['behavioral','technical','system_design','hr'].map(t => <option key={t} value={t}>{t.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ marginTop:12,width:'100%' }} onClick={addQ}>+ Add Question</button>
            <div style={{ display:'flex',gap:12,marginTop:20 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={closeInterviewForm}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={handleCreate} disabled={loading}>
                {loading ? (editingId ? 'Saving…' : 'Creating…') : (editingId ? 'Save Changes' : 'Create Interview')}
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