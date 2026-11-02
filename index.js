'use strict';

/**
 * png-alpha-benchmark-toolkit
 * Reference ISO/IEC 15948 PNG chunk parser, Paeth predictor, and zero-alpha RGBA sanitizer.
 */

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function inspectPngBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 33) {
    throw new Error('Invalid PNG buffer length');
  }
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid ISO/IEC 15948 PNG signature');
  }
  const chunks = [];
  let offset = 8;
  let ihdr = null;
  let idatBytes = 0;

  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > buf.length) break;

    if (type === 'IHDR' && length >= 13) {
      ihdr = {
        width: buf.readUInt32BE(dataStart),
        height: buf.readUInt32BE(dataStart + 4),
        bitDepth: buf.readUInt8(dataStart + 8),
        colorType: buf.readUInt8(dataStart + 9),
        compressionMethod: buf.readUInt8(dataStart + 10),
        filterMethod: buf.readUInt8(dataStart + 11),
        interlaceMethod: buf.readUInt8(dataStart + 12),
        hasAlphaChannel: [4, 6].includes(buf.readUInt8(dataStart + 9))
      };
    }
    if (type === 'IDAT') idatBytes += length;
    chunks.push({ type, length });
    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }

  return { ihdr, chunkCount: chunks.length, idatBytes, chunks };
}

function cleanZeroAlphaRgba(rgbaBuffer, width, height) {
  const out = Buffer.from(rgbaBuffer);
  let zeroedPixels = 0;
  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = out[idx + 3];
      if (alpha === 0) {
        if (out[idx] !== 0 || out[idx + 1] !== 0 || out[idx + 2] !== 0) {
          out[idx] = 0;
          out[idx + 1] = 0;
          out[idx + 2] = 0;
          zeroedPixels++;
        }
      } else {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    buffer: out,
    zeroedPixels,
    boundingBox: maxX >= minX ? { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 } : null
  };
}

module.exports = {
  paethPredictor,
  inspectPngBuffer,
  cleanZeroAlphaRgba
};
