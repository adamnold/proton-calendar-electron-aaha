#!/bin/bash
set -e
ln -sfn '/opt/${sanitizedProductName}/${executable}' '/usr/bin/${executable}'
update-desktop-database /usr/share/applications >/dev/null 2>&1 || true
gtk-update-icon-cache -f /usr/share/icons/hicolor >/dev/null 2>&1 || true
