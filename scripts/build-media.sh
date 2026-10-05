#!/usr/bin/env bash
# Encodes the short silent clips the page plays inline. Needs ffmpeg.
#
#   bash scripts/build-media.sh /path/to/closingly_beta_demo_1080p.mp4
#
# The full demo is not stored here: it streams from Mux. Only the 15 second
# hero loop (0:31 to 0:46 of that demo) and the two call clips are built.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/media
mkdir -p "$OUT"

# H.264 with faststart plays everywhere and starts on the first bytes.
enc() { ffmpeg -y -loglevel error "$@" -an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset veryslow -movflags +faststart; }

if [ "${1:-}" ]; then
  enc -ss 31 -t 15 -i "$1" -vf "fps=30,scale=1280:720:flags=lanczos" -crf 25 "$OUT/hero-preview.mp4"
  # Posters: the loop's own first frame, so the swap to video is seamless.
  ffmpeg -y -loglevel error -i "$OUT/hero-preview.mp4" -frames:v 1 -vf scale=1280:720 /tmp/hero-poster.png
  for w in 640 1280; do
    ffmpeg -y -loglevel error -i /tmp/hero-poster.png -vf "scale=$w:-2" -c:v libaom-av1 -still-picture 1 -crf 30 "$OUT/hero-poster-$w.avif"
    ffmpeg -y -loglevel error -i /tmp/hero-poster.png -vf "scale=$w:-2" -quality 80 "$OUT/hero-poster-$w.webp"
  done
fi

# The two faces on the illustrated sales call, at twice their displayed size.
enc -i assets-src/video/call-host.mp4 -vf "scale=580:-2:flags=lanczos" -crf 28 "$OUT/call-host.mp4"
enc -i assets-src/video/call-client.mp4 -vf "scale=348:-2:flags=lanczos" -crf 28 "$OUT/call-client.mp4"
ls -l "$OUT"
