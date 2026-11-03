#!/usr/bin/env bash
set -euo pipefail
fail() { echo "ERROR: $*" >&2; exit 1; }
[[ "$(id -u)" != 0 ]] || fail "This per-user application must not run as root."
[[ ! ${ELECTRON_DISABLE_SANDBOX+x} && ! ${ELECTRON_RUN_AS_NODE+x} ]] || fail "Remove sandbox-disabling Electron environment variables."
for arg in "$@"; do
  option="${arg%%=*}"
  if [[ "$option" == -?* && "$option" != --* ]]; then option="-$option"; fi
  case "$option" in
    --no-sandbox|--disable-sandbox|--disable-namespace-sandbox|--disable-seccomp-filter-sandbox|--disable-gpu-sandbox|--single-process|--no-zygote|--in-process-gpu)
      fail "Unsafe launch option: ${arg%%=*}. Sandboxing is required." ;;
  esac
done
command -v unshare >/dev/null && unshare -Ur true 2>/dev/null || fail "User namespaces are unavailable. Ask your administrator to permit sandboxed applications; this wrapper will not run unsandboxed."
SCRIPT_PATH="$(readlink -f -- "$0")"
SCRIPT_DIR="$(dirname -- "$SCRIPT_PATH")"
NATIVE="$SCRIPT_PATH.bin"
if [[ -f "$NATIVE" && ! -L "$NATIVE" && -x "$NATIVE" ]]; then
  exec "$NATIVE" --disable-setuid-sandbox "$@"
fi
if [[ "$(basename -- "$SCRIPT_PATH")" == launch.sh && -x "$SCRIPT_DIR/../node_modules/.bin/electron" ]]; then
  cd "$SCRIPT_DIR/.."
  exec node_modules/.bin/electron --disable-setuid-sandbox . "$@"
fi
fail "Native application executable is missing. Reinstall a verified release."
