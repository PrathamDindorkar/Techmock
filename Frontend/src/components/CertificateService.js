// CertificateService.js
import jsPDF from 'jspdf';

const getTierConfig = (accuracy) => {
  const score = Number(accuracy);
  
  if (score >= 90) {
    return {
      tier: 'GOLD',
      label: 'Certificate of Excellence',
      primary: [184, 134, 11],      // Deep Gold
      secondary: [218, 165, 32],     // Goldenrod
      accent: [255, 245, 220],       // Bright Shine
      border: [184, 134, 11],
      ribbonGradient: [255, 215, 0], // Brighter gold for gradient
      sealRing: [139, 101, 8]        // Darker gold for contrast
    };
  }
  
  if (score >= 80) {
    return {
      tier: 'SILVER',
      label: 'Certificate of Distinction',
      primary: [70, 70, 70],         // Dark Steel
      secondary: [160, 160, 160],    // Silver
      accent: [245, 245, 245],       // White Silver
      border: [100, 100, 100],
      ribbonGradient: [192, 192, 192],
      sealRing: [50, 50, 50]
    };
  }
  
  return {
    tier: 'BRONZE',
    label: 'Certificate of Achievement',
    primary: [100, 50, 20],         // Deep Bronze
    secondary: [176, 141, 87],      // Aged Bronze
    accent: [245, 235, 220],        // Tan
    border: [120, 70, 30],
    ribbonGradient: [205, 127, 50],
    sealRing: [80, 40, 15]
  };
};

