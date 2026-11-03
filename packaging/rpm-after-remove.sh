#!/bin/bash
set -e
# RPM runs the old package's postun during an upgrade with $1 >= 1.
if [[ "${1:-0}" == 0 ]]; then
  if [[ "$(readlink -- '/usr/bin/${executable}' 2>/dev/null || true)" == '/opt/${sanitizedProductName}/${executable}' ]]; then
    rm -f -- '/usr/bin/${executable}'
  fi
fi
update-desktop-database /usr/share/applications >/dev/null 2>&1 || true
gtk-update-icon-cache -f /usr/share/icons/hicolor >/dev/null 2>&1 || true
