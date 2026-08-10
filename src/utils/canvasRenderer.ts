import QRCode from 'qrcode';
import type { ProfileData, CropSettings } from '../types';
import {
  drawCroppedImage,
  roundedRect,
  drawGrain,
  drawDotGrid,
  truncateText,
  wrapText,
} from './cropUtils';

// ── Exact reference color palette ──────────────────────────────────────────
const C = {
  bg: '#0a0c0e',           // dark forest green
  bgDeep: '#08090b',       // deeper green for card interior
  bgPanel: '#12161a',      // slightly lighter panel
  bgShipping: '#12161a',   // shipping panel bg
  mustard: '#c8ff3d',      // warm mustard/gold — primary accent
  mustardLight: '#e4ff8a', // lighter gold for name
  mustardDim: '#7da31c',   // dim gold for borders
  cream: '#f5f5f0',        // warm cream text
  creamDim: 'rgba(245,245,240,0.6)',
  pink: '#ff7043',         // hot pink — builder title
  pinkDim: 'rgba(255,112,67,0.4)',
  teal: '#a9adb4',         // teal — role badge
  tealDim: 'rgba(169,173,180,0.25)',
  green: '#3a4148',        // forest green for wave/nature
  greenLight: '#525b64',
  dark: '#0a0c0e',
  white: '#ffffff',
  black: '#000000',
};

