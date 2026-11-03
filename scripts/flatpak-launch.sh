#!/usr/bin/env bash
set -euo pipefail
fail() { echo "ERROR: $*" >&2; exit 1; }
[[ "$(id -u)" != 0 ]] || fail "Run this application without root privileges."
for key in ELECTRON_DISABLE_SANDBOX ELECTRON_RUN_AS_NODE ZYPAK_DISABLE_SANDBOX; do
  [[ ! -v "$key" ]] || fail "Remove $key; effective sandboxing is required."
done
for arg in "$@"; do
  option="${arg%%=*}"
  if [[ "$option" == -?* && "$option" != --* ]]; then option="-$option"; fi
  case "$option" in
    --no-sandbox|--disable-sandbox|--disable-namespace-sandbox|--disable-seccomp-filter-sandbox|--disable-gpu-sandbox|--single-process|--no-zygote|--in-process-gpu|--disable-setuid-sandbox)
      fail "Unsafe launch option: ${arg%%=*}. Sandboxing is required." ;;
  esac
done
NATIVE="$(readlink -f -- "$0").bin"
[[ -f "$NATIVE" && ! -L "$NATIVE" && -x "$NATIVE" ]] || fail "Native application executable is missing. Reinstall the Flatpak."
# Zypak must receive the ELF directly. It substitutes Flatpak's child-process
# sandbox for Chromium's setuid sandbox; the host namespace preflight cannot run
# inside Flatpak. Never pass --disable-setuid-sandbox or --no-sandbox here.
exec zypak-wrapper "$NATIVE" "$@"
