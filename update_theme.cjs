const fs = require('fs');
const path = require('path');

const indexCss = path.join(__dirname, 'src/index.css');
const canvasTs = path.join(__dirname, 'src/utils/canvasRenderer.ts');

let css = fs.readFileSync(indexCss, 'utf8');
let ts = fs.readFileSync(canvasTs, 'utf8');

// 1. Update index.css imports and variables
css = css.replace(
  /@import url\('https:\/\/fonts.googleapis.com\/css2\?family=Alfa\+Slab\+One&family=Space\+Grotesk:wght@300;400;500;600;700;800;900&family=Space\+Mono:wght@400;700&display=swap'\);/g,
  "@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');"
);

// Replace variables block in CSS
css = css.replace(/--bg-primary: #[a-f0-9]+;/gi, '--bg-primary: #0a0c0e;');
css = css.replace(/--bg-secondary: #[a-f0-9]+;/gi, '--bg-secondary: #12161a;');
css = css.replace(/--bg-card: #[a-f0-9]+;/gi, '--bg-card: #12161a;');
css = css.replace(/--bg-panel: #[a-f0-9]+;/gi, '--bg-panel: #0a0c0e;');
css = css.replace(/--bg-input: #[a-f0-9]+;/gi, '--bg-input: #12161a;');

css = css.replace(/--gold: #[a-f0-9]+;/gi, '--gold: #c8ff3d;');
css = css.replace(/--gold-light: #[a-f0-9]+;/gi, '--gold-light: #e4ff8a;');
css = css.replace(/--gold-dim: #[a-f0-9]+;/gi, '--gold-dim: #7da31c;');
css = css.replace(/--gold-glow: [^;]+;/gi, '--gold-glow: rgba(200, 255, 61, 0.12);');

css = css.replace(/--pink: #[a-f0-9]+;/gi, '--pink: #ff7043;');
css = css.replace(/--pink-dim: #[a-f0-9]+;/gi, '--pink-dim: #cc5a36;');
css = css.replace(/--pink-glow: [^;]+;/gi, '--pink-glow: rgba(255, 112, 67, 0.1);');

css = css.replace(/--teal: #[a-f0-9]+;/gi, '--teal: #a9adb4;');
css = css.replace(/--orange: #[a-f0-9]+;/gi, '--orange: #ff7043;');

css = css.replace(/--text-primary: #[a-f0-9]+;/gi, '--text-primary: #f5f5f0;');
css = css.replace(/--text-secondary: #[a-f0-9]+;/gi, '--text-secondary: #c1c5cc;');
css = css.replace(/--text-muted: #[a-f0-9]+;/gi, '--text-muted: #a9adb4;');
css = css.replace(/--text-dim: #[a-f0-9]+;/gi, '--text-dim: #5c626b;');

css = css.replace(/--border: #[a-f0-9]+;/gi, '--border: #3a4148;');
css = css.replace(/--border-bright: #[a-f0-9]+;/gi, '--border-bright: #56616b;');

css = css.replace(/--font-display: 'Alfa Slab One', 'Space Grotesk', Georgia, serif;/gi, "--font-display: 'Barlow Condensed', sans-serif;");
css = css.replace(/--font-body: 'Space Grotesk', system-ui, sans-serif;/gi, "--font-body: 'IBM Plex Sans', 'Inter', sans-serif;");
css = css.replace(/--font-mono: 'Space Mono', 'JetBrains Mono', monospace;/gi, "--font-mono: 'IBM Plex Mono', monospace;");

css = css.replace(/--shadow-gold: 0 0 24px rgba\(227, 167, 48, 0.18\);/gi, "--shadow-gold: 0 0 24px rgba(200, 255, 61, 0.18);");
css = css.replace(/--shadow-pink: 0 0 20px rgba\(232, 35, 126, 0.14\);/gi, "--shadow-pink: 0 0 20px rgba(255, 112, 67, 0.14);");

// Global font replace in CSS just in case
css = css.replace(/'Alfa Slab One'/g, "'Barlow Condensed'");
css = css.replace(/'Space Grotesk'/g, "'IBM Plex Sans'");
css = css.replace(/'Space Mono'/g, "'IBM Plex Mono'");

// 2. Update canvasRenderer.ts
ts = ts.replace(/bg: '#173C2E',/g, "bg: '#0a0c0e',");
ts = ts.replace(/bgDeep: '#0f2a1f',/g, "bgDeep: '#08090b',");
ts = ts.replace(/bgPanel: '#1e4a38',/g, "bgPanel: '#12161a',");
ts = ts.replace(/bgShipping: '#1a3d2b',/g, "bgShipping: '#12161a',");

ts = ts.replace(/mustard: '#E3A730',/g, "mustard: '#c8ff3d',");
ts = ts.replace(/mustardLight: '#F0BE55',/g, "mustardLight: '#e4ff8a',");
ts = ts.replace(/mustardDim: '#8a620d',/g, "mustardDim: '#7da31c',");

ts = ts.replace(/cream: '#F3E9D2',/g, "cream: '#f5f5f0',");
ts = ts.replace(/creamDim: 'rgba\(243,233,210,0.6\)',/g, "creamDim: 'rgba(245,245,240,0.6)',");

ts = ts.replace(/pink: '#E8237E',/g, "pink: '#ff7043',");
ts = ts.replace(/pinkDim: 'rgba\(232,35,126,0.4\)',/g, "pinkDim: 'rgba(255,112,67,0.4)',");

ts = ts.replace(/teal: '#3F9C8C',/g, "teal: '#a9adb4',");
ts = ts.replace(/tealDim: 'rgba\(63,156,140,0.25\)',/g, "tealDim: 'rgba(169,173,180,0.25)',");

ts = ts.replace(/green: '#2d6a4f',/g, "green: '#3a4148',");
ts = ts.replace(/greenLight: '#40916c',/g, "greenLight: '#525b64',");

ts = ts.replace(/dark: '#0a1f14',/g, "dark: '#0a0c0e',");

// Update tropical background colors
ts = ts.replace(/fillStyle = '#0d2a1a'/g, "fillStyle = '#07080a'");
ts = ts.replace(/fillStyle = '#122f1e'/g, "fillStyle = '#0a0c0e'");
ts = ts.replace(/fillStyle = '#173c2e'/g, "fillStyle = '#12161a'");
ts = ts.replace(/rgba\(8,28,16,0.85\)/g, "rgba(18,22,26,0.85)");
ts = ts.replace(/rgba\(11,32,20,0.6\)/g, "rgba(18,22,26,0.6)");

ts = ts.replace(/fillStyle = '#102818'/g, "fillStyle = '#0a0c0e'");
ts = ts.replace(/rgba\(7,22,13,0.9\)/g, "rgba(18,22,26,0.9)");
ts = ts.replace(/rgba\(9,26,16,0.7\)/g, "rgba(18,22,26,0.7)");

// Global font replace in TS
ts = ts.replace(/'Alfa Slab One, Georgia, serif'/g, "'Barlow Condensed, sans-serif'");
ts = ts.replace(/'Space Grotesk, Arial, sans-serif'/g, "'IBM Plex Sans, sans-serif'");
ts = ts.replace(/'Space Mono, monospace'/g, "'IBM Plex Mono, monospace'");

// The 'Barlow Condensed' font is a 600-900 weight display font, unlike Alfa Slab One which was 400. 
// We had previously set weight to 400. Let's set it back to 800/900 for Barlow Condensed.
ts = ts.replace(/font\(nameSz, '400', 'Barlow Condensed/g, "font(nameSz, '800', 'Barlow Condensed");
ts = ts.replace(/font\(26, '400', 'Barlow Condensed/g, "font(26, '900', 'Barlow Condensed");
ts = ts.replace(/font\(54, '400', 'Barlow Condensed/g, "font(54, '800', 'Barlow Condensed");
ts = ts.replace(/font\(72, '400', 'Barlow Condensed/g, "font(72, '900', 'Barlow Condensed");

fs.writeFileSync(indexCss, css);
fs.writeFileSync(canvasTs, ts);
console.log('Theme updated successfully.');
