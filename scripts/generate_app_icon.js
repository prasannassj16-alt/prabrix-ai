import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function generateAppIcon() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });

  const svg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#060B18"/>
        <stop offset="50%" stop-color="#0B132B"/>
        <stop offset="100%" stop-color="#111C38"/>
      </linearGradient>
      <linearGradient id="tealCyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#14B8A6"/>
        <stop offset="100%" stop-color="#06B6D4"/>
      </linearGradient>
      <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#FBBF24"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- App Icon Rounded Background -->
    <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
    
    <!-- Outer Cadastral Grid Outline -->
    <rect x="36" y="36" width="440" height="440" rx="88" fill="none" stroke="rgba(20, 184, 166, 0.3)" stroke-width="3" stroke-dasharray="10 8"/>

    <!-- Subtle Cadastral Polygon Mesh -->
    <polygon points="120,140 280,100 400,180 340,320 180,360" fill="rgba(6, 182, 212, 0.06)" stroke="rgba(6, 182, 212, 0.25)" stroke-width="2"/>
    <line x1="280" y1="100" x2="240" y2="260" stroke="rgba(20, 184, 166, 0.25)" stroke-width="2" stroke-dasharray="4 4"/>
    <line x1="400" y1="180" x2="240" y2="260" stroke="rgba(20, 184, 166, 0.25)" stroke-width="2" stroke-dasharray="4 4"/>

    <!-- Distinctive Stylized P Monogram with Geo-Pin -->
    <!-- Vertical Cadastral Pillar -->
    <rect x="150" y="140" width="50" height="232" rx="25" fill="url(#tealCyan)" filter="url(#glow)"/>
    
    <!-- P Upper Boundary Loop (Land Demarcation Polygon) -->
    <path d="M 175 140 H 295 C 360 140 385 190 385 235 C 385 280 360 325 295 325 H 175" 
          fill="none" stroke="url(#tealCyan)" stroke-width="48" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
    
    <!-- Center AI Geospatial Coordinate Core Pin -->
    <circle cx="278" cy="232" r="26" fill="#060B18" stroke="url(#tealCyan)" stroke-width="6"/>
    <circle cx="278" cy="232" r="10" fill="url(#goldAccent)"/>

    <!-- Small Bottom AI Sparkle Accent -->
    <polygon points="360,355 366,375 386,381 366,387 360,407 354,387 334,381 354,375" fill="url(#goldAccent)"/>
  </svg>
  `;

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${svg}</body></html>`);

  const dirs = ['public/images', 'frontend/public/images'];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    const outPath = path.join(d, 'app-icon.png');
    await page.screenshot({ path: outPath, omitBackground: true });
    console.log('Successfully generated app icon at:', outPath);
  }

  // Also generate Android mipmap icons in android/app/src/main/res/
  const mipmaps = [
    { dir: 'android/app/src/main/res/mipmap-mdpi', size: 48 },
    { dir: 'android/app/src/main/res/mipmap-hdpi', size: 72 },
    { dir: 'android/app/src/main/res/mipmap-xhdpi', size: 96 },
    { dir: 'android/app/src/main/res/mipmap-xxhdpi', size: 144 },
    { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
  ];

  for (const m of mipmaps) {
    if (fs.existsSync(m.dir)) {
      await page.setViewportSize({ width: m.size, height: m.size });
      await page.screenshot({ path: path.join(m.dir, 'ic_launcher.png'), omitBackground: true });
      await page.screenshot({ path: path.join(m.dir, 'ic_launcher_round.png'), omitBackground: true });
      await page.screenshot({ path: path.join(m.dir, 'ic_launcher_foreground.png'), omitBackground: true });
      console.log(`Generated ${m.size}x${m.size} icon in:`, m.dir);
    }
  }

  await browser.close();
}

generateAppIcon().catch(console.error);
