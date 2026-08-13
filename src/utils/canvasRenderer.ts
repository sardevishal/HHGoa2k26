import QRCode from 'qrcode';
import type { ProfileData, CropSettings } from '../types';
import {
  drawCroppedImage,
  roundedRect,
  drawGrain,
  truncateText,
} from './cropUtils';

const C = {
  bg: '#173C2E',
  bgDeep: '#0f2a1f',
  bgPanel: '#1e4a38',
  gold: '#FFE100',       // Bright vibrant gold matching official site
  goldLight: '#FFF066',
  goldDim: '#8a620d',
  pink: '#FF007F',       // Vibrant neon pink matching official site
  pinkDim: 'rgba(255,0,127,0.4)',
  teal: '#3F9C8C',
  cream: '#F3E9D2',
  creamDim: 'rgba(243,233,210,0.6)',
  green: '#2d6a4f',
  greenLight: '#40916c',
  dark: '#0a1f14',
  white: '#ffffff',
  black: '#000000',
};

async function generateQRDataURL(url: string): Promise<HTMLImageElement | null> {
  const targetUrl = (url && url.trim().length > 0) 
    ? (url.startsWith('http') ? url : `https://github.com/${url.replace(/^@/, '')}`)
    : 'https://github.com/sardevishal';

  try {
    const dataUrl = await QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 1,
      color: { dark: C.black, light: C.white },
      errorCorrectionLevel: 'H',
    });
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  } catch {
    return null;
  }
}

function font(size: number, weight: string, family: string): string {
  return `${weight} ${size}px ${family}`;
}

async function waitForFonts() {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('78px "Bodoni Moda"'),
        document.fonts.load('72px "Rozha One"'),
        document.fonts.load('72px "Alfa Slab One"'),
        document.fonts.load('16px "Space Mono"'),
        document.fonts.ready,
      ]);
    } catch { /* ignore */ }
  }
}

