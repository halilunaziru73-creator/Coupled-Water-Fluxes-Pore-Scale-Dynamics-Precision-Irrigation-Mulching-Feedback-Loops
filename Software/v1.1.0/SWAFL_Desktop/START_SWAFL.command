#!/bin/bash
# Double-click this file on a Mac to start SWAFL (it brings its own Node.js if the Mac has none).
# If macOS says the file cannot be opened: open Terminal in this folder and type   chmod +x *.command tools/*.sh   then double-click again.
cd "$(dirname "$0")" || exit 1
xattr -dr com.apple.quarantine . >/dev/null 2>&1
. ./tools/use_node.sh || { read -p "Press Return to close" _; exit 1; }
[ -d node_modules ] || npm install
npm start
