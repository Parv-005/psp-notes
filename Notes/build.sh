#!/bin/bash
# Rebuild PDFs from the HTML notes:  ./build.sh  [Unit1 Unit2 ...]
cd "$(dirname "$0")"
units=("$@"); [ ${#units[@]} -eq 0 ] && units=($(ls Unit*.html | sed 's/\.html//'))
for u in "${units[@]}"; do
  timeout 120 chromium --headless --disable-gpu --no-sandbox --virtual-time-budget=12000 \
    --no-pdf-header-footer --print-to-pdf="$u.pdf" "file://$PWD/$u.html#print" 2>/dev/null
  echo "$u.pdf: $(pdfinfo "$u.pdf" | awk '/Pages/{print $2}') pages"
done
