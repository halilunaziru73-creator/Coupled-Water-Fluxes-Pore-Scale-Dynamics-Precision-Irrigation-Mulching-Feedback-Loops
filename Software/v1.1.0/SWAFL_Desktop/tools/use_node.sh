#!/bin/sh
# Makes sure that node and npm can be found (macOS and Linux). Used by the .command files:  . "$(dirname "$0")/tools/use_node.sh"
# 1. already on the PATH  2. the usual install folders  3. the portable copy kept in tools/node  4. download a portable copy (no administrator rights needed)
HERE="$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)"
if command -v npm >/dev/null 2>&1; then return 0 2>/dev/null || exit 0; fi
for D in /opt/homebrew/bin /usr/local/bin "$HOME/.volta/bin" "$HOME/.nvm/versions/node"/*/bin "$HERE/node/bin"; do
  if [ -x "$D/npm" ]; then PATH="$D:$PATH"; export PATH; return 0 2>/dev/null || exit 0; fi
done
echo
echo "Node.js was not found on this computer. SWAFL will download a portable copy (about 40 MB) into tools/node. It does not change anything else on your computer."
NODEV=v20.18.0
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PLAT=darwin-arm64 ;; Darwin-x86_64) PLAT=darwin-x64 ;; Linux-x86_64) PLAT=linux-x64 ;; Linux-aarch64) PLAT=linux-arm64 ;; *) PLAT="" ;;
esac
if [ -n "$PLAT" ]; then
  TMP="${TMPDIR:-/tmp}/swafl_node.tar.gz"
  if curl -fL "https://nodejs.org/dist/$NODEV/node-$NODEV-$PLAT.tar.gz" -o "$TMP"; then
    rm -rf "$HERE/node" && mkdir -p "$HERE/node" && tar -xzf "$TMP" -C "$HERE/node" --strip-components 1 && rm -f "$TMP"
    if [ -x "$HERE/node/bin/npm" ]; then PATH="$HERE/node/bin:$PATH"; export PATH; return 0 2>/dev/null || exit 0; fi
  fi
fi
echo
echo "Could not get Node.js. Install it from https://nodejs.org (the LTS version), close this window and try again."
return 1 2>/dev/null || exit 1
