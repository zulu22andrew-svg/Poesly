import sharp from 'sharp';
import fs from 'fs';

async function createDiverseTestFrames() {
  if (!fs.existsSync('test_assets/verification_frames')) {
    fs.mkdirSync('test_assets/verification_frames', { recursive: true });
  }

  // 1. Sharp Person Smiling (Eyes Open, Facing Camera)
  const svgSharpSmiling = `
  <svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#1e293b" />
    <path d="M220,480 C220,340 420,340 420,480 Z" fill="#3b82f6" />
    <rect x="295" y="260" width="50" height="60" fill="#e0a97a" />
    <ellipse cx="320" cy="200" rx="75" ry="95" fill="#f5c296" />
    <path d="M240,190 C240,100 400,100 400,190 C370,120 270,120 240,190 Z" fill="#3d2314" />
    <ellipse cx="285" cy="185" rx="14" ry="8" fill="#ffffff" />
    <circle cx="285" cy="185" r="5" fill="#1e293b" />
    <ellipse cx="355" cy="185" rx="14" ry="8" fill="#ffffff" />
    <circle cx="355" cy="185" r="5" fill="#1e293b" />
    <path d="M280,240 Q320,285 360,240" stroke="#b91c1c" stroke-width="6" fill="none" stroke-linecap="round" />
  </svg>`;
  await sharp(Buffer.from(svgSharpSmiling)).jpeg({ quality: 95 }).toFile('test_assets/verification_frames/01_sharp_smiling.jpg');

  // 2. Sharp Person Neutral (Eyes Open, Facing Camera)
  const svgSharpNeutral = `
  <svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#1e293b" />
    <path d="M220,480 C220,340 420,340 420,480 Z" fill="#3b82f6" />
    <rect x="295" y="260" width="50" height="60" fill="#e0a97a" />
    <ellipse cx="320" cy="200" rx="75" ry="95" fill="#f5c296" />
    <path d="M240,190 C240,100 400,100 400,190 C370,120 270,120 240,190 Z" fill="#3d2314" />
    <ellipse cx="285" cy="185" rx="14" ry="8" fill="#ffffff" />
    <circle cx="285" cy="185" r="5" fill="#1e293b" />
    <ellipse cx="355" cy="185" rx="14" ry="8" fill="#ffffff" />
    <circle cx="355" cy="185" r="5" fill="#1e293b" />
    <line x1="295" y1="250" x2="345" y2="250" stroke="#a85252" stroke-width="3" />
  </svg>`;
  await sharp(Buffer.from(svgSharpNeutral)).jpeg({ quality: 95 }).toFile('test_assets/verification_frames/02_sharp_neutral.jpg');

  // 3. Sharp Person Eyes Closed
  const svgEyesClosed = `
  <svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#1e293b" />
    <path d="M220,480 C220,340 420,340 420,480 Z" fill="#3b82f6" />
    <rect x="295" y="260" width="50" height="60" fill="#e0a97a" />
    <ellipse cx="320" cy="200" rx="75" ry="95" fill="#f5c296" />
    <path d="M240,190 C240,100 400,100 400,190 C370,120 270,120 240,190 Z" fill="#3d2314" />
    <line x1="270" y1="185" x2="298" y2="185" stroke="#b07d54" stroke-width="2.5" />
    <line x1="342" y1="185" x2="370" y2="185" stroke="#b07d54" stroke-width="2.5" />
    <path d="M280,240 Q320,285 360,240" stroke="#b91c1c" stroke-width="6" fill="none" stroke-linecap="round" />
  </svg>`;
  await sharp(Buffer.from(svgEyesClosed)).jpeg({ quality: 95 }).toFile('test_assets/verification_frames/03_sharp_eyes_closed.jpg');

  // 4. Blur Mild
  await sharp(Buffer.from(svgSharpSmiling)).blur(2.0).jpeg().toFile('test_assets/verification_frames/04_blur_mild.jpg');

  // 5. Blur Medium
  await sharp(Buffer.from(svgSharpSmiling)).blur(5.0).jpeg().toFile('test_assets/verification_frames/05_blur_medium.jpg');

  // 6. Blur Heavy
  await sharp(Buffer.from(svgSharpSmiling)).blur(10.0).jpeg().toFile('test_assets/verification_frames/06_blur_heavy.jpg');

  // 7. No Person (blank frame)
  const svgNoPerson = `
  <svg width="640" height="480" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#0f172a" />
    <rect x="50" y="50" width="540" height="380" fill="#1e293b" stroke="#334155" stroke-width="4" />
  </svg>`;
  await sharp(Buffer.from(svgNoPerson)).jpeg().toFile('test_assets/verification_frames/07_no_person.jpg');

  console.log('Diverse test frames ready!');
}

createDiverseTestFrames();
