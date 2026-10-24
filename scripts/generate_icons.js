const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function createIcoBuffer(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(count, 4); // number of images

  let offset = 6 + count * 16;
  const dirEntries = [];

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...pngBuffers.map(img => img.buffer)
  ]);
}

async function generateAll() {
  const src = 'C:/Users/samee/.gemini/antigravity-ide/brain/14d06111-33a9-4d3f-9565-c6af8b556601/.user_uploaded/media_1792849477251.png';
  const cropOptions = { left: 195, top: 20, width: 645, height: 535 };
  
  const masterSize = 512;
  const cornerRadius = 110;
  
  const maskSvg = Buffer.from(`
    <svg width="${masterSize}" height="${masterSize}">
      <rect x="0" y="0" width="${masterSize}" height="${masterSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
    </svg>
  `);
  
  const borderSvg = Buffer.from(`
    <svg width="${masterSize}" height="${masterSize}">
      <rect x="2" y="2" width="${masterSize - 4}" height="${masterSize - 4}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="rgba(0, 201, 255, 0.55)" stroke-width="4"/>
    </svg>
  `);
  
  // Create crisp 512x512 master icon with emblem
  const emblemResized = await sharp(src)
    .extract(cropOptions)
    .resize(460, 460, { fit: 'contain', background: { r: 5, g: 11, b: 20, alpha: 1 } })
    .toBuffer();
    
  const masterPngBuffer = await sharp({
    create: {
      width: masterSize,
      height: masterSize,
      channels: 4,
      background: { r: 5, g: 11, b: 20, alpha: 1 }
    }
  })
    .composite([
      { input: emblemResized, gravity: 'center' },
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Save 512x512 master
  fs.writeFileSync('public/icon-512.png', masterPngBuffer);
  fs.writeFileSync('public/icon.png', masterPngBuffer);
  fs.writeFileSync('app/icon.png', masterPngBuffer);

  // Generate 180x180 for apple-icon
  const apple180 = await sharp(masterPngBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync('public/apple-icon.png', apple180);
  fs.writeFileSync('app/apple-icon.png', apple180);

  // Generate 48x48
  const png48 = await sharp(masterPngBuffer).resize(48, 48).png().toBuffer();

  // Generate 32x32
  const png32 = await sharp(masterPngBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/icon-dark-32x32.png', png32);
  fs.writeFileSync('public/icon-light-32x32.png', png32);

  // Generate 16x16
  const png16 = await sharp(masterPngBuffer).resize(16, 16).png().toBuffer();

  // Generate multi-resolution ICO file (16, 32, 48)
  const icoBuffer = createIcoBuffer([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 }
  ]);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);

  // Generate SVG favicon with embedded high-res base64
  const base64Png = masterPngBuffer.toString('base64');
  const svgFavicon = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image href="data:image/png;base64,${base64Png}" width="64" height="64" />
</svg>`;
  fs.writeFileSync('public/thenam-leaf-favicon.svg', svgFavicon);
  fs.writeFileSync('public/icon.svg', svgFavicon);

  console.log('All favicon and taskbar icon assets generated successfully!');
}

generateAll().catch(console.error);
