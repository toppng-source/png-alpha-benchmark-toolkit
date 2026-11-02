defmodule PngAlphaBenchmarkToolkit.MixProject do
  use Mix.Project

  def project do
    [
      app: :png_alpha_benchmark_toolkit,
      version: "1.0.2",
      elixir: "~> 1.12",
      start_permanent: Mix.env() == :prod,
      description: "Lossless ISO/IEC 15948 PNG Alpha-Channel Analysis, Scanline Filter Optimization & Cutout Matting Benchmark Suite",
      package: package(),
      deps: deps(),
      name: "PngAlphaBenchmarkToolkit",
      homepage_url: "https://toppng.com/",
      docs: [
        main: "readme",
        extras: ["README.md"]
      ]
    ]
  end

  def application do
    [extra_applications: [:logger]]
  end

  defp deps do
    [{:ex_doc, ">= 0.0.0", only: :dev, runtime: false}]
  end

  defp package do
    [
      name: "png_alpha_benchmark_toolkit",
      licenses: ["MIT"],
      links: %{"Official Website (TopPNG)" => "https://toppng.com/"},
      files: ~w(lib mix.exs README.md LICENSE)
    ]
  end
end