export async function renderBuilderCard(
  profileImg: HTMLImageElement | null,
  profile: ProfileData,
  crop: CropSettings
): Promise<HTMLCanvasElement> {
  await waitForFonts();
  const W = 1080;
  const H = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Radial Sunburst
  ctx.save();
  ctx.translate(W / 2, H / 2 - 200);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(63, 156, 140, 0.15)';
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(i * Math.PI / 30) * W, Math.sin(i * Math.PI / 30) * W);
    ctx.stroke();
  }
  ctx.restore();

  // ASCII Palm Trees
  drawAsciiPalms(ctx, W);
  
  // Grain
  drawGrain(ctx, W, H, 0.015);

  // ── Top Header Hook and Pill ───────────────────────────────────────────────
  // Outer frame border
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 4;
  roundedRect(ctx, 24, 24, W - 48, H - 48, 24);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255,225,0,0.3)';
  ctx.lineWidth = 1;
  roundedRect(ctx, 32, 32, W - 64, H - 64, 18);
  ctx.stroke();

  // Top Hook
  ctx.fillStyle = C.bgDeep;
  ctx.beginPath();
  ctx.arc(W / 2, 40, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.black;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(W / 2, 40, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Top Pill — Enlarged, bold & prominent
  const pillY = 55;
  const pillH = 48;
  ctx.fillStyle = C.bgDeep;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2.5;
  roundedRect(ctx, 50, pillY, W - 100, pillH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = C.gold;
  ctx.font = font(20, '700', 'Space Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('🌴  HACKER HOUSE GOA 2026  •  BUILDER RESIDENCY PASS  🌴', W / 2, pillY + 31);

  // ── Profile Image ──────────────────────────────────────────────────────────
  const imgSize = 360;
  const imgX = (W - imgSize) / 2;
  const imgY = 118;
  const imgR = 20;

  // Pink targeting brackets
  const bracketLen = 40;
  ctx.strokeStyle = C.pink;
  ctx.lineWidth = 4;
  
  // TL
  ctx.beginPath(); ctx.moveTo(imgX - 12 + bracketLen, imgY - 12); ctx.lineTo(imgX - 12, imgY - 12); ctx.lineTo(imgX - 12, imgY - 12 + bracketLen); ctx.stroke();
  // TR
  ctx.beginPath(); ctx.moveTo(imgX + imgSize + 12 - bracketLen, imgY - 12); ctx.lineTo(imgX + imgSize + 12, imgY - 12); ctx.lineTo(imgX + imgSize + 12, imgY - 12 + bracketLen); ctx.stroke();
  // BL
  ctx.beginPath(); ctx.moveTo(imgX - 12 + bracketLen, imgY + imgSize + 12); ctx.lineTo(imgX - 12, imgY + imgSize + 12); ctx.lineTo(imgX - 12, imgY + imgSize + 12 - bracketLen); ctx.stroke();
  // BR
  ctx.beginPath(); ctx.moveTo(imgX + imgSize + 12 - bracketLen, imgY + imgSize + 12); ctx.lineTo(imgX + imgSize + 12, imgY + imgSize + 12); ctx.lineTo(imgX + imgSize + 12, imgY + imgSize + 12 - bracketLen); ctx.stroke();

  // Yellow thin border behind image
  ctx.strokeStyle = C.goldLight;
  ctx.lineWidth = 4;
  roundedRect(ctx, imgX - 2, imgY - 2, imgSize + 4, imgSize + 4, imgR + 2);
  ctx.stroke();

  if (profileImg) {
    drawCroppedImage(ctx, profileImg, crop, imgX, imgY, imgSize, imgSize, imgR);
  } else {
    ctx.fillStyle = C.bgPanel;
    roundedRect(ctx, imgX, imgY, imgSize, imgSize, imgR);
    ctx.fill();
    
    // Placeholder icon inside image area
    ctx.fillStyle = 'rgba(255,225,0,0.3)';
    ctx.font = font(72, '400', 'sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText('📷', W / 2, imgY + imgSize / 2 + 24);
  }

  // Age Badge — positioned inside corner of image
  if (profile.age && profile.age.trim()) {
    const ageR = 36;
    const ageCX = imgX + imgSize - 20;
    const ageCY = imgY + imgSize - 20;

    ctx.fillStyle = C.pink;
    ctx.beginPath();
    ctx.arc(ageCX, ageCY, ageR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C.white;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = C.white;
    ctx.font = font(26, '900', 'Alfa Slab One, sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText(profile.age.trim(), ageCX, ageCY + 6);
    
    ctx.font = font(10, '700', 'Space Mono, monospace');
    ctx.fillText('YRS OLD', ageCX, ageCY + 19);
  }

  // ── Typography Section ─────────────────────────────────────────────────
  // Generous gap below photo frame (bottom of photo is 118+360=478, currentY=565 -> 87px gap)
  let currentY = 565;

  // BUILDER NAME — Controlled size (52px max), positioned down with wide top gap
  const nameStr = (profile.name && profile.name.trim()) ? profile.name.trim().toUpperCase() : 'YOUR NAME';
  const maxNameW = W - 100;
  let nameFontSize = 52;
  ctx.font = font(nameFontSize, '400', 'Alfa Slab One, sans-serif');
  while (ctx.measureText(nameStr).width > maxNameW && nameFontSize > 28) {
    nameFontSize -= 2;
    ctx.font = font(nameFontSize, '400', 'Alfa Slab One, sans-serif');
  }
  ctx.fillStyle = C.gold;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.fillText(nameStr, W / 2, currentY);
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  currentY += Math.round(nameFontSize * 0.72) + 12;

  // ROLE PILL — Larger & clearer (21px font)
  const roleStr = (profile.role && profile.role.trim()) ? profile.role.trim().toUpperCase() : 'FULL STACK BUILDER';
  ctx.font = font(21, '700', 'Space Mono, monospace');
  const roleW = Math.min(ctx.measureText(`⚙  ${roleStr}`).width + 54, W - 100);
  const roleX = W / 2 - roleW / 2;
  
  ctx.fillStyle = C.bgDeep;
  ctx.strokeStyle = C.greenLight;
  ctx.lineWidth = 2.5;
  roundedRect(ctx, roleX, currentY, roleW, 48, 10);
  ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = C.cream;
  ctx.textAlign = 'center';
  ctx.fillText(truncateText(ctx, `⚙  ${roleStr}`, roleW - 24), W / 2, currentY + 31);
  currentY += 64;

  // BUILDER TITLE — Larger & bold (28px font)
  const titleStr = (profile.builderTitle && profile.builderTitle.trim()) ? profile.builderTitle.trim() : 'Jungle Refactoring Pioneer';
  ctx.fillStyle = C.pink;
  ctx.font = `italic ${font(28, '700', 'Space Grotesk, sans-serif')}`;
  ctx.textAlign = 'center';
  ctx.fillText(truncateText(ctx, `⚡  ${titleStr}  ⚡`, W - 100), W / 2, currentY + 22);
  currentY += 52;

  // CURRENTLY SHIPPING PANEL — Enlarged headline & text
  const shippingPad = 60;
  const shippingW = W - shippingPad * 2;
  ctx.fillStyle = C.bgDeep;
  ctx.strokeStyle = C.pink;
  ctx.lineWidth = 2.5;
  roundedRect(ctx, shippingPad, currentY, shippingW, 86, 14);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = C.pink;
  ctx.font = font(16, '700', 'Space Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('🚀 CURRENTLY SHIPPING AT HH GOA', W / 2, currentY + 26);

  ctx.fillStyle = C.white;
  ctx.font = font(26, '700', 'Space Mono, monospace');
  const shippingText = (profile.currentlyShipping && profile.currentlyShipping.trim()) ? profile.currentlyShipping.trim() : 'Building something epic...';
  ctx.fillText(truncateText(ctx, shippingText, shippingW - 40), W / 2, currentY + 62);
  currentY += 104;

  // EVENT PILLS — Larger text (17px font) & taller pills (40px)
  const pills = [
    '🏝️ BEACH & CODE',
    '🗓️ OCT 28-31, 2026',
    '🌊 GOA RESIDENCY',
  ];
  ctx.font = font(17, '700', 'Space Mono, monospace');
  const pillWidths = pills.map(p => ctx.measureText(p).width + 36);
  const totalPillW = pillWidths.reduce((a, b) => a + b, 0) + 24; // 12px gap each
  
  let pillX = (W - totalPillW) / 2;
  for (let i = 0; i < pills.length; i++) {
    ctx.fillStyle = C.bgDeep;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    roundedRect(ctx, pillX, currentY, pillWidths[i], 40, 20);
    ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = C.cream;
    ctx.textAlign = 'center';
    ctx.fillText(pills[i], pillX + pillWidths[i] / 2, currentY + 26);
    pillX += pillWidths[i] + 12;
  }

  // ── Separator Line ────────────────────────────────────────────────────────
  const lineY = currentY + 48;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(140, lineY); ctx.lineTo(W - 140, lineY); ctx.stroke();
  ctx.fillStyle = C.gold;
  drawDiamond(ctx, 140, lineY, 5);
  drawDiamond(ctx, W - 140, lineY, 5);

  // ── Bottom Angular Mountains (Rendered BELOW the separator line) ─────────
  drawMountains(ctx, W, H, lineY + 10);

  // ── Bottom Official Branding Area (Matches Official Website Logo) ──────────
  const bottomY = H - 135;

  // Verified Badge (Left)
  const badgeX = 140;
  const badgeY = bottomY + 20;
  drawVerifiedBadge(ctx, badgeX, badgeY);

  // Hacker House Text (Center - Alfa Slab One) — Large & Bold
  ctx.fillStyle = C.gold;
  ctx.font = font(68, '400', 'Alfa Slab One, sans-serif');
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowOffsetY = 5;
  ctx.shadowBlur = 10;
  ctx.fillText('HACKER HOUSE', W / 2, bottomY - 10);
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Small Hindi "गोवा" Text below "HACKER HOUSE"
  ctx.fillStyle = C.pink;
  ctx.font = font(30, '700', 'Rozha One, Yatra One, Devanagari, serif');
  ctx.fillText('गोवा', W / 2, bottomY + 22);

  // Sub-bar Text
  ctx.fillStyle = C.gold;
  ctx.font = font(17, '700', 'Space Mono, monospace');
  ctx.fillText('GOA, INDIA   •   28 - 31 OCT 2026', W / 2, bottomY + 52);

  ctx.fillStyle = C.pink;
  ctx.font = font(16, '700', 'Space Mono, monospace');
  ctx.fillText('#FrameInGoa', W / 2, bottomY + 76);

  // QR Code Panel (Right - High contrast scanner ready)
  const qrX = W - 230;
  const qrY = bottomY - 60;
  const qrW = 150;
  const qrH = 180;
  
  ctx.fillStyle = C.white;
  roundedRect(ctx, qrX, qrY, qrW, qrH, 12);
  ctx.fill();

  const handle = profile.githubUsername ? profile.githubUsername.trim() : 'sardevishal';
  const qrImg = await generateQRDataURL(handle);
  if (qrImg) {
    ctx.drawImage(qrImg, qrX + 10, qrY + 10, 130, 130);
  }

  ctx.fillStyle = C.black;
  ctx.font = font(10, '700', 'Space Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('SCAN GITHUB', qrX + qrW / 2, qrY + 152);
  ctx.fillStyle = '#333333';
  ctx.font = font(10, '700', 'Space Mono, monospace');
  ctx.fillText(`@${handle.replace(/^@/, '')}`, qrX + qrW / 2, qrY + 168);

  return canvas;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PFP FRAME  1080 × 1080
// ══════════════════════════════════════════════════════════════════════════════
export async function renderPFPFrame(
  profileImg: HTMLImageElement | null,
  _profile: ProfileData,
  crop: CropSettings
): Promise<HTMLCanvasElement> {
  await waitForFonts();
  const W = 1080;
  const H = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(63, 156, 140, 0.15)';
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(i * Math.PI / 30) * W, Math.sin(i * Math.PI / 30) * W);
    ctx.stroke();
  }
  ctx.restore();

  drawGrain(ctx, W, H, 0.015);

  const circleR = 345;
  const circleCX = W / 2;
  const circleCY = H / 2 - 20;

  // Targeting Brackets inside PFP
  ctx.strokeStyle = C.pink;
  ctx.lineWidth = 6;
  const br = circleR + 20;
  const bL = 60;
  // TL
  ctx.beginPath(); ctx.moveTo(circleCX - br + bL, circleCY - br); ctx.lineTo(circleCX - br, circleCY - br); ctx.lineTo(circleCX - br, circleCY - br + bL); ctx.stroke();
  // TR
  ctx.beginPath(); ctx.moveTo(circleCX + br - bL, circleCY - br); ctx.lineTo(circleCX + br, circleCY - br); ctx.lineTo(circleCX + br, circleCY - br + bL); ctx.stroke();
  // BL
  ctx.beginPath(); ctx.moveTo(circleCX - br + bL, circleCY + br); ctx.lineTo(circleCX - br, circleCY + br); ctx.lineTo(circleCX - br, circleCY + br - bL); ctx.stroke();
  // BR
  ctx.beginPath(); ctx.moveTo(circleCX + br - bL, circleCY + br); ctx.lineTo(circleCX + br, circleCY + br); ctx.lineTo(circleCX + br, circleCY + br - bL); ctx.stroke();

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR + 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR, 0, Math.PI * 2);
  ctx.clip();
  if (profileImg) {
    const d = circleR * 2;
    const dx = circleCX - circleR;
    const dy = circleCY - circleR;
    drawCroppedImage(ctx, profileImg, crop, dx, dy, d, d, 0);
  } else {
    ctx.fillStyle = C.bgDeep;
    ctx.fill();
  }
  ctx.restore();

  // Top Hook Pill — Very large, bold & high visibility (#FrameInGoa)
  const pillY = 32;
  const pillW = 400;
  const pillH = 56;
  ctx.fillStyle = C.bgDeep;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 2.5;
  roundedRect(ctx, W / 2 - pillW / 2, pillY, pillW, pillH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = C.gold;
  ctx.font = font(26, '700', 'Space Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('🌴 #FrameInGoa 🌴', W / 2, pillY + 37);

  // Bottom Official Logo Branding — Positioned lower down, large & bold
  const hhY = H - 90;
  ctx.fillStyle = C.gold;
  ctx.font = font(72, '400', 'Alfa Slab One, sans-serif');
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowOffsetY = 6;
  ctx.shadowBlur = 8;
  ctx.fillText('HACKER HOUSE', W / 2, hhY - 15);
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Small Hindi "गोवा" Overlay below HACKER HOUSE
  ctx.font = font(30, '700', 'Rozha One, Yatra One, Devanagari, serif');
  ctx.fillStyle = C.pink;
  ctx.fillText('गोवा', W / 2, hhY + 20);

  ctx.fillStyle = C.cream;
  ctx.font = font(22, '700', 'Space Mono, monospace');
  ctx.fillText('28–31 OCT 2026 • GOA, INDIA', W / 2, hhY + 52);

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 4;
  roundedRect(ctx, 24, 24, W - 48, H - 48, 24);
  ctx.stroke();

  return canvas;
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function drawMountains(ctx: CanvasRenderingContext2D, W: number, H: number, startY: number) {
  // Back mountain (darkest)
  ctx.fillStyle = '#102818';
  ctx.beginPath();
  ctx.moveTo(0, startY + 50);
  ctx.lineTo(250, startY - 10);
  ctx.lineTo(550, startY + 40);
  ctx.lineTo(850, startY - 20);
  ctx.lineTo(W, startY + 30);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();

  // Mid mountain
  ctx.fillStyle = '#173c2e';
  ctx.beginPath();
  ctx.moveTo(0, startY + 90);
  ctx.lineTo(350, startY + 30);
  ctx.lineTo(650, startY + 80);
  ctx.lineTo(950, startY + 20);
  ctx.lineTo(W, startY + 70);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();

  // Front mountain
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.moveTo(0, startY + 160);
  ctx.lineTo(150, startY + 110);
  ctx.lineTo(450, startY + 180);
  ctx.lineTo(800, startY + 90);
  ctx.lineTo(W, startY + 150);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
}

function drawAsciiPalms(ctx: CanvasRenderingContext2D, W: number) {
  ctx.fillStyle = 'rgba(63, 156, 140, 0.12)';
  ctx.font = font(12, '700', 'Space Mono, monospace');
  ctx.textAlign = 'left';
  
  const tree = [
    "      HHHHHH      ",
    "   HHHHHHHHHHHH   ",
    "  HHHHH    HHHHH  ",
    " HHH          HHH ",
    " HH            HH ",
    "        HH        ",
    "        HH        ",
    "        HH        ",
    "        HH        ",
    "        HH        ",
    "        HH        ",
    "        HH        "
  ];

  // Draw left tree
  tree.forEach((line, i) => {
    ctx.fillText(line, 40, 280 + i * 16);
    ctx.fillText(line, 60, 560 + i * 16);
  });

  // Draw right tree
  tree.forEach((line, i) => {
    ctx.fillText(line, W - 220, 240 + i * 16);
    ctx.fillText(line, W - 240, 640 + i * 16);
  });
}

function drawVerifiedBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 54;
  ctx.fillStyle = C.bgDeep;
  ctx.strokeStyle = C.goldDim;
  ctx.lineWidth = 2;
  
  // Scalloped edge
  ctx.beginPath();
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI * 2) / 36;
    const rad = i % 2 === 0 ? r : r - 6;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
    else ctx.lineTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner circle
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
  ctx.stroke();

  // Text / Icon inside
  ctx.fillStyle = C.pink;
  ctx.font = font(22, '400', 'sans-serif');
  ctx.textAlign = 'center';
  ctx.fillText('🌴', cx, cy - 2);

  ctx.fillStyle = C.gold;
  ctx.font = font(10, '700', 'Space Mono, monospace');
  ctx.fillText('VERIFIED', cx, cy + 15);
}

function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
}

function splitTextIntoLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export { splitTextIntoLines };
