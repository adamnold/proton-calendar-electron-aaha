"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { validateConfig } = require("../src/policy.js");
const RUNTIME_VERSION = "26.08";
const RUNTIME_REPO = "https://dl.flathub.org/repo/flathub.flatpakrepo";
const quote = value => "'" + String(value).replace(/'/g, "'\\''") + "'";
const xml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
const desktopValue = value => String(value || "").replace(/\\/g, "\\\\").replace(/\r/g, "\\r").replace(/\n/g, "\\n");

function prepareFlatpak(outputDirectory, payloadDirectory, cfg, pkg) {
  const errors = validateConfig(cfg);
  if (errors.length) throw new Error(errors.join("\n"));
  for (const key of ["repoName", "executable", "appId"]) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(cfg[key])) throw new Error(`Invalid package identity: ${key}`);
  }
  if (!/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*){2,}$/.test(cfg.appId)) throw new Error("Invalid Flatpak application ID.");
  const out = path.resolve(outputDirectory);
  fs.mkdirSync(out, { recursive: true });
  const desktop = `${cfg.appId}.desktop`;
  const metainfo = `${cfg.appId}.metainfo.xml`;
  fs.writeFileSync(path.join(out, desktop), `[Desktop Entry]\nType=Application\nName=${desktopValue(cfg.productName)}\nComment=${desktopValue(cfg.comment || pkg.description)}\nExec=${cfg.executable} %U\nIcon=${cfg.appId}\nTerminal=false\nCategories=${desktopValue(cfg.category)}\nKeywords=${desktopValue(cfg.keywords)}\nStartupWMClass=${cfg.appId}\nStartupNotify=true\nX-KDE-StartupNotify=true\n`);
  const author = typeof pkg.author === "object" ? pkg.author.name : pkg.author;
  fs.writeFileSync(path.join(out, metainfo), `<?xml version="1.0" encoding="UTF-8"?>\n<component type="desktop-application">\n  <id>${xml(cfg.appId)}</id>\n  <name>${xml(cfg.productName)}</name>\n  <summary>${xml(pkg.description)}</summary>\n  <metadata_license>CC0-1.0</metadata_license>\n  <project_license>${xml(pkg.license)}</project_license>\n  <description><p>${xml(pkg.description)}</p><p>This independent desktop wrapper is unaffiliated with Proton.</p></description>\n  <launchable type="desktop-id">${xml(desktop)}</launchable>\n  <url type="homepage">${xml((cfg.repository || pkg.repository.url).replace(/\.git$/, ""))}</url>\n  <developer id="com.adamandhisagents"><name>${xml(author)}</name></developer>\n  <content_rating type="oars-1.1"/>\n</component>\n`);
  const appDirectory = `/app/lib/${cfg.repoName}`;
  const commands = [
    `mkdir -p ${quote(appDirectory)} /app/bin`,
    `cp -a payload/. ${quote(appDirectory + "/")}`,
    `install -m755 launch.sh ${quote(appDirectory + "/" + cfg.executable)}`,
    `ln -s ${quote(appDirectory + "/" + cfg.executable)} ${quote("/app/bin/" + cfg.executable)}`,
    `install -Dm644 ${quote(desktop)} ${quote("/app/share/applications/" + desktop)}`,
    `install -Dm644 ${quote(metainfo)} ${quote("/app/share/metainfo/" + metainfo)}`
  ];
  for (const size of [16, 24, 32, 48, 64, 96, 128, 256, 512]) {
    commands.push(`install -Dm644 ${quote(`payload/aaha-icons/${size}x${size}.png`)} ${quote(`/app/share/icons/hicolor/${size}x${size}/apps/${cfg.appId}.png`)}`);
  }
  const manifest = {
    "app-id": cfg.appId, runtime: "org.freedesktop.Platform", "runtime-version": RUNTIME_VERSION,
    sdk: "org.freedesktop.Sdk", base: "org.electronjs.Electron2.BaseApp", "base-version": RUNTIME_VERSION,
    command: cfg.executable, branch: "stable",
    "finish-args": ["--share=network", "--share=ipc", "--socket=wayland", "--socket=fallback-x11", "--device=dri", "--socket=pulseaudio", "--filesystem=xdg-download"],
    modules: [{ name: "application", buildsystem: "simple", "build-commands": commands, sources: [
      { type: "dir", path: path.resolve(payloadDirectory), dest: "payload" },
      { type: "file", path: path.join(__dirname, "flatpak-launch.sh"), "dest-filename": "launch.sh" },
      { type: "file", path: path.join(out, desktop) },
      { type: "file", path: path.join(out, metainfo) }
    ] }]
  };
  const filename = path.join(out, "manifest.json");
  fs.writeFileSync(filename, JSON.stringify(manifest, null, 2) + "\n");
  return filename;
}
if (require.main === module) {
  try {
    if (process.argv.length !== 4) throw new Error("Usage: prepare-flatpak.js /output/directory /unpacked/application");
    console.log(prepareFlatpak(process.argv[2], process.argv[3], require("../app.config.js"), require("../package.json")));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { prepareFlatpak, RUNTIME_VERSION, RUNTIME_REPO };
