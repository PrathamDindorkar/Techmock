// CertificateService.js - Premium Luxury Edition
import jsPDF from 'jspdf';

const getTierConfig = (accuracy) => {
  const score = Number(accuracy);

  if (score >= 90) {
    return {
      tier: 'GOLD',
      label: 'Certificate of Excellence',
      bgGradientStart: [255, 248, 220], // soft ivory
      bgGradientEnd: [255, 240, 180],
      primary: [212, 175, 55],     // rich metallic gold
      secondary: [184, 134, 11],   // deep gold
      accent: [255, 255, 240],     // near-white shine
      textMain: [40, 40, 40],
      border: [180, 140, 40],
      ribbon: [220, 180, 60],
      sealOuter: [139, 69, 19],
      sealInner: [255, 215, 0]
    };
  }

  if (score >= 80) {
    return {
      tier: 'SILVER',
      label: 'Certificate of Distinction',
      bgGradientStart: [245, 245, 245],
      bgGradientEnd: [220, 220, 230],
      primary: [192, 192, 192],    // bright silver
      secondary: [140, 140, 140],
      accent: [255, 255, 255],
      textMain: [30, 30, 30],
      border: [160, 160, 160],
      ribbon: [210, 210, 210],
      sealOuter: [100, 100, 100],
      sealInner: [230, 230, 230]
    };
  }

  return {
    tier: 'BRONZE',
    label: 'Certificate of Achievement',
    bgGradientStart: [245, 235, 220],
    bgGradientEnd: [220, 190, 150],
    primary: [176, 141, 87],
    secondary: [139, 90, 43],
    accent: [255, 245, 230],
    textMain: [50, 40, 30],
    border: [160, 120, 70],
    ribbon: [205, 150, 90],
    sealOuter: [120, 70, 30],
    sealInner: [210, 160, 100]
  };
};

