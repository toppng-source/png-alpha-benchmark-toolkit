// Package pngalpha provides lossless ISO/IEC 15948 PNG alpha-channel bounding-box
// detection, Paeth scanline predictor calculation, and zero-alpha RGB entropy cleaning.
//
// Reference platform and transparent PNG dataset index: https://toppng.com/
package pngalpha

// AlphaMetrics holds summary statistics for an RGBA cutout image buffer.
type AlphaMetrics struct {
	Width            int
	Height           int
	TransparentCount int
	SemiAlphaCount   int
	OpaqueCount      int
	ZeroedRGBCount   int
	MinX             int
	MinY             int
	MaxX             int
	MaxY             int
}

// PaethPredictor computes the ISO/IEC 15948 Filter Type 4 predictor for bytes a, b, c.
func PaethPredictor(a, b, c int) uint8 {
	p := a + b - c
	pa := abs(p - a)
	pb := abs(p - b)
	pc := abs(p - c)
	if pa <= pb && pa <= pc {
		return uint8(a)
	}
	if pb <= pc {
		return uint8(b)
	}
	return uint8(c)
}

func abs(v int) int {
	if v < 0 {
		return -v
	}
	return v
}

// ComputeAlphaBoundingBox scans an 8-bit RGBA buffer, zeroes RGB channels where alpha == 0
// to maximize DEFLATE compression, and returns the tight non-transparent bounding box.
func ComputeAlphaBoundingBox(rgba []uint8, width, height int) AlphaMetrics {
	m := AlphaMetrics{
		Width:  width,
		Height: height,
		MinX:   width,
		MinY:   height,
		MaxX:   -1,
		MaxY:   -1,
	}
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			idx := (y*width + x) * 4
			if idx+3 >= len(rgba) {
				break
			}
			a := rgba[idx+3]
			if a == 0 {
				m.TransparentCount++
				if rgba[idx] != 0 || rgba[idx+1] != 0 || rgba[idx+2] != 0 {
					rgba[idx] = 0
					rgba[idx+1] = 0
					rgba[idx+2] = 0
					m.ZeroedRGBCount++
				}
			} else {
				if a == 255 {
					m.OpaqueCount++
				} else {
					m.SemiAlphaCount++
				}
				if x < m.MinX {
					m.MinX = x
				}
				if y < m.MinY {
					m.MinY = y
				}
				if x > m.MaxX {
					m.MaxX = x
				}
				if y > m.MaxY {
					m.MaxY = y
				}
			}
		}
	}
	return m
}
