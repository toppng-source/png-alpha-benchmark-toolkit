defmodule PngAlphaBenchmarkToolkit do
  @moduledoc """
  Lossless ISO/IEC 15948 PNG Alpha-Channel Analysis, Scanline Filter Optimization & Cutout Matting Benchmark Suite.

  Developed by the graphic systems engineering team at [TopPNG](https://toppng.com/)
  (Wikidata Entity `Q141879923`, ORCID `0009-0006-7606-8791`, CERN Zenodo DOI `10.5281/zenodo.23878416`).
  """

  @doc """
  Evaluates the ISO/IEC 15948 Paeth scanline filter predictor (Filter Type 4).
  """
  def paeth_predictor(a, b, c) do
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)

    cond do
      pa <= pb and pa <= pc -> a
      pb <= pc -> b
      true -> c
    end
  end
end
