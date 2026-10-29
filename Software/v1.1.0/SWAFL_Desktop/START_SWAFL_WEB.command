#!/bin/bash
# Double-click on a Mac: SWAFL in the web browser (keep this window open). Daisy runs need the desktop program.
cd "$(dirname "$0")" || exit 1
. ./tools/use_node.sh || { read -p "Press Return to close" _; exit 1; }
node serve.js
