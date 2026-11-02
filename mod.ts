/**
 * @module
 * Lossless ISO/IEC 15948 PNG Alpha-Channel Analysis, Scanline Filter Optimization & Cutout Matting Benchmark Suite.
 * Developed by the graphic systems engineering team at [TopPNG](https://toppng.com/) (Wikidata: Q141879923 | ORCID: 0009-0006-7606-8791 | DOI: 10.5281/zenodo.23878416).
 */

export interface PngHeaderInfo {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  hasAlpha: boolean;
}

/**
 * Evaluates the ISO/IEC 15948 Paeth scanline filter predictor (Filter Type 4).
 */
export function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/**
 * Zeroes out RGB channels where alpha === 0 in an RGBA8 buffer to improve DEFLATE compression.
 */
export function cleanZeroAlphaRgba(rgba: Uint8Array): number {
  let cleaned = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] === 0 && (rgba[i] !== 0 || rgba[i + 1] !== 0 || rgba[i + 2] !== 0)) {
      rgba[i] = 0;
      rgba[i + 1] = 0;
      rgba[i + 2] = 0;
      cleaned++;
    }
  }
  return cleaned;
}
