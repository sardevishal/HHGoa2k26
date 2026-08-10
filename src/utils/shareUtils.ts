import type { ProfileData } from '../types';

export function buildShareText(profile: ProfileData, mode: string): string {
  const name = profile.name?.trim() || '';
  const role = profile.role?.trim() || '';
  const shipping = profile.currentlyShipping?.trim() || '';

  const modeLabel = mode === 'PFP_FRAME' ? 'PFP frame' : 'builder pass';

  let text = '';

  if (name) {
    text += `I'm ${name.toUpperCase()}, geared up for HH Goa 2026! 🏖️🚀\n\n`;
  } else {
    text += `I'm geared up for Hacker House Goa 2026! 🏖️🚀\n\n`;
  }

  if (role) {
    text += `Building as: ${role}\n`;
  }

  if (shipping) {
    text += `Currently shipping: ${shipping}\n`;
  }

  text += `\nJust created my ${modeLabel} — Beach & Code. 28–31 Oct, Goa.\n`;
  text += `\n#FrameInGoa #HHGoa2026 #AIxCrypto #BuildInGoa`;

  return text;
}

export function shareToX(text: string) {
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareToLinkedIn() {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hackerhousegoa.com')}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function nativeShare(text: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    'image/png',
    1.0
  );
}