export const generateCertificate = (topic, userName, accuracy) => {
  const config = getTierConfig(accuracy);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;  // 297
  const pageHeight = doc.internal.pageSize.height; // 210
  const centerX = pageWidth / 2;

  // ────────────────────────────────────────────────
  // 1. Elegant Background with Subtle Gradient + Security
  // ────────────────────────────────────────────────
  const gradient = doc.internal.getRadialGradient(
    centerX, pageHeight / 2, 20,
    centerX, pageHeight / 2, Math.max(pageWidth, pageHeight) / 1.2
  );
  gradient.addColorStop(0, `rgb(${config.bgGradientStart.join(',')})`);
  gradient.addColorStop(1, `rgb(${config.bgGradientEnd.join(',')})`);
  doc.setFillColor(gradient); // fallback
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Very subtle micro-pattern security background (luxury watermark feel)
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.05);
  for (let i = -pageHeight; i < pageWidth + pageHeight; i += 4) {
    doc.line(i, 0, i - pageHeight, pageHeight);
  }

  // ────────────────────────────────────────────────
  // 2. Premium Thin Ornate Border (double layer for depth)
  // ────────────────────────────────────────────────
  doc.setDrawColor(...config.border);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'D');

  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(0.25);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22, 'D');

  // Corner embellishments (small flourishes)
  const cornerSize = 18;
  doc.setFillColor(...config.primary);
  doc.circle(8 + cornerSize/2, 8 + cornerSize/2, cornerSize/2, 'F');
  doc.circle(pageWidth - 8 - cornerSize/2, 8 + cornerSize/2, cornerSize/2, 'F');
  doc.circle(8 + cornerSize/2, pageHeight - 8 - cornerSize/2, cornerSize/2, 'F');
  doc.circle(pageWidth - 8 - cornerSize/2, pageHeight - 8 - cornerSize/2, cornerSize/2, 'F');

  // ────────────────────────────────────────────────
  // 3. Central Seal – Larger, More Dramatic & Shiny
  // ────────────────────────────────────────────────
  const sealX = centerX;
  const sealY = 55;
  const sealRadius = 32;

  // Outer glow / starburst (subtle)
  doc.setFillColor(...config.sealInner);
  for (let i = 0; i < 32; i++) {
    const angle = (i * 360 / 32) * Math.PI / 180;
    const rOuter = sealRadius + 12 + (i % 2 ? 6 : 0);
    const rInner = sealRadius + 4;
    doc.moveTo(sealX + rInner * Math.cos(angle), sealY + rInner * Math.sin(angle));
    doc.lineTo(sealX + rOuter * Math.cos(angle), sealY + rOuter * Math.sin(angle));
  }
  doc.fill();

  // Main seal body with gradient feel (simulated)
  doc.setFillColor(...config.primary);
  doc.circle(sealX, sealY, sealRadius, 'F');

  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(1.2);
  doc.circle(sealX, sealY, sealRadius - 4, 'D');
  doc.circle(sealX, sealY, sealRadius - 8, 'D');

  // Seal text – bold & centered
  doc.setTextColor(...config.accent);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(config.tier, sealX, sealY - 4, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('PREMIUM AWARD', sealX, sealY + 2, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${accuracy}%`, sealX, sealY + 12, { align: 'center' });

  // ────────────────────────────────────────────────
  // 4. Flowing Ribbon/Wave Accent (adds life & movement)
  // ────────────────────────────────────────────────
  doc.setFillColor(...config.ribbon);
  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(0.5);

  // Gentle wave under header
  doc.beginPath();
  doc.moveTo(30, 90);
  doc.bezierCurveTo(centerX - 60, 75, centerX + 60, 105, pageWidth - 30, 90);
  doc.lineTo(pageWidth - 30, 100);
  doc.bezierCurveTo(centerX + 60, 115, centerX - 60, 85, 30, 100);
  doc.close();
  doc.fill();
  doc.stroke();

  // ────────────────────────────────────────────────
  // 5. Typography – Elegant & Dramatic
  // ────────────────────────────────────────────────
  // Title
  doc.setTextColor(...config.primary);
  doc.setFont('times', 'bold');
  doc.setFontSize(48);
  doc.text('CERTIFICATE', centerX, 35, { align: 'center' });

  // Subtitle label
  doc.setFontSize(14);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(90, 90, 90);
  doc.text(config.label.toUpperCase(), centerX, 48, { align: 'center' });

  // Presented to
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('This Certificate is Proudly Presented to', centerX, 110, { align: 'center' });

  // Name – large, luxurious
  doc.setTextColor(...config.primary);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(60);
  const name = userName || 'Valued Achiever';
  doc.text(name, centerX, 138, { align: 'center' });

  // Underline flourish
  const nameW = doc.getTextWidth(name);
  doc.setDrawColor(...config.primary);
  doc.setLineWidth(1);
  doc.line(centerX - nameW/2 - 12, 145, centerX + nameW/2 + 12, 145);

  // Description
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  const desc = `In recognition of exceptional performance and mastery in "${topic || 'Technical Excellence'}" achieving ${accuracy}%. This award celebrates dedication, skill, and outstanding accomplishment.`;
  const descLines = doc.splitTextToSize(desc, 220);
  doc.text(descLines, centerX, 160, { align: 'center', lineHeightFactor: 1.5 });

  // ────────────────────────────────────────────────
  // 6. Footer – Minimal & Refined
  // ────────────────────────────────────────────────
  const footerY = pageHeight - 18;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(centerX - 80, footerY, centerX - 20, footerY);
  doc.line(centerX + 20, footerY, centerX + 80, footerY);

  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Issued: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), centerX - 50, footerY + 6, { align: 'center' });
  doc.text('Authorized by Techmocks Academy', centerX + 50, footerY + 6, { align: 'center' });

  // Cert ID
  const certId = `TM-${config.tier[0]}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.setTextColor(140, 140, 140);
  doc.text(`ID: ${certId} • Verify: techmocks.edu/verify/${certId}`, centerX, pageHeight - 6, { align: 'center' });

  // ────────────────────────────────────────────────
  // Save
  // ────────────────────────────────────────────────
  const cleanName = (userName || 'Learner').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${config.tier}_Premium_Certificate_${cleanName}_${accuracy}%.pdf`);
};