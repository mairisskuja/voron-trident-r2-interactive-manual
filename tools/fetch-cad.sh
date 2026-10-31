#!/bin/sh
# Downloads the official Trident STEP assembly into source/ from a pinned commit of
# VoronDesign/Voron-Trident (GPL-3.0). The file is 185 MB, too big to keep in git.
set -e
COMMIT=7fcb3257a3063225934d9608f82037aa6587d844
cd "$(dirname "$0")/.."
mkdir -p source
[ -f source/trident_assembly.step ] && { echo "source/trident_assembly.step already present"; exit 0; }
curl -fL -o source/trident_assembly.step.zip "https://github.com/VoronDesign/Voron-Trident/raw/$COMMIT/CAD/trident_assembly.step.zip"
unzip -o -j source/trident_assembly.step.zip trident_assembly.step -d source
rm source/trident_assembly.step.zip