async function generateQRDataURL(url: string): Promise<HTMLImageElement | null> {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 160,
      margin: 1,
      color: { dark: C.black, light: C.white },
      errorCorrectionLevel: 'M',
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
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  BUILDER ID CARD  1080 × 1350
// ══════════════════════════════════════════════════════════════════════════════
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

  // Subtle dot grid watermark
  drawDotGrid(ctx, W, H, 28, 'rgba(243,233,210,0.04)');
  drawGrain(ctx, W, H, 0.02);

  // Subtle radial vignette (top warm glow)
  const topGlow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 600);
  topGlow.addColorStop(0, 'rgba(227,167,48,0.06)');
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Top header bar ─────────────────────────────────────────────────────────
  const headerH = 72;
  ctx.fillStyle = 'rgba(10,31,20,0.6)';
  ctx.fillRect(0, 0, W, headerH);

  // Top gold line
  ctx.fillStyle = C.mustard;
  ctx.fillRect(0, 0, W, 2);

  // Header text
  ctx.fillStyle = C.creamDim;
  ctx.font = font(11, '500', 'IBM Plex Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('✦  HACKER HOUSE GOA 2026  ·  BUILDER RESIDENCY PASS  ✦', W / 2, 36);

  // Decorative tick marks on header
  ctx.strokeStyle = C.mustardDim;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 60);
    ctx.lineTo(x, 68);
    ctx.stroke();
  }
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 72);
  ctx.lineTo(W, 72);
  ctx.stroke();

  // ── Profile image (large, top center, rectangular with gold border) ────────
  const imgPad = 52;
  const imgX = imgPad;
  const imgY = 96;
  const imgW = W - imgPad * 2;
  const imgH = 520;
  const imgR = 18;

  // Image glow
  ctx.shadowColor = C.mustard;
  ctx.shadowBlur = 24;
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 3;
  roundedRect(ctx, imgX - 1.5, imgY - 1.5, imgW + 3, imgH + 3, imgR + 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (profileImg) {
    drawCroppedImage(ctx, profileImg, crop, imgX, imgY, imgW, imgH, imgR);
  } else {
    ctx.fillStyle = C.bgDeep;
    roundedRect(ctx, imgX, imgY, imgW, imgH, imgR);
    ctx.fill();
    ctx.fillStyle = C.mustardDim;
    ctx.font = font(20, '500', 'IBM Plex Mono, monospace');
    ctx.textAlign = 'center';
    ctx.fillText('Upload your photo', W / 2, imgY + imgH / 2);
  }

  // Corner decorators on image border
  drawCornerTick(ctx, imgX, imgY, 20, C.mustard);
  drawCornerTick(ctx, imgX + imgW, imgY, 20, C.mustard, 'tr');
  drawCornerTick(ctx, imgX, imgY + imgH, 20, C.mustard, 'bl');
  drawCornerTick(ctx, imgX + imgW, imgY + imgH, 20, C.mustard, 'br');

  // ── Age badge on bottom-right of image ─────────────────────────────────────
  if (profile.age) {
    const ageR = 38;
    const ageCX = imgX + imgW - ageR - 12;
    const ageCY = imgY + imgH - ageR - 12;

    ctx.fillStyle = C.pink;
    ctx.beginPath();
    ctx.arc(ageCX, ageCY, ageR, 0, Math.PI * 2);
    ctx.fill();

    // Thin gold ring
    ctx.strokeStyle = C.mustard;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ageCX, ageCY, ageR + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = C.white;
    ctx.font = font(22, '900', 'IBM Plex Sans, sans-serif');
    ctx.textAlign = 'center';
    ctx.fillText(profile.age, ageCX, ageCY + 4);

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = font(8, '600', 'IBM Plex Mono, monospace');
    ctx.fillText('YRS', ageCX, ageCY + 18);
  }

  // ── NAME ───────────────────────────────────────────────────────────────────
  const nameY = imgY + imgH + 62;
  const nameStr = (profile.name || 'YOUR NAME').toUpperCase();

  ctx.textAlign = 'center';
  let nameSz = 86;
  ctx.font = font(nameSz, '800', 'Barlow Condensed, sans-serif');
  while (ctx.measureText(nameStr).width > W - 80 && nameSz > 36) {
    nameSz -= 2;
    ctx.font = font(nameSz, '800', 'Barlow Condensed, sans-serif');
  }
  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = C.mustard;
  ctx.fillText(nameStr, W / 2, nameY);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ── Role pill ──────────────────────────────────────────────────────────────
  const roleY = nameY + 28;
  if (profile.role) {
    const roleStr = profile.role.toUpperCase();
    ctx.font = font(15, '700', 'IBM Plex Mono, monospace');
    const roleW = Math.min(ctx.measureText(roleStr).width + 40, W - 100);
    const roleX = W / 2 - roleW / 2;
    const rolePillH = 36;

    ctx.fillStyle = C.teal;
    roundedRect(ctx, roleX, roleY, roleW, rolePillH, rolePillH / 2);
    ctx.fill();

    ctx.fillStyle = C.white;
    ctx.textAlign = 'center';
    ctx.fillText(truncateText(ctx, roleStr, roleW - 40), W / 2, roleY + 24);
  }

  // ── Builder title (pink italic style) ─────────────────────────────────────
  const titleY = roleY + 56;
  if (profile.builderTitle) {
    ctx.fillStyle = C.pink;
    ctx.font = font(22, '600', 'IBM Plex Sans, sans-serif');
    ctx.textAlign = 'center';
    ctx.fillStyle = C.pink;
    // Star decorators
    const titleText = `✦ ${profile.builderTitle} ✦`;
    ctx.fillText(truncateText(ctx, titleText, W - 80), W / 2, titleY);
  }

  // ── Currently shipping panel ───────────────────────────────────────────────
  const shippingY = titleY + 36;
  const shippingH = 88;
  const shippingPad = 52;

  // Panel background
  ctx.fillStyle = C.bgDeep;
  roundedRect(ctx, shippingPad, shippingY, W - shippingPad * 2, shippingH, 12);
  ctx.fill();

  // Left gold bar
  ctx.fillStyle = C.mustard;
  roundedRect(ctx, shippingPad, shippingY, 4, shippingH, 2);
  ctx.fill();

  // Label
  ctx.fillStyle = C.mustard;
  ctx.font = font(10, '700', 'IBM Plex Mono, monospace');
  ctx.textAlign = 'left';
  ctx.fillText('🚀 CURRENTLY SHIPPING', shippingPad + 20, shippingY + 22);

  // Content
  ctx.fillStyle = C.cream;
  ctx.font = font(20, '600', 'IBM Plex Sans, sans-serif');
  const shippingText = profile.currentlyShipping || 'Something incredible…';
  wrapText(ctx, shippingText, shippingPad + 20, shippingY + 52, W - shippingPad * 2 - 40, 26, 2);

  // ── Event info pills ───────────────────────────────────────────────────────
  const pillsY = shippingY + shippingH + 28;
  const pills = [
    '🏖️  BEACH & CODE',
    '📅  OCT 28–31, 2026',
    '🌊  GOA RESIDENCY',
  ];

  ctx.font = font(13, '600', 'IBM Plex Mono, monospace');
  let totalPillW = 0;
  const pillWidths: number[] = [];
  const pillPad = 28;
  const pillH = 38;
  const pillGap = 12;

  for (const p of pills) {
    const pw = ctx.measureText(p).width + pillPad * 2;
    pillWidths.push(pw);
    totalPillW += pw + pillGap;
  }
  totalPillW -= pillGap;

  let pillX = (W - totalPillW) / 2;
  for (let i = 0; i < pills.length; i++) {
    const pw = pillWidths[i];
    ctx.fillStyle = C.bgDeep;
    ctx.strokeStyle = C.mustardDim;
    ctx.lineWidth = 1.5;
    roundedRect(ctx, pillX, pillsY, pw, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.cream;
    ctx.textAlign = 'center';
    ctx.fillText(pills[i], pillX + pw / 2, pillsY + 25);
    pillX += pw + pillGap;
  }

  // ── Tropical wave / landscape bottom section ───────────────────────────────
  const waveStartY = pillsY + pillH + 28;
  drawTropicalScene(ctx, W, H, waveStartY);

  // ── Bottom branding (on top of waves) ─────────────────────────────────────
  const bottomY = H - 210;

  // HH circle emblem left
  const emblemCX = 120;
  const emblemCY = bottomY + 70;
  const emblemR = 52;

  ctx.fillStyle = C.bg;
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(emblemCX, emblemCY, emblemR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = C.mustard;
  ctx.font = font(26, '900', 'Barlow Condensed, sans-serif');
  ctx.textAlign = 'center';
  ctx.fillText('HH', emblemCX, emblemCY - 4);

  ctx.fillStyle = C.creamDim;
  ctx.font = font(9, '600', 'IBM Plex Mono, monospace');
  ctx.fillText('2026', emblemCX, emblemCY + 16);

  // HACKER HOUSE large text
  ctx.fillStyle = C.mustard;
  ctx.font = font(54, '800', 'Barlow Condensed, sans-serif');
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText('HACKER HOUSE', emblemCX + emblemR + 20, bottomY + 54);
  ctx.shadowBlur = 0;

  ctx.fillStyle = C.creamDim;
  ctx.font = font(12, '500', 'IBM Plex Mono, monospace');
  ctx.fillText(`28–31 OCTOBER 2026  ·  GOA, INDIA`, emblemCX + emblemR + 20, bottomY + 82);

  ctx.fillStyle = C.pink;
  ctx.font = font(13, '700', 'IBM Plex Mono, monospace');
  ctx.fillText('#FrameInGoa', emblemCX + emblemR + 20, bottomY + 108);

  // ── QR Code ────────────────────────────────────────────────────────────────
  const qrSize = 120;
  const qrX = W - qrSize - 52;
  const qrY = bottomY + 14;

  if (profile.githubUsername) {
    const qrImg = await generateQRDataURL(`https://github.com/${profile.githubUsername}`);
    if (qrImg) {
      ctx.fillStyle = C.white;
      roundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 28, 10);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      ctx.fillStyle = C.dark;
      ctx.font = font(10, '700', 'IBM Plex Mono, monospace');
      ctx.textAlign = 'center';
      ctx.fillText(`@${profile.githubUsername}`, qrX + qrSize / 2, qrY + qrSize + 16);
    }
  } else {
    ctx.fillStyle = C.bgDeep;
    ctx.strokeStyle = C.mustardDim;
    ctx.lineWidth = 1;
    roundedRect(ctx, qrX, qrY, qrSize, qrSize, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.mustardDim;
    ctx.font = font(10, '400', 'IBM Plex Mono, monospace');
    ctx.textAlign = 'center';
    ctx.fillText('GitHub QR', qrX + qrSize / 2, qrY + qrSize / 2 + 4);
  }

  // ── Outer frame border ─────────────────────────────────────────────────────
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // Inner accent border
  ctx.strokeStyle = 'rgba(227,167,48,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  return canvas;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PFP FRAME  1080 × 1080
// ══════════════════════════════════════════════════════════════════════════════
export async function renderPFPFrame(
  profileImg: HTMLImageElement | null,
  profile: ProfileData,
  crop: CropSettings
): Promise<HTMLCanvasElement> {
  await waitForFonts();
  const W = 1080;
  const H = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  drawDotGrid(ctx, W, H, 28, 'rgba(243,233,210,0.035)');
  drawGrain(ctx, W, H, 0.018);

  // ── Bottom tropical scene (behind everything) ──────────────────────────────
  drawPFPTropicalScene(ctx, W, H);

  // ── Circular profile image ─────────────────────────────────────────────────
  const circleR = 320;
  const circleCX = W / 2;
  const circleCY = H / 2 - 50;

  // Outer ring decorations
  ctx.strokeStyle = 'rgba(227,167,48,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR + 40, 0, Math.PI * 2);
  ctx.stroke();

  // Gold ring
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR + 10, 0, Math.PI * 2);
  ctx.stroke();

  // Pink accent ring
  ctx.strokeStyle = C.pink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(circleCX, circleCY, circleR + 18, 0, Math.PI * 2);
  ctx.stroke();

  // Clip and draw profile image in circle
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
    ctx.fillStyle = C.mustardDim;
    ctx.font = font(22, '500', 'IBM Plex Mono, monospace');
    ctx.textAlign = 'center';
    ctx.fillText('Upload photo', circleCX, circleCY + 8);
  }
  ctx.restore();

  // ── Top: #FrameInGoa badge ─────────────────────────────────────────────────
  // Small tag line at top
  ctx.fillStyle = 'rgba(10,31,20,0.8)';
  roundedRect(ctx, W / 2 - 130, 38, 260, 38, 19);
  ctx.fill();
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 1.5;
  roundedRect(ctx, W / 2 - 130, 38, 260, 38, 19);
  ctx.stroke();

  // Small HH icons
  ctx.font = font(14, '600', 'IBM Plex Mono, monospace');
  ctx.fillStyle = C.mustard;
  ctx.textAlign = 'center';
  ctx.fillText('✦  #FrameInGoa  ✦', W / 2, 62);

  // ── Bottom: HACKER HOUSE large text ───────────────────────────────────────
  const hhY = H - 175;
  ctx.fillStyle = C.mustard;
  ctx.font = font(72, '900', 'Barlow Condensed, sans-serif');
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillText('HACKER HOUSE', W / 2, hhY);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Name (if provided)
  if (profile.name) {
    ctx.fillStyle = C.cream;
    ctx.font = font(30, '700', 'IBM Plex Sans, sans-serif');
    ctx.textAlign = 'center';
    const nameStr = profile.name.toUpperCase();
    while (ctx.measureText(nameStr).width > W - 120) {
      // handled via truncation below
    }
    ctx.fillText(truncateText(ctx, nameStr, W - 120), W / 2, hhY + 44);
  }

  // Event info bottom strip
  ctx.fillStyle = 'rgba(10,31,20,0.75)';
  ctx.fillRect(0, H - 80, W, 80);

  ctx.fillStyle = C.mustard;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = C.mustard;
  ctx.beginPath();
  ctx.moveTo(0, H - 80);
  ctx.lineTo(W, H - 80);
  ctx.stroke();

  ctx.fillStyle = C.cream;
  ctx.font = font(15, '600', 'IBM Plex Mono, monospace');
  ctx.textAlign = 'center';
  ctx.fillText('28–31 OCTOBER 2026  ·  GOA, INDIA', W / 2, H - 44);

  ctx.fillStyle = C.pink;
  ctx.font = font(13, '600', 'IBM Plex Mono, monospace');
  ctx.fillText('#HHGoa2026  ·  #FrameInGoa', W / 2, H - 22);

  // ── Outer border ──────────────────────────────────────────────────────────
  ctx.strokeStyle = C.mustard;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  ctx.strokeStyle = 'rgba(227,167,48,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  return canvas;
}

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Draws the tropical wave + palm tree scene at the bottom of the Builder Card.
 */
function drawTropicalScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  startY: number
) {
  // Layered waves
  // Wave 1 — darkest back layer
  ctx.fillStyle = '#07080a';
  ctx.beginPath();
  ctx.moveTo(0, startY + 40);
  for (let x = 0; x <= W; x += 80) {
    const yOff = Math.sin((x / W) * Math.PI * 2.2) * 22;
    ctx.quadraticCurveTo(x + 40, startY + 40 + yOff - 22, x + 80, startY + 40 + yOff);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Wave 2 — mid layer
  ctx.fillStyle = '#0a0c0e';
  ctx.beginPath();
  ctx.moveTo(0, startY + 80);
  for (let x = 0; x <= W; x += 80) {
    const yOff = Math.sin((x / W) * Math.PI * 2.8 + 0.8) * 16;
    ctx.quadraticCurveTo(x + 40, startY + 80 + yOff - 16, x + 80, startY + 80 + yOff);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Wave 3 — front lighter layer
  ctx.fillStyle = '#12161a';
  ctx.beginPath();
  ctx.moveTo(0, startY + 120);
  for (let x = 0; x <= W; x += 80) {
    const yOff = Math.sin((x / W) * Math.PI * 3.2 + 1.4) * 12;
    ctx.quadraticCurveTo(x + 40, startY + 120 + yOff - 12, x + 80, startY + 120 + yOff);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Palm trees (silhouette style)
  drawPalmTree(ctx, 80, startY + 20, 140, 'rgba(18,22,26,0.85)');
  drawPalmTree(ctx, W - 100, startY + 30, 130, 'rgba(18,22,26,0.85)', true);
  drawPalmTree(ctx, 200, startY + 60, 90, 'rgba(18,22,26,0.6)');
  drawPalmTree(ctx, W - 220, startY + 70, 85, 'rgba(18,22,26,0.6)', true);

  // Horizontal separator line at wave top
  ctx.strokeStyle = C.mustardDim;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 12]);
  ctx.beginPath();
  ctx.moveTo(52, startY + 8);
  ctx.lineTo(W - 52, startY + 8);
  ctx.stroke();
  ctx.setLineDash([]);

  // Small diamond on separator
  ctx.fillStyle = C.mustard;
  drawDiamond(ctx, W / 2, startY + 8, 6);
}

/**
 * Tropical scene for PFP frame background.
 */
function drawPFPTropicalScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number
) {
  const waveStart = H * 0.62;

  // Background wave layers
  ctx.fillStyle = '#07080a';
  ctx.beginPath();
  ctx.moveTo(0, waveStart);
  for (let x = 0; x <= W; x += 100) {
    ctx.quadraticCurveTo(x + 50, waveStart - 30 * Math.sin((x / W) * Math.PI * 2), x + 100, waveStart);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0a0c0e';
  ctx.beginPath();
  ctx.moveTo(0, waveStart + 50);
  for (let x = 0; x <= W; x += 100) {
    ctx.quadraticCurveTo(x + 50, waveStart + 50 - 20 * Math.sin((x / W) * Math.PI * 3 + 1), x + 100, waveStart + 50);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // Palm trees — left and right silhouettes
  drawPalmTree(ctx, 60, waveStart - 60, 180, 'rgba(18,22,26,0.9)');
  drawPalmTree(ctx, W - 80, waveStart - 50, 170, 'rgba(18,22,26,0.9)', true);
  drawPalmTree(ctx, 170, waveStart + 10, 120, 'rgba(18,22,26,0.7)');
  drawPalmTree(ctx, W - 190, waveStart + 20, 110, 'rgba(18,22,26,0.7)', true);
}

/**
 * Draws a stylized palm tree silhouette.
 */
function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  groundY: number,
  height: number,
  color: string,
  flip = false
) {
  const dir = flip ? -1 : 1;

  // Trunk — slightly curved
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(baseX - 6, groundY);
  ctx.quadraticCurveTo(baseX + dir * 15, groundY - height * 0.5, baseX + dir * 8, groundY - height);
  ctx.quadraticCurveTo(baseX + dir * 12, groundY - height + 4, baseX + dir * 18, groundY - height);
  ctx.quadraticCurveTo(baseX + dir * 20, groundY - height * 0.5, baseX + 6, groundY);
  ctx.closePath();
  ctx.fill();

  // Fronds
  const tipX = baseX + dir * 12;
  const tipY = groundY - height;

  const fronds = [
    { angle: flip ? 200 : -20, length: height * 0.5 },
    { angle: flip ? 170 : 10,  length: height * 0.42 },
    { angle: flip ? 140 : 40,  length: height * 0.38 },
    { angle: flip ? 230 : -50, length: height * 0.40 },
    { angle: flip ? 110 : 70,  length: height * 0.30 },
    { angle: flip ? 260 : -80, length: height * 0.28 },
  ];

  for (const f of fronds) {
    const rad = (f.angle * Math.PI) / 180;
    const ex = tipX + Math.cos(rad) * f.length;
    const ey = tipY + Math.sin(rad) * f.length;
    const midX = tipX + Math.cos(rad) * f.length * 0.5 + Math.cos(rad + Math.PI / 2) * 18;
    const midY = tipY + Math.sin(rad) * f.length * 0.5 + Math.sin(rad + Math.PI / 2) * 18;

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(midX, midY, ex, ey);
    ctx.stroke();
  }
}

function drawCornerTick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  corner = 'tl'
) {
  const dirs: Record<string, [number, number]> = {
    tl: [1, 1], tr: [-1, 1], bl: [1, -1], br: [-1, -1],
  };
  const [dx, dy] = dirs[corner] || [1, 1];
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(x + dx * size, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * size);
  ctx.stroke();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
) {
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

// Re-export unused but imported (suppress tree-shake warnings)
export { splitTextIntoLines };
