"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const sourceRoot = path.resolve(__dirname, "../..");
const config = require("../../app.config.js");
function createFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `${config.repoName}-installer-`));
  const repo = path.join(root, "repo");
  const home = path.join(root, "home");
  const stateHome = path.join(home, ".local", "state");
  fs.cpSync(sourceRoot, repo, {
    recursive: true,
    filter(source) {
      return ![".git", "node_modules", "dist", ".superpowers"].includes(path.basename(source));
    }
  });
  const unpacked = path.join(repo, "dist", "linux-unpacked");
  fs.mkdirSync(unpacked, { recursive: true });
  const executable = path.join(unpacked, config.executable);
  fs.writeFileSync(executable, "#!/usr/bin/env bash\nexit 0\n");
  fs.chmodSync(executable, 0o755);
  fs.writeFileSync(path.join(unpacked, "chrome-sandbox"), "sandbox\n");
  for (const size of [16, 24, 32, 48, 64, 96, 128, 256, 512]) {
    const icon = path.join(repo, "build", "icons", `${size}x${size}.png`);
    fs.mkdirSync(path.dirname(icon), { recursive: true });
    if (!fs.existsSync(icon)) fs.writeFileSync(icon, `icon-${size}\n`);
  }
  const appImageName = `${config.repoName}-test-x86_64.AppImage`;
  const appImage = path.join(repo, "dist", appImageName);
  fs.writeFileSync(appImage, `#!/usr/bin/env bash
set -eu
[[ "$1" == --appimage-extract ]]
mkdir squashfs-root
printf '#!/bin/sh\\nexit 0\\n' > squashfs-root/${config.executable}
chmod 755 squashfs-root/${config.executable}
printf 'authenticated fixture' > squashfs-root/payload.txt
mkdir squashfs-root/aaha-icons
for size in 16 24 32 48 64 96 128 256 512; do printf icon > squashfs-root/aaha-icons/\${size}x\${size}.png; done
`);
  fs.chmodSync(appImage, 0o755);
  const digest = crypto.createHash("sha256").update(fs.readFileSync(appImage)).digest("hex");
  fs.writeFileSync(path.join(repo, "dist", "SHA256SUMS"), `${digest}  ${appImageName}\n`);
  fs.mkdirSync(home, { recursive: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const bin = path.join(root, "bin"); fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "sudo"), "#!/bin/sh\necho forbidden-privilege >&2\nexit 97\n");
  fs.chmodSync(path.join(bin, "sudo"), 0o755);
  return { repo, home, stateHome, root, bin, appImage };
}

function run(fixture, script, args = []) {
  return spawnSync("bash", [script, ...(script === "install.sh" ? ["--local-build"] : []), ...args], {
    cwd: fixture.repo,
    encoding: "utf8",
    env: {
      ...process.env,
      AAHA_HOME: fixture.home,
      AAHA_STATE_HOME: fixture.stateHome,
      PATH: `${fixture.bin}:${process.env.PATH}`,
      XDG_CONFIG_HOME: fixture.xdg || "",
      AAHA_SKIP_DESKTOP_REFRESH: "1"
    }
  });
}

function receiptPath(fixture) {
  return path.join(fixture.stateHome, "aaha", config.repoName, "install-root");
}


module.exports = { createFixture, run, receiptPath };
