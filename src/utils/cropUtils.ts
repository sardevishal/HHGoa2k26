import type { CropSettings } from '../types';

/**
 * Computes the drawImage parameters for a cropped/zoomed/offset image
 * fitting into a destination rectangle.
 *
 * Returns: { sx, sy, sw, sh, dx, dy, dw, dh }
 * where sx,sy,sw,sh are source crop coords and dx,dy,dw,dh are dest coords.
 */
export function computeCropTransform(
  imgWidth: number,
  imgHeight: number,
  destWidth: number,
  destHeight: number,
  crop: CropSettings
): { sx: number; sy: number; sw: number; sh: number } {
  const { zoom, horizontal, vertical } = crop;

  // The destination frame has a certain aspect ratio.
  // We want to fit/cover the image into the dest frame, then zoom + offset.

  // Step 1: base scale to cover the dest frame
  const baseScaleX = destWidth / imgWidth;
  const baseScaleY = destHeight / imgHeight;
  const baseScale = Math.max(baseScaleX, baseScaleY);

  // Step 2: apply user zoom
  const scale = baseScale * zoom;

  // Step 3: compute the source window size (what we "see" of the original image)
  const viewW = destWidth / scale;   // source pixels visible horizontally
  const viewH = destHeight / scale;  // source pixels visible vertically

  // Step 5: max offsets in source pixels
  const maxOffsetX = imgWidth - viewW;
  const maxOffsetY = imgHeight - viewH;

  // Step 6: apply position (0% = top/left, 100% = bottom/right)
  const sx = Math.max(0, Math.min(maxOffsetX, (horizontal / 100) * maxOffsetX));
  const sy = Math.max(0, Math.min(maxOffsetY, (vertical / 100) * maxOffsetY));

  return { sx, sy, sw: viewW, sh: viewH };
}

/**
 * Draws a cropped image onto a canvas context into a destination rectangle.
 * Optionally clips to a rounded rectangle.
 */
export function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: CropSettings,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  cornerRadius = 0
) {
  const { sx, sy, sw, sh } = computeCropTransform(img.naturalWidth, img.naturalHeight, dw, dh, crop);

  ctx.save();
  if (cornerRadius > 0) {
    roundedRect(ctx, dx, dy, dw, dh, cornerRadius);
    ctx.clip();
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

/**
 * Creates a rounded rectangle path.
 */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Wraps text onto canvas, returning array of lines rendered.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const words = text.split(' ');
  let line = '';
  let linesDrawn = 0;
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      if (linesDrawn < maxLines - 1) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
      } else {
        // Truncate with ellipsis
        let truncated = line.trim();
        while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + '…', x, currentY);
        return linesDrawn + 1;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return linesDrawn + 1;
}

/**
 * Truncates text to fit within maxWidth, adding ellipsis if needed.
 */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

/**
 * Draws a grain/noise texture overlay on the canvas.
 */
export function drawGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity = 0.03
) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 255;
    data[i] = noise;
    data[i + 1] = noise;
    data[i + 2] = noise;
    data[i + 3] = opacity * 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draws a dot grid pattern.
 */
export function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing = 20,
  color = 'rgba(255,255,255,0.04)'
) {
  ctx.fillStyle = color;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
