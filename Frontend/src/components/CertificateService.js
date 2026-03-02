// CertificateDownloader.jsx
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateCertificatePDF({
  tier = null,
  name = "Alexandra Chen",
  course = "Data Structures & Algorithms",
  score = 85,
  date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  issuer = "Techmocks.com",
  certId = null
}) {
  let finalTier = tier;
  if (!finalTier) {
    if (score >= 90) finalTier = 'diamond';
    else if (score >= 80) finalTier = 'gold';
    else finalTier = 'silver';
  }

  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:900px;height:637px;';
  document.body.appendChild(tempContainer);

  if (!document.getElementById('cert-fonts')) {
    const link = document.createElement('link');
    link.id = 'cert-fonts';
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!document.getElementById('cert-global-style')) {
    const style = document.createElement('style');
    style.id = 'cert-global-style';
    style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .certificate { width:900px; height:637px; position:relative; overflow:hidden; border-radius:10px; font-family:'Lato',sans-serif; color:#1a1a2e; }
  .cert-bg-svg { position:absolute; inset:0; width:100%; height:100%; z-index:1; }
  .cert-silver  { background:linear-gradient(145deg,#f4f6f9 0%,#eaecf2 40%,#dfe3ea 100%); border:1.5px solid #c8cdd8; }
  .cert-gold    { background:linear-gradient(145deg,#fdf8ef 0%,#f9eedc 40%,#f3e4c8 100%); border:1.5px solid #d4af37; }
  .cert-diamond { background:linear-gradient(145deg,#eef6ff 0%,#e0eefc 40%,#d4e8fa 100%); border:1.5px solid #7db9e8; }
  .border-frame { position:absolute; inset:16px; pointer-events:none; z-index:10; }
  .border-outer { position:absolute; inset:0; border:2px solid; }
  .border-inner { position:absolute; inset:9px; border:1px solid; }
  .cert-silver  .border-outer { border-color:rgba(140,150,170,0.5); }
  .cert-silver  .border-inner { border-color:rgba(180,190,205,0.3); }
  .cert-gold    .border-outer { border-color:rgba(180,140,30,0.55); }
  .cert-gold    .border-inner { border-color:rgba(210,175,60,0.3); }
  .cert-diamond .border-outer { border-color:rgba(80,150,220,0.5); }
  .cert-diamond .border-inner { border-color:rgba(120,180,240,0.3); }
  .corner { position:absolute; width:38px; height:38px; border-style:solid; border-width:0; }
  .corner.tl { top:-2px; left:-2px; border-top-width:3px; border-left-width:3px; border-radius:3px 0 0 0; }
  .corner.tr { top:-2px; right:-2px; border-top-width:3px; border-right-width:3px; border-radius:0 3px 0 0; }
  .corner.bl { bottom:-2px; left:-2px; border-bottom-width:3px; border-left-width:3px; border-radius:0 0 0 3px; }
  .corner.br { bottom:-2px; right:-2px; border-bottom-width:3px; border-right-width:3px; border-radius:0 0 3px 0; }
  .cert-silver  .corner { border-color:#8899aa; }
  .cert-gold    .corner { border-color:#c8960a; }
  .cert-diamond .corner { border-color:#4a9ae0; }
  .cert-body { position:relative; z-index:20; display:flex; flex-direction:column; align-items:center; width:100%; padding:115px 8% 44px; text-align:center; }
  .tier-badge { display:flex; align-items:center; gap:18px; position:absolute; top:58px; left:50%; transform:translateX(-50%); z-index:22; white-space:nowrap; }
  .badge-line { height:1.5px; width:70px; opacity:0.7; }
  .cert-silver  .badge-line { background:#7a8a9a; }
  .cert-gold    .badge-line { background:#b8860b; }
  .cert-diamond .badge-line { background:#3a82d0; }
  .tier-name { font-family:'Cinzel',serif; font-size:1.08rem; letter-spacing:0.42em; font-weight:600; text-transform:uppercase; }
  .cert-silver  .tier-name { color:#596577; }
  .cert-gold    .tier-name { color:#8b6400; }
  .cert-diamond .tier-name { color:#1b4fa0; }
  .cert-title { font-family:'Cinzel',serif; font-size:3.3rem; font-weight:700; letter-spacing:0.12em; color:#0d1526; margin-bottom:1.8%; }
  .cert-subtitle { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.12rem; color:#465065; margin-bottom:3.5%; }
  .presented-to { font-family:'Lato',sans-serif; font-weight:400; font-size:0.9rem; letter-spacing:0.28em; text-transform:uppercase; color:#5c6880; margin-bottom:1.8%; }
  .recipient-name { font-family:'Playfair Display',serif; font-style:italic; font-weight:700; font-size:3.6rem; line-height:1; color:#0d1526; margin-bottom:1.2%; }
  .name-line { height:1.5px; width:46%; margin:0 auto 3.5% auto; }
  .cert-silver  .name-line { background:linear-gradient(90deg,transparent,#b0bac8,transparent); }
  .cert-gold    .name-line { background:linear-gradient(90deg,transparent,#d4af37,transparent); }
  .cert-diamond .name-line { background:linear-gradient(90deg,transparent,#5aabf0,transparent); }
  .cert-desc { font-family:'Cormorant Garamond',serif; font-size:1.03rem; font-weight:400; line-height:1.8; color:#2e3a4e; max-width:76%; margin-bottom:4%; }
  .cert-footer { display:flex; width:80%; justify-content:space-between; align-items:flex-end; margin-top:1.5%; }
  .footer-col { display:flex; flex-direction:column; align-items:center; gap:3px; }
  .footer-line { width:110px; height:1px; margin-bottom:5px; }
  .cert-silver  .footer-line { background:linear-gradient(90deg,transparent,#a0aab8,transparent); }
  .cert-gold    .footer-line { background:linear-gradient(90deg,transparent,#c8a020,transparent); }
  .cert-diamond .footer-line { background:linear-gradient(90deg,transparent,#4a9ae0,transparent); }
  .footer-label { font-family:'Lato',sans-serif; font-weight:400; font-size:0.76rem; letter-spacing:0.16em; color:#445060; }
  .score-badge { width:88px; height:88px; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; border:2px solid; position:relative; }
  .score-badge::before { content:''; position:absolute; inset:4px; border-radius:50%; border:1px solid; opacity:0.35; }
  .cert-silver  .score-badge { border-color:#8899b0; background:rgba(225,230,240,0.6); }
  .cert-silver  .score-badge::before { border-color:#8899b0; }
  .cert-gold    .score-badge { border-color:#c8a020; background:rgba(248,236,200,0.55); }
  .cert-gold    .score-badge::before { border-color:#c8a020; }
  .cert-diamond .score-badge { border-color:#4a9ae0; background:rgba(210,235,255,0.55); }
  .cert-diamond .score-badge::before { border-color:#4a9ae0; }
  .score-pct { font-family:'Cinzel',serif; font-weight:700; font-size:1.55rem; position:relative; z-index:1; }
  .cert-silver  .score-pct { color:#3a4a5a; }
  .cert-gold    .score-pct { color:#7a5000; }
  .cert-diamond .score-pct { color:#1040a0; }
  .score-word { font-size:0.56rem; letter-spacing:0.2em; text-transform:uppercase; color:#4a5a6a; margin-top:2px; position:relative; z-index:1; }
  .cert-id { font-size:0.6rem; color:#8090a0; position:absolute; bottom:10px; right:22px; letter-spacing:0.08em; z-index:20; }
`;
    document.head.appendChild(style);
  }

  // ─── SVG helpers ──────────────────────────────────────────────────────────
  function rays(n, r, color, sw) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i * 360 / n) * Math.PI / 180;
      return `<line x1="0" y1="0" x2="${(Math.cos(a)*r).toFixed(1)}" y2="${(Math.sin(a)*r).toFixed(1)}" stroke="${color}" stroke-width="${sw}"/>`;
    }).join('');
  }
  function hexPts(r) {
    return Array.from({ length: 6 }, (_, i) => {
      const a = i * 60 * Math.PI / 180;
      return `${(Math.cos(a)*r).toFixed(1)},${(Math.sin(a)*r).toFixed(1)}`;
    }).join(' ');
  }
  function rosette(color) {
    return `<circle cx="0" cy="0" r="32" fill="none" stroke="${color}" stroke-width="1"/>
      <circle cx="0" cy="0" r="22" fill="none" stroke="${color}" stroke-width="0.7"/>
      <circle cx="0" cy="0" r="12" fill="none" stroke="${color}" stroke-width="0.6"/>
      ${rays(8, 38, color, '0.7')}`;
  }
  function waveBand(startY, dir, color, n) {
    return Array.from({ length: n }, (_, i) => {
      const y = startY + i * 2.4;
      const amp = (5 - i * 0.2) * dir;
      return `<path d="M28,${y} Q225,${(y+amp).toFixed(1)} 450,${y} T872,${y}" fill="none" stroke="${color}" stroke-width="0.9"/>`;
    }).join('');
  }
  function cornerFlourish(color, accent) {
    return `<path d="M0,44 Q0,0 44,0" fill="none" stroke="${color}" stroke-width="1.4"/>
      <path d="M0,58 Q0,-12 58,0" fill="none" stroke="${color}" stroke-width="0.7"/>
      <path d="M10,30 Q10,10 30,10" fill="none" stroke="${accent}" stroke-width="0.9"/>
      <circle cx="44" cy="0" r="3.5" fill="${color}" opacity="0.6"/>
      <circle cx="0" cy="44" r="3.5" fill="${color}" opacity="0.6"/>
      <polygon points="24,-12 30,-6 24,0 18,-6" fill="${color}" opacity="0.55"/>`;
  }

  // ─── SVG background per tier ──────────────────────────────────────────────
  function buildSVG(t) {
    if (t === 'silver') {
      const fanLines = (ox, oy, baseAngle) => Array.from({length:12},(_,i) => {
        const a = (i*8 + baseAngle) * Math.PI / 180;
        return `<line x1="${ox}" y1="${oy}" x2="${(ox+Math.cos(a)*400).toFixed(1)}" y2="${(oy+Math.sin(a)*400).toFixed(1)}" stroke="#5a6880" stroke-width="1.2"/>`;
      }).join('');
      return `
<svg class="cert-bg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 637" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="sg1" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#eceff5"/><stop offset="100%" stop-color="#d8dde8"/>
    </radialGradient>
  </defs>
  <rect width="900" height="637" fill="url(#sg1)"/>
  <g opacity="0.052">${fanLines(0,0,-45)}</g>
  <g opacity="0.052">${fanLines(900,637,135)}</g>
  <g opacity="0.07">
    ${[340,280,220,162,104].map(rx=>`<ellipse cx="450" cy="318" rx="${rx}" ry="${(rx*0.7).toFixed(0)}" fill="none" stroke="#506078" stroke-width="0.8"/>`).join('')}
  </g>
  <g transform="translate(56,56)"   opacity="0.17">${rosette('#607080')}</g>
  <g transform="translate(844,56)"  opacity="0.17">${rosette('#607080')}</g>
  <g transform="translate(56,581)"  opacity="0.17">${rosette('#607080')}</g>
  <g transform="translate(844,581)" opacity="0.17">${rosette('#607080')}</g>
  <g opacity="0.16" transform="translate(0,318)">
    <line x1="20" y1="0" x2="78" y2="0" stroke="#607080" stroke-width="1"/>
    <circle cx="90" cy="0" r="5" fill="none" stroke="#607080" stroke-width="1"/>
    <circle cx="90" cy="0" r="2" fill="#607080"/>
  </g>
  <g opacity="0.16" transform="translate(900,318) scale(-1,1)">
    <line x1="20" y1="0" x2="78" y2="0" stroke="#607080" stroke-width="1"/>
    <circle cx="90" cy="0" r="5" fill="none" stroke="#607080" stroke-width="1"/>
    <circle cx="90" cy="0" r="2" fill="#607080"/>
  </g>
  <g opacity="0.55">${waveBand(26,  -1, 'rgba(80,96,120,0.046)', 16)}</g>
  <g opacity="0.55">${waveBand(599,  1, 'rgba(80,96,120,0.046)', 16)}</g>
  <text x="450" y="338" text-anchor="middle" dominant-baseline="middle"
        font-family="Cinzel,serif" font-size="180" font-weight="700"
        fill="rgba(70,85,105,0.035)" letter-spacing="4">TM</text>
</svg>`;
    }

    if (t === 'gold') {
      const octPts = r => Array.from({length:8},(_,i)=>{const a=(i*45-22.5)*Math.PI/180;return `${(Math.cos(a)*r).toFixed(1)},${(Math.sin(a)*r).toFixed(1)}`;}).join(' ');
      const laurelBranch = Array.from({length:8},(_,i)=>{const y=-70+i*20;return `<ellipse cx="-6" cy="${y}" rx="16" ry="6" fill="none" stroke="#9a7000" stroke-width="0.8" transform="rotate(${-25+i*4} -6 ${y})"/>`;}).join('') + `<line x1="0" y1="-78" x2="0" y2="78" stroke="#9a7000" stroke-width="0.8"/>`;
      return `
<svg class="cert-bg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 637" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="gg1" cx="50%" cy="50%" r="65%">
      <stop offset="0%"   stop-color="#fdf4e0"/>
      <stop offset="70%"  stop-color="#f5e3b4"/>
      <stop offset="100%" stop-color="#edd494"/>
    </radialGradient>
    <radialGradient id="gg2" cx="18%" cy="18%" r="42%">
      <stop offset="0%" stop-color="rgba(255,235,140,0.38)"/><stop offset="100%" stop-color="rgba(255,235,140,0)"/>
    </radialGradient>
    <radialGradient id="gg3" cx="82%" cy="82%" r="42%">
      <stop offset="0%" stop-color="rgba(255,210,90,0.28)"/><stop offset="100%" stop-color="rgba(255,210,90,0)"/>
    </radialGradient>
  </defs>
  <rect width="900" height="637" fill="url(#gg1)"/>
  <rect width="900" height="637" fill="url(#gg2)"/>
  <rect width="900" height="637" fill="url(#gg3)"/>
  <g opacity="0.06" transform="translate(450,318)">${rays(28, 520, '#a07800', '1.4')}</g>
  <g opacity="0.08" transform="translate(450,318)">
    ${[210,165,122,82,46].map(r=>`<polygon points="${octPts(r)}" fill="none" stroke="#9a7000" stroke-width="0.8"/>`).join('')}
  </g>
  <g opacity="0.13" transform="translate(88,318)">${laurelBranch}</g>
  <g opacity="0.13" transform="translate(812,318) scale(-1,1)">${laurelBranch}</g>
  <g transform="translate(52,52)"    opacity="0.24">${cornerFlourish('#b08000','#d4af37')}</g>
  <g transform="translate(848,52)  scale(-1,1)"  opacity="0.24">${cornerFlourish('#b08000','#d4af37')}</g>
  <g transform="translate(52,585)  scale(1,-1)"  opacity="0.24">${cornerFlourish('#b08000','#d4af37')}</g>
  <g transform="translate(848,585) scale(-1,-1)" opacity="0.24">${cornerFlourish('#b08000','#d4af37')}</g>
  <g opacity="0.6">${waveBand(26,  -1, 'rgba(150,100,10,0.05)', 16)}</g>
  <g opacity="0.6">${waveBand(600,  1, 'rgba(150,100,10,0.05)', 16)}</g>
  <text x="450" y="338" text-anchor="middle" dominant-baseline="middle"
        font-family="Cinzel,serif" font-size="180" font-weight="700"
        fill="rgba(140,95,0,0.038)" letter-spacing="4">TM</text>
</svg>`;
    }

    // diamond
    const diaShapes = [220,175,132,90,52].map(r=>{const s=(r*0.62).toFixed(1);return `<polygon points="0,${-r} ${s},0 0,${r} ${-s},0" fill="none" stroke="#2868b8" stroke-width="0.8"/>`;}).join('');
    const hexCorner = `<polygon points="${hexPts(30)}" fill="none" stroke="#2870c8" stroke-width="1"/>
      <polygon points="${hexPts(20)}" fill="none" stroke="#2870c8" stroke-width="0.6"/>
      ${rays(6,34,'#2870c8','0.7')}
      <circle cx="0" cy="0" r="4" fill="none" stroke="#50a0e8" stroke-width="0.8"/>`;
    return `
<svg class="cert-bg-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 637" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="dg1" cx="50%" cy="50%" r="65%">
      <stop offset="0%"   stop-color="#eef6ff"/>
      <stop offset="60%"  stop-color="#daeaf8"/>
      <stop offset="100%" stop-color="#ccdff2"/>
    </radialGradient>
    <radialGradient id="dg2" cx="15%" cy="18%" r="45%">
      <stop offset="0%" stop-color="rgba(175,225,255,0.42)"/><stop offset="100%" stop-color="rgba(175,225,255,0)"/>
    </radialGradient>
    <radialGradient id="dg3" cx="85%" cy="82%" r="45%">
      <stop offset="0%" stop-color="rgba(155,210,255,0.3)"/><stop offset="100%" stop-color="rgba(155,210,255,0)"/>
    </radialGradient>
    <linearGradient id="prism" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"  stop-color="rgba(155,215,255,0)"/>
      <stop offset="40%" stop-color="rgba(195,238,255,0.2)"/>
      <stop offset="60%" stop-color="rgba(215,195,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(155,215,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="900" height="637" fill="url(#dg1)"/>
  <rect width="900" height="637" fill="url(#dg2)"/>
  <rect width="900" height="637" fill="url(#dg3)"/>
  <rect width="900" height="637" fill="url(#prism)"/>
  <g opacity="0.065" transform="translate(450,318)">${rays(18, 520, '#2060b0', '1')}</g>
  <g opacity="0.08" transform="translate(450,318)">${diaShapes}</g>
  <g transform="translate(98,98)"   opacity="0.22">${rays(8,24,'#3080d0','1')}<circle cx="0" cy="0" r="3" fill="#70c0f8"/></g>
  <g transform="translate(802,539)" opacity="0.22">${rays(8,24,'#3080d0','1')}<circle cx="0" cy="0" r="3" fill="#70c0f8"/></g>
  <g transform="translate(44,318)"  opacity="0.18">${rays(8,15,'#4090e0','0.8')}<circle cx="0" cy="0" r="2" fill="#90d0f8"/></g>
  <g transform="translate(856,318)" opacity="0.18">${rays(8,15,'#4090e0','0.8')}<circle cx="0" cy="0" r="2" fill="#90d0f8"/></g>
  <g transform="translate(450,28)"  opacity="0.16">${rays(8,12,'#3878d0','0.7')}<circle cx="0" cy="0" r="1.8" fill="#80c8f8"/></g>
  <g transform="translate(450,609)" opacity="0.16">${rays(8,12,'#3878d0','0.7')}<circle cx="0" cy="0" r="1.8" fill="#80c8f8"/></g>
  <g transform="translate(56,56)"   opacity="0.18">${hexCorner}</g>
  <g transform="translate(844,56)"  opacity="0.18">${hexCorner}</g>
  <g transform="translate(56,581)"  opacity="0.18">${hexCorner}</g>
  <g transform="translate(844,581)" opacity="0.18">${hexCorner}</g>
  <g opacity="0.6">${waveBand(26,  -1, 'rgba(30,90,200,0.042)', 16)}</g>
  <g opacity="0.6">${waveBand(600,  1, 'rgba(30,90,200,0.042)', 16)}</g>
  <g transform="translate(450,318)" opacity="0.042">
    <polygon points="0,-85 64,-22 0,85 -64,-22"  fill="#1850a8"/>
    <polygon points="0,-85 64,-22 0,12"           fill="#3880c8"/>
    <polygon points="0,-85 -64,-22 0,12"          fill="#0838a0"/>
    <line x1="-64" y1="-22" x2="64" y2="-22" stroke="#60b8f0" stroke-width="0.5"/>
  </g>
  <text x="450" y="338" text-anchor="middle" dominant-baseline="middle"
        font-family="Cinzel,serif" font-size="180" font-weight="700"
        fill="rgba(20,70,190,0.03)" letter-spacing="4">TM</text>
</svg>`;
  }

  const tierClass   = finalTier === 'gold' ? 'cert-gold' : finalTier === 'diamond' ? 'cert-diamond' : 'cert-silver';
  const tierName    = finalTier === 'gold' ? 'Gold  Excellence' : finalTier === 'diamond' ? 'Diamond  Mastery' : 'Silver  Distinction';
  const subtitle    = finalTier === 'gold' ? 'of Academic Excellence' : finalTier === 'diamond' ? 'of Supreme Mastery' : 'of Distinguished Achievement';
  const description = finalTier === 'diamond'
    ? `In recognition of flawless performance and absolute mastery in<br><em>${course}</em> — a rare and extraordinary achievement<br>representing the pinnacle of academic and intellectual excellence.`
    : finalTier === 'gold'
      ? `In recognition of superior accomplishment and exemplary mastery in<br><em>${course}</em> — a testament to extraordinary<br>dedication, intellectual rigor, and the pursuit of excellence.`
      : `In recognition of exceptional performance and demonstrated mastery in<br><em>${course}</em> — reflecting outstanding skill,<br>discipline, and commitment to academic excellence.`;

  tempContainer.innerHTML = `
    <div class="certificate ${tierClass}">
      ${buildSVG(finalTier)}
      <div class="border-frame">
        <div class="border-outer">
          <div class="corner tl"></div><div class="corner tr"></div>
          <div class="corner bl"></div><div class="corner br"></div>
        </div>
        <div class="border-inner"></div>
      </div>
      <div class="cert-body">
        <div class="tier-badge">
          <div class="badge-line"></div>
          <span class="tier-name">${tierName}</span>
          <div class="badge-line"></div>
        </div>
        <div class="cert-title">Certificate</div>
        <div class="cert-subtitle">${subtitle}</div>
        <div class="presented-to">This certificate is proudly presented to</div>
        <div class="recipient-name">${name}</div>
        <div class="name-line"></div>
        <div class="cert-desc">${description}</div>
        <div class="cert-footer">
          <div class="footer-col">
            <span class="footer-label">${date}</span>
            <span class="footer-label">Date of Issue</span>
          </div>
          <div class="score-badge">
            <span class="score-pct">${Math.round(score)}%</span>
            <span class="score-word">Score</span>
          </div>
          <div class="footer-col">
            <span class="footer-label">Issued By</span>
            <span class="footer-label">${issuer}</span>
          </div>
        </div>
      </div>
      ${certId ? `<div class="cert-id">ID: ${certId} \u00b7 techmocks.edu/verify/${certId}</div>` : ''}
    </div>
  `;

  try {
    void tempContainer.offsetHeight;
    const canvas = await html2canvas(tempContainer.firstElementChild, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      width: 900,
      height: 637,
      windowWidth: 900,
      windowHeight: 637,
      allowTaint: true,
      onclone: (clonedDoc) => {
        const s = clonedDoc.createElement('style');
        s.textContent = `*, *::before, *::after { animation: none !important; transition: none !important; }`;
        clonedDoc.head.appendChild(s);
      }
    });
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
    const safeName = (name || 'recipient').replace(/[^a-zA-Z0-9]/g, '_');
    pdf.save(`Certificate_${finalTier.toUpperCase()}_${safeName}_${Math.round(score)}%.pdf`);
  } catch (err) {
    console.error('Generation failed:', err);
    alert('Failed to generate certificate. Open console (F12) for details.');
  } finally {
    document.body.removeChild(tempContainer);
  }
}

export default generateCertificatePDF;