const fs = require('fs');
const path = require('path');

function getImageInfo(buffer, filename) {
  // Check PNG
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { mime: 'image/png', width, height };
  }

  // Check JPEG
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      // SOF0 (0xC0) through SOF2 (0xC2) contain width & height
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { mime: 'image/jpeg', width, height };
      }
      const segmentLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
    return { mime: 'image/jpeg', width: 0, height: 0 };
  }

  // Check WebP
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType === 'VP8 ') {
      const width = buffer.readUInt16LE(26) & 0x3fff;
      const height = buffer.readUInt16LE(28) & 0x3fff;
      return { mime: 'image/webp', width, height };
    } else if (chunkType === 'VP8L') {
      const b0 = buffer[21];
      const b1 = buffer[22];
      const b2 = buffer[23];
      const b3 = buffer[24];
      const width = 1 + (((b1 & 0x3f) << 8) | b0);
      const height = 1 + ((((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)));
      return { mime: 'image/webp', width, height };
    } else if (chunkType === 'VP8X') {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { mime: 'image/webp', width, height };
    }
    return { mime: 'image/webp', width: 0, height: 0 };
  }

  // Check SVG
  const head = buffer.slice(0, 1024).toString('utf8');
  if (head.includes('<svg') || filename.endsWith('.svg')) {
    const wMatch = head.match(/width=["'](\d+)(?:px)?["']/i);
    const hMatch = head.match(/height=["'](\d+)(?:px)?["']/i);
    const vbMatch = head.match(/viewBox=["'][\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)["']/i);
    const width = wMatch ? parseInt(wMatch[1], 10) : vbMatch ? Math.round(parseFloat(vbMatch[1])) : 0;
    const height = hMatch ? parseInt(hMatch[1], 10) : vbMatch ? Math.round(parseFloat(vbMatch[2])) : 0;
    return { mime: 'image/svg+xml', width, height };
  }

  return null;
}

// Test on real images in public
const testFiles = [
  'public/hero-bg.png',
  'public/services/web-development.jpg',
  'public/about-portfolio/team-curly-jacket.jpg',
  'public/projects/featured-agrismart-hq.png',
  'public/icon.png',
  'public/icon.svg',
];

for (const tf of testFiles) {
  const fullPath = path.join(process.cwd(), tf);
  if (fs.existsSync(fullPath)) {
    const buf = fs.readFileSync(fullPath);
    const info = getImageInfo(buf, tf);
    console.log(`${tf}:`, info, `(${buf.length} bytes)`);
  }
}
