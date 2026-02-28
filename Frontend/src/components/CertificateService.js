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
    if (score >= 90) {
      finalTier = 'diamond';
    } else if (score >= 80) {
      finalTier = 'gold';
    } else {
      finalTier = 'silver';
    }
  }

  // ────────────────────────────────
  // 1. Create hidden container
  // ────────────────────────────────
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = '900px';
  tempContainer.style.height = '637px';
  document.body.appendChild(tempContainer);

  // ────────────────────────────────
  // 2. Load fonts (wait longer)
  // ────────────────────────────────
  if (!document.getElementById('cert-fonts')) {
    const link = document.createElement('link');
    link.id = 'cert-fonts';
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&family=Lato:wght@300;400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    await new Promise(r => setTimeout(r, 2000)); // longer wait — fonts are heavy
  }

  // ────────────────────────────────
  // 3. Inject FULL CSS (complete version)
  // ────────────────────────────────
  if (!document.getElementById('cert-global-style')) {
    const style = document.createElement('style');
    style.id = 'cert-global-style';
    style.textContent = `
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .certificate {
        width: 900px;
        height: 637px;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
        font-family: 'Lato', sans-serif;
        color: white;
        background: #0a0a0f; /* fallback */
      }

      /* ────────────── SILVER ────────────── */
      .cert-silver {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
        border: 1px solid rgba(192,192,192,0.3);
        box-shadow: 0 0 0 8px rgba(192,192,192,0.04), 0 40px 120px rgba(0,0,0,0.8), inset 0 0 60px rgba(192,192,192,0.08);
      }
      .cert-silver .bg-texture {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 20% 50%, rgba(192,192,192,0.04) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 50%, rgba(100,149,237,0.06) 0%, transparent 60%);
      }
      .cert-silver .grid-lines {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(192,192,192,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(192,192,192,0.04) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* ────────────── GOLD ────────────── */
      .cert-gold {
        background: linear-gradient(135deg, #1a1200 0%, #2d1f00 40%, #1a0f00 100%);
        border: 1px solid rgba(212,175,55,0.3);
        box-shadow: 0 0 0 8px rgba(212,175,55,0.04), 0 40px 120px rgba(0,0,0,0.9), inset 0 0 80px rgba(212,175,55,0.06);
      }
      .cert-gold .bg-texture {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 25% 40%, rgba(212,175,55,0.08) 0%, transparent 55%),
                    radial-gradient(ellipse at 75% 60%, rgba(180,120,20,0.06) 0%, transparent 55%);
      }
      .cert-gold .grid-lines {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* ────────────── DIAMOND ────────────── */
      .cert-diamond {
        background: linear-gradient(135deg, #000814 0%, #001233 40%, #023e8a 70%, #001233 100%);
        border: 1px solid rgba(185,242,255,0.2);
        box-shadow: 0 0 0 8px rgba(185,242,255,0.03), 0 40px 120px rgba(0,0,0,0.9), inset 0 0 100px rgba(100,200,255,0.06);
      }
      .cert-diamond .bg-texture {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 20% 30%, rgba(100,200,255,0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 70%, rgba(180,100,255,0.05) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(185,242,255,0.04) 0%, transparent 70%);
      }
      .cert-diamond .grid-lines {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(185,242,255,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(185,242,255,0.04) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* Borders & Corners */
      .border-frame { position: absolute; inset: 16px; pointer-events: none; }
      .border-outer { position: absolute; inset: 0; border: 1.5px solid; }
      .border-inner { position: absolute; inset: 6px; border: 0.5px solid; }
      .cert-silver .border-outer { border-color: rgba(192,192,192,0.5); }
      .cert-silver .border-inner { border-color: rgba(192,192,192,0.2); }
      .cert-gold .border-outer { border-color: rgba(212,175,55,0.6); }
      .cert-gold .border-inner { border-color: rgba(212,175,55,0.25); }
      .cert-diamond .border-outer { border-color: rgba(185,242,255,0.4); }
      .cert-diamond .border-inner { border-color: rgba(185,242,255,0.15); }

      .corner {
        position: absolute;
        width: 32px; height: 32px;
        border-style: solid;
        border-width: 0;
      }
      .corner.tl { top: -1px; left: -1px; border-top-width: 2px; border-left-width: 2px; }
      .corner.tr { top: -1px; right: -1px; border-top-width: 2px; border-right-width: 2px; }
      .corner.bl { bottom: -1px; left: -1px; border-bottom-width: 2px; border-left-width: 2px; }
      .corner.br { bottom: -1px; right: -1px; border-bottom-width: 2px; border-right-width: 2px; }
      .cert-silver .corner { border-color: #c0c0c0; }
      .cert-gold .corner { border-color: #d4af37; }
      .cert-diamond .corner { border-color: #b9f2ff; }

      /* Sheen */
      .sheen {
        position: absolute;
        top: 0; left: -100%; width: 50%; height: 100%;
        pointer-events: none;
      }
      .cert-silver .sheen {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent);
      }
      .cert-gold .sheen {
        width: 30%;
        background: linear-gradient(90deg, transparent, rgba(255,220,50,0.04), transparent);
      }
      .cert-diamond .sheen {
        width: 40%;
        background: linear-gradient(90deg, transparent, rgba(185,242,255,0.04), transparent);
      }

      /* Content layout */
      .cert-body {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 140px 8% 40px;
        text-align: center;
      }

      .tier-badge {
        display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4%;
  position: absolute;           
  top: 70px;                    
  left: 50%;
  transform: translateX(-50%);  
  z-index: 12;                  
  width: auto;
      }
      .badge-line {
        height: 1px;
        width: 60px;
      }
      .cert-silver .badge-line { background: linear-gradient(90deg, transparent, #c0c0c0); }
      .cert-silver .badge-line:last-child { background: linear-gradient(90deg, #c0c0c0, transparent); }
      .cert-gold .badge-line { background: linear-gradient(90deg, transparent, #d4af37); }
      .cert-gold .badge-line:last-child { background: linear-gradient(90deg, #d4af37, transparent); }
      .cert-diamond .badge-line { background: linear-gradient(90deg, transparent, #b9f2ff); }
      .cert-diamond .badge-line:last-child { background: linear-gradient(90deg, #b9f2ff, transparent); }

      .tier-name {
        font-family: 'Cinzel', serif;
        font-size: 1.05rem;
        letter-spacing: 0.5em;
        font-weight: 600;
      }
      .cert-silver .tier-name { color: #c0c0c0; }
      .cert-gold .tier-name { color: #d4af37; }
      .cert-diamond .tier-name { color: #b9f2ff; }

      .cert-title {
        font-family: 'Cinzel', serif;
        font-size: 3rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        line-height: 1;
        margin-bottom: 1.5%;
      }
      .cert-silver .cert-title { color: #e8e8e8; text-shadow: 0 0 40px rgba(192,192,192,0.3); }
      .cert-gold .cert-title,
      .cert-diamond .cert-title {
        background-size: 200% auto;
      }
      .cert-gold .cert-title {
        color: #e8e8e8
      }

      .cert-subtitle {
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-size: 1rem;
        letter-spacing: 0.15em;
        margin-bottom: 3%;
      }
      .cert-silver .cert-subtitle { color: rgba(192,192,192,0.6); }
      .cert-gold .cert-subtitle { color: rgba(212,175,55,0.6); }
      .cert-diamond .cert-subtitle { color: rgba(185,242,255,0.6); }

      .presented-to {
        font-family: 'Lato', sans-serif;
        font-weight: 300;
        font-size: 0.8rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        margin-bottom: 1.5%;
      }
      .cert-silver .presented-to { color: rgba(255,255,255,0.35); }
      .cert-gold .presented-to { color: rgba(255,220,100,0.35); }
      .cert-diamond .presented-to { color: rgba(185,242,255,0.35); }

      .recipient-name {
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 700;
        font-size: 3.4rem;
        line-height: 1.1;
        margin-bottom: 1%;
      }
      .cert-silver .recipient-name { color: #ffffff; }
      .cert-gold .recipient-name {
       color: #e8f5ff;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .cert-diamond .recipient-name {
        color: #e8f5ff;                       /* slightly warmer white-cyan */
  text-shadow: 
    0 0 16px rgba(185,242,255, 0.75),
    0 0 32px rgba(125,216,255, 0.4);
  font-weight: 800;
      }

      .name-line {
        height: 1px;
        width: 45%;
        margin: 0 auto 3% auto;
      }
      .cert-silver .name-line { background: linear-gradient(90deg, transparent, rgba(192,192,192,0.4), transparent); }
      .cert-gold .name-line { background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent); }
      .cert-diamond .name-line { background: linear-gradient(90deg, transparent, rgba(185,242,255,0.4), transparent); }

      .cert-desc {
        font-family: 'Cormorant Garamond', serif;
        font-size: 0.95rem;
        font-weight: 300;
        line-height: 1.7;
        max-width: 75%;
        margin-bottom: 4%;
      }
      .cert-silver .cert-desc { color: rgba(255,255,255,0.45); }
      .cert-gold .cert-desc { color: rgba(255,220,100,0.4); }
      .cert-diamond .cert-desc { color: rgba(185,242,255,0.4); }

      .cert-footer {
        display: flex;
        width: 80%;
        justify-content: space-between;
        align-items: flex-end;
      }
      .footer-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .footer-line {
        width: 100px;
        height: 1px;
        margin-bottom: 4px;
      }
      .cert-silver .footer-line { background: rgba(192,192,192,0.3); }
      .cert-gold .footer-line { background: rgba(212,175,55,0.3); }
      .cert-diamond .footer-line { background: rgba(185,242,255,0.3); }

      .footer-label {
        font-family: 'Lato', sans-serif;
        font-weight: 300;
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        text-transform: uppercase;
      }
      .cert-silver .footer-label { color: rgba(192,192,192,0.4); }
      .cert-gold .footer-label { color: rgba(212,175,55,0.4); }
      .cert-diamond .footer-label { color: rgba(185,242,255,0.4); }

      .score-badge {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .cert-silver .score-badge {
        background: radial-gradient(circle, rgba(192,192,192,0.15) 0%, transparent 70%);
        border: 1px solid rgba(192,192,192,0.4);
        box-shadow: 0 0 20px rgba(192,192,192,0.1), inset 0 0 20px rgba(192,192,192,0.05);
      }
      .cert-gold .score-badge {
        background: radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%);
        border: 1px solid rgba(212,175,55,0.5);
        box-shadow: 0 0 20px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.05);
      }
      .cert-diamond .score-badge {
        background: radial-gradient(circle, rgba(185,242,255,0.1) 0%, transparent 70%);
        border: 1px solid rgba(185,242,255,0.4);
        box-shadow: 0 0 30px rgba(100,200,255,0.15), inset 0 0 20px rgba(185,242,255,0.05);
      }

      .score-pct {
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 1.4rem;
      }
      .cert-silver .score-pct { color: #c0c0c0; }
      .cert-gold .score-pct { color: #d4af37; }
      .cert-diamond .score-pct { color: #b9f2ff; }

      .score-word {
        font-family: 'Lato', sans-serif;
        font-weight: 300;
        font-size: 0.5rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      .cert-silver .score-word { color: rgba(192,192,192,0.5); }
      .cert-gold .score-word { color: rgba(212,175,55,0.5); }
      .cert-diamond .score-word { color: rgba(185,242,255,0.5); }

      /* Crown ornament */
      .crown-ornament {
        position: absolute;
        top: 18px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .ornament-dot {
        width: 5px; height: 5px;
        border-radius: 50%;
        opacity: 0.5;
      }
      .ornament-line {
        height: 1px;
        width: 30px;
        opacity: 0.3;
      }
      .cert-silver .ornament-dot, .cert-silver .ornament-line { background: #c0c0c0; }
      .cert-gold .ornament-dot, .cert-gold .ornament-line { background: #d4af37; }
      .cert-diamond .ornament-dot, .cert-diamond .ornament-line { background: #b9f2ff; }

      /* Diamond extras */
      .sparkle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.8;
      }
      .diamond-gem {
        position: absolute;
        top: 20px;
        width: 16px; height: 16px;
        transform: rotate(45deg);
        border: 1px solid rgba(185,242,255,0.25);
        background: rgba(185,242,255,0.05);
      }

      .cert-id {
        font-family: 'Lato', sans-serif;
        font-weight: 300;
        font-size: 0.55rem;
        letter-spacing: 0.1em;
        position: absolute;
        bottom: 10px;
        right: 20px;
      }
      .cert-silver .cert-id { color: rgba(192,192,192,0.2); }
      .cert-gold .cert-id { color: rgba(212,175,55,0.2); }
      .cert-diamond .cert-id { color: rgba(185,242,255,0.15); }
    `;
    document.head.appendChild(style);
  }

  // ────────────────────────────────
  //  Build HTML (exact match to your HTML)
  // ────────────────────────────────
  const tierClass = finalTier === 'gold' ? 'cert-gold' : finalTier === 'diamond' ? 'cert-diamond' : 'cert-silver';

  const tierName = finalTier === 'gold' ? 'Gold  Excellence' : finalTier === 'diamond' ? 'Diamond  Mastery' : 'Silver  Distinction';
  const subtitle = finalTier === 'gold' ? 'of Academic Excellence' : finalTier === 'diamond' ? 'of Supreme Mastery' : 'of Distinguished Achievement';

  const description = finalTier === 'diamond'
    ? `In recognition of flawless performance and absolute mastery in<br><em>${course}</em> — a rare and extraordinary achievement<br>representing the pinnacle of academic and intellectual excellence.`
    : finalTier === 'gold'
      ? `In recognition of superior accomplishment and exemplary mastery in<br><em>${course}</em> — a testament to extraordinary<br>dedication, intellectual rigor, and the pursuit of excellence.`
      : `In recognition of exceptional performance and demonstrated mastery in<br><em>${course}</em> — reflecting outstanding skill,<br>discipline, and commitment to academic excellence.`;

  const crownMiddle = finalTier === 'silver'
    ? 'width:7px;height:7px;opacity:0.7'
    : finalTier === 'gold'
      ? 'width:9px;height:9px;opacity:0.8'
      : 'width:10px;height:10px;opacity:1;background:rgba(185,242,255,0.9);border-radius:50%;box-shadow:0 0 8px rgba(100,200,255,0.6)';

  tempContainer.innerHTML = `
    <div class="certificate ${tierClass}">
      <div class="bg-texture"></div>
      <div class="grid-lines"></div>
      <div class="sheen"></div>

      <div class="border-frame">
        <div class="border-outer">
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>
        </div>
        <div class="border-inner"></div>
      </div>

      <div class="crown-ornament">
        <div class="ornament-line"></div>
        <div class="ornament-dot"></div>
        <div class="ornament-dot" style="${crownMiddle}"></div>
        <div class="ornament-dot"></div>
        <div class="ornament-line"></div>
      </div>

      ${finalTier === 'diamond' ? `
        <div class="sparkle" style="width:3px;height:3px;background:#b9f2ff;top:15%;left:12%;"></div>
        <div class="sparkle" style="width:2px;height:2px;background:#7dd8ff;top:70%;left:8%;"></div>
        <div class="sparkle" style="width:4px;height:4px;background:#e0f7ff;top:25%;right:10%;"></div>
        <div class="sparkle" style="width:2px;height:2px;background:#b9f2ff;top:80%;right:15%;"></div>
        <div class="sparkle" style="width:3px;height:3px;background:#7dd8ff;top:50%;left:5%;"></div>
        <div class="sparkle" style="width:2px;height:2px;background:#b9f2ff;top:40%;right:6%;"></div>
        <div class="diamond-gem" style="left:36px;"></div>
        <div class="diamond-gem" style="right:36px;"></div>
      ` : ''}

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

      ${certId ? `<div class="cert-id">ID: ${certId} · techmocks.edu/verify/${certId}</div>` : ''}
    </div>
  `;

  try {
    // Force layout/reflow
    void tempContainer.offsetHeight;

    const canvas = await html2canvas(tempContainer.firstElementChild, {
      scale: 4,                     // higher = sharper text & gradients
      useCORS: true,
      logging: false,
      backgroundColor: null,
      width: 900,
      height: 637,
      windowWidth: 900,
      windowHeight: 637,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Freeze animations & force text clipping
        const s = clonedDoc.createElement('style');
        s.textContent = `
          @keyframes shimmer, silverSheen, sparkleAnim, pulse { from,to { } }
          *, *::before, *::after { animation: none !important; transition: none !important; }
          [class*="name"], [class*="title"] { background-clip: text !important; -webkit-background-clip: text !important; }
        `;
        clonedDoc.head.appendChild(s);
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

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