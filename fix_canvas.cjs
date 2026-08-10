const fs = require('fs');
const path = require('path');

const canvasTs = path.join(__dirname, 'src/utils/canvasRenderer.ts');
let ts = fs.readFileSync(canvasTs, 'utf8');

// 1. Name
ts = ts.replace(/let nameSz = 86;/g, "let nameSz = 110;");
ts = ts.replace(/ctx.font = font\(nameSz, '800', 'Barlow Condensed, sans-serif'\);/g, "ctx.font = font(nameSz, '900', 'Barlow Condensed, sans-serif');");
ts = ts.replace(/ctx.measureText\(nameStr\).width > W - 80 && nameSz > 36/g, "ctx.measureText(nameStr).width > W - 100 && nameSz > 48");

// 2. Role
ts = ts.replace(/ctx.font = font\(15, '700', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(18, '700', 'IBM Plex Mono, monospace');");
ts = ts.replace(/const roleW = Math.min\(ctx.measureText\(roleStr\).width \+ 40, W - 100\);/g, "const roleW = Math.min(ctx.measureText(roleStr).width + 50, W - 100);");
ts = ts.replace(/const rolePillH = 36;/g, "const rolePillH = 42;");
ts = ts.replace(/ctx.fillText\(truncateText\(ctx, roleStr, roleW - 40\), W \/ 2, roleY \+ 24\);/g, "ctx.fillText(truncateText(ctx, roleStr, roleW - 50), W / 2, roleY + 27);");

// 3. Title
ts = ts.replace(/const titleY = roleY \+ 56;/g, "const titleY = roleY + 68;");
ts = ts.replace(/ctx.font = font\(22, '600', 'IBM Plex Sans, sans-serif'\);/g, "ctx.font = font(26, '600', 'IBM Plex Sans, sans-serif');");

// 4. Shipping
ts = ts.replace(/ctx.font = font\(20, '600', 'IBM Plex Sans, sans-serif'\);/g, "ctx.font = font(24, '500', 'IBM Plex Sans, sans-serif');");
ts = ts.replace(/wrapText\(ctx, shippingText, shippingPad \+ 20, shippingY \+ 52, W - shippingPad \* 2 - 40, 26, 2\);/g, "wrapText(ctx, shippingText, shippingPad + 24, shippingY + 54, W - shippingPad * 2 - 48, 32, 2);");

// 5. Pills
ts = ts.replace(/ctx.font = font\(13, '600', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(15, '600', 'IBM Plex Mono, monospace');");
ts = ts.replace(/const pillPad = 28;/g, "const pillPad = 32;");
ts = ts.replace(/const pillH = 38;/g, "const pillH = 46;");
ts = ts.replace(/const pillGap = 12;/g, "const pillGap = 18;");
ts = ts.replace(/ctx.fillText\(pills\[i\], pillX \+ pw \/ 2, pillsY \+ 25\);/g, "ctx.fillText(pills[i], pillX + pw / 2, pillsY + 28);");

// 6. HH Bottom
ts = ts.replace(/ctx.font = font\(54, '800', 'Barlow Condensed, sans-serif'\);/g, "ctx.font = font(64, '900', 'Barlow Condensed, sans-serif');");
ts = ts.replace(/ctx.font = font\(12, '500', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(14, '500', 'IBM Plex Mono, monospace');");
ts = ts.replace(/ctx.font = font\(13, '700', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(15, '700', 'IBM Plex Mono, monospace');");

// 7. PFP Name
ts = ts.replace(/ctx.font = font\(30, '700', 'IBM Plex Sans, sans-serif'\);/g, "ctx.font = font(42, '900', 'Barlow Condensed, sans-serif');");
ts = ts.replace(/ctx.fillText\(truncateText\(ctx, nameStr, W - 120\), W \/ 2, hhY \+ 44\);/g, "ctx.fillText(truncateText(ctx, nameStr, W - 120), W / 2, hhY + 50);");

// 8. PFP Event Info
ts = ts.replace(/ctx.font = font\(15, '600', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(18, '600', 'IBM Plex Mono, monospace');");
ts = ts.replace(/ctx.font = font\(13, '600', 'IBM Plex Mono, monospace'\);/g, "ctx.font = font(15, '600', 'IBM Plex Mono, monospace');");

fs.writeFileSync(canvasTs, ts);
console.log('Canvas updated successfully.');