export const generateCertificate = (topic, userName, accuracy) => {
  const config = getTierConfig(accuracy);
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.width;   // 297mm
  const pageHeight = doc.internal.pageSize.height; // 210mm

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. BACKGROUND WITH PREMIUM SECURITY PATTERN
  // ═══════════════════════════════════════════════════════════════════════════
  
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Enhanced Guilloche Pattern (Security Lines) - More sophisticated
  doc.setDrawColor(245, 245, 245);
  doc.setLineWidth(0.08);
  for (let i = 0; i < pageWidth; i += 3) {
    doc.line(i, 0, pageWidth - i, pageHeight);
  }
  
  // Diagonal guilloche in opposite direction
  doc.setDrawColor(248, 248, 248);
  for (let i = 0; i < pageWidth; i += 3) {
    doc.line(0, i * (pageHeight / pageWidth), i, pageHeight);
  }

  // Subtle watermark circles
  doc.setDrawColor(250, 250, 250);
  doc.setLineWidth(0.5);
  doc.circle(pageWidth / 2 + 40, pageHeight / 2, 60, 'D');
  doc.circle(pageWidth / 2 + 40, pageHeight / 2, 65, 'D');
  doc.circle(pageWidth / 2 + 40, pageHeight / 2, 70, 'D');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. GEOMETRIC DESIGN ELEMENTS (Matching reference image)
  // ═══════════════════════════════════════════════════════════════════════════

  // Top-Left Black Header Triangle
  doc.setFillColor(22, 22, 22);
  doc.moveTo(0, 0);
  doc.lineTo(150, 0);
  doc.lineTo(0, 115);
  doc.fill();

  // Top-Right "Peeled Corner" Effect
  doc.setFillColor(30, 30, 30);
  doc.moveTo(pageWidth, 0);
  doc.lineTo(pageWidth - 70, 0);
  doc.lineTo(pageWidth, 45);
  doc.fill();

  // Metallic accent on the fold
  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(1.5);
  doc.line(pageWidth - 70, 0, pageWidth, 45);
  
  // Inner highlight line for depth
  doc.setDrawColor(...config.accent);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - 69, 1, pageWidth - 1, 44);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LUXURY DIAGONAL RIBBONS (Tier-colored stripes)
  // ═══════════════════════════════════════════════════════════════════════════

  // Primary Ribbon Stripe
  doc.setFillColor(...config.primary);
  doc.moveTo(0, 115);
  doc.lineTo(150, 0);
  doc.lineTo(168, 0);
  doc.lineTo(0, 133);
  doc.fill();

  // Secondary Ribbon Stripe (lighter shade)
  doc.setFillColor(...config.secondary);
  doc.moveTo(0, 133);
  doc.lineTo(168, 0);
  doc.lineTo(186, 0);
  doc.lineTo(0, 151);
  doc.fill();
  
  // Accent thin stripe for sophistication
  doc.setFillColor(...config.ribbonGradient);
  doc.moveTo(0, 151);
  doc.lineTo(186, 0);
  doc.lineTo(196, 0);
  doc.lineTo(0, 161);
  doc.fill();

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. BOTTOM BRANDING BAR
  // ═══════════════════════════════════════════════════════════════════════════

  doc.setFillColor(22, 22, 22);
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
  
  // Metallic top border of footer
  doc.setFillColor(...config.secondary);
  doc.rect(0, pageHeight - 16, pageWidth, 1.2, 'F');
  
  // Subtle gradient effect on footer
  doc.setFillColor(...config.primary);
  doc.rect(0, pageHeight - 16, pageWidth, 0.4, 'F');

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PREMIUM SEAL WITH RIBBON (Enhanced design)
  // ═══════════════════════════════════════════════════════════════════════════

  const sealX = pageWidth / 2 + 40;
  const sealY = 40;

  // Ribbon Tails (flowing beneath the seal)
  doc.setFillColor(...config.primary);
  
  // Left ribbon tail
  doc.moveTo(sealX - 12, sealY + 12);
  doc.lineTo(sealX - 22, sealY + 42);
  doc.lineTo(sealX - 18, sealY + 44);
  doc.lineTo(sealX - 5, sealY + 30);
  doc.fill();
  
  // Right ribbon tail
  doc.moveTo(sealX + 12, sealY + 12);
  doc.lineTo(sealX + 22, sealY + 42);
  doc.lineTo(sealX + 18, sealY + 44);
  doc.lineTo(sealX + 5, sealY + 30);
  doc.fill();
  
  // Ribbon tail shading for depth
  doc.setFillColor(...config.sealRing);
  doc.triangle(sealX - 22, sealY + 42, sealX - 18, sealY + 44, sealX - 16, sealY + 40, 'F');
  doc.triangle(sealX + 22, sealY + 42, sealX + 18, sealY + 44, sealX + 16, sealY + 40, 'F');

  // Starburst Seal (40 pointed star)
  doc.setFillColor(...config.secondary);
  const points = 40;
  for (let i = 0; i <= points; i++) {
    let angle = (i * (360 / points)) * (Math.PI / 180);
    let r = i % 2 === 0 ? 22 : 18;
    doc[i === 0 ? 'moveTo' : 'lineTo'](
      sealX + r * Math.cos(angle), 
      sealY + r * Math.sin(angle)
    );
  }
  doc.fill();

  // Outer ring for definition
  doc.setDrawColor(...config.sealRing);
  doc.setLineWidth(0.8);
  doc.circle(sealX, sealY, 22, 'D');

  // Inner Badge Circle (main seal face)
  doc.setFillColor(...config.accent);
  doc.circle(sealX, sealY, 15, 'F');
  
  // Decorative rings
  doc.setDrawColor(...config.primary);
  doc.setLineWidth(1);
  doc.circle(sealX, sealY, 13, 'D');
  
  doc.setLineWidth(0.4);
  doc.circle(sealX, sealY, 11, 'D');

  // Seal Text
  doc.setTextColor(...config.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(config.tier, sealX, sealY - 1, { align: 'center' });
  
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL AWARD', sealX, sealY + 4, { align: 'center' });
  
  // Score percentage in seal
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`${accuracy}%`, sealX, sealY + 10, { align: 'center' });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. TYPOGRAPHY & CONTENT
  // ═══════════════════════════════════════════════════════════════════════════

  // Header Text (White on Black triangle)
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(38);
  doc.text('CERTIFICATE', 28, 50);

  // Elegant decorative line with ornaments
  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(0.6);
  doc.line(28, 56, 95, 56);
  
  // Decorative dots
  doc.setFillColor(...config.secondary);
  doc.circle(28, 56, 1, 'F');
  doc.circle(95, 56, 1, 'F');
  
  // Small ornamental line
  doc.setLineWidth(0.3);
  doc.line(28, 58, 95, 58);

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. MAIN CONTENT AREA
  // ═══════════════════════════════════════════════════════════════════════════

  // Organization Name
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('TECHMOCKS ACADEMY', pageWidth / 2 + 40, 85, { align: 'center' });

  // Certificate Type Label
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(config.label.toUpperCase(), pageWidth / 2 + 40, 93, { align: 'center' });

  // Decorative divider
  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(0.4);
  const dividerY = 97;
  doc.line(pageWidth / 2 - 20, dividerY, pageWidth / 2 + 100, dividerY);
  doc.setFillColor(...config.secondary);
  doc.circle(pageWidth / 2 - 20, dividerY, 0.8, 'F');
  doc.circle(pageWidth / 2 + 100, dividerY, 0.8, 'F');

  // Presentation Text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', pageWidth / 2 + 40, 110, { align: 'center' });

  // Recipient Name (The star of the show)
  doc.setTextColor(...config.primary);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(52);
  const nameText = userName || 'Valued Learner';
  doc.text(nameText, pageWidth / 2 + 40, 132, { align: 'center' });

  // Elegant underline for name
  const nameWidth = doc.getTextWidth(nameText);
  doc.setDrawColor(...config.primary);
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 + 40 - nameWidth / 2 - 5, 137, pageWidth / 2 + 40 + nameWidth / 2 + 5, 137);
  
  // Double line for elegance
  doc.setLineWidth(0.3);
  doc.setDrawColor(...config.secondary);
  doc.line(pageWidth / 2 + 40 - nameWidth / 2 - 5, 139, pageWidth / 2 + 40 + nameWidth / 2 + 5, 139);

  // Achievement Description
  doc.setTextColor(70, 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  
  const mainText = `In recognition of outstanding achievement and demonstrated excellence in the comprehensive assessment of "${topic || 'Technical Knowledge'}" with an exemplary score of ${accuracy}%. This certificate acknowledges exceptional dedication, proficiency, and mastery of the subject matter.`;
  
  const splitMain = doc.splitTextToSize(mainText, 150);
  doc.text(splitMain, pageWidth / 2 + 40, 152, { 
    align: 'center',
    lineHeightFactor: 1.6
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. FOOTER - SIGNATURES & VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  const footerY = 182;

  // Signature Lines
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(55, footerY, 105, footerY);
  doc.line(pageWidth - 105, footerY, pageWidth - 55, footerY);

  // Labels under signature lines
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('DATE OF ISSUANCE', 80, footerY + 6, { align: 'center' });
  doc.text('DIRECTOR OF ASSESSMENT', pageWidth - 80, footerY + 6, { align: 'center' });

  // Actual date
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const issueDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(issueDate, 80, footerY - 2, { align: 'center' });

  // Official signature placeholder
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('Dr. A. Kumar', pageWidth - 80, footerY - 2, { align: 'center' });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. VERIFICATION & SECURITY INFO (Footer bar)
  // ═══════════════════════════════════════════════════════════════════════════

  // Generate unique certificate ID
  const certId = `TM-${config.tier.charAt(0)}-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
  
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(`Certificate ID: ${certId}`, 12, pageHeight - 5);
  doc.text(`Verify at: techmocks.edu/verify/${certId}`, pageWidth - 70, pageHeight - 5);
  
  // QR code placeholder indicator
  doc.setFontSize(6);
  doc.text('▪', pageWidth / 2, pageHeight - 6);
  doc.text('Digitally Certified', pageWidth / 2 + 3, pageHeight - 5);

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. FINAL BORDER FRAME
  // ═══════════════════════════════════════════════════════════════════════════

  // Outer decorative border
  doc.setDrawColor(...config.border);
  doc.setLineWidth(0.3);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'D');
  
  // Inner border for depth
  doc.setDrawColor(...config.secondary);
  doc.setLineWidth(0.15);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12, 'D');

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE CERTIFICATE
  // ═══════════════════════════════════════════════════════════════════════════

  const cleanName = (userName || 'Certificate').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${config.tier}_Certificate_${cleanName}_${accuracy}pct.pdf`;
  doc.save(fileName);
};