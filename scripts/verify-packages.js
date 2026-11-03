"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { digest } = require("./verify-artifacts.js");
function regular(filename) {
  if (!fs.lstatSync(filename).isFile()) throw new Error(`Expected a regular file: ${path.basename(filename)}`);
}
function verifyPackages(directory, cfg, { publicKey = path.resolve("release.pub"), version, localBuild = false } = {}) {
  const files = fs.readdirSync(directory);
  const names = ["rpm", "flatpak"].map(extension => {
    const candidates = files.filter(filename => filename.endsWith("." + extension));
    if (candidates.length !== 1) throw new Error(`Expected exactly one ${extension} package; found ${candidates.length}.`);
    const filename = candidates[0];
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(filename) || filename !== `${cfg.repoName}-v${version}-x86_64.${extension}`) throw new Error("Unexpected package identity/version.");
    regular(path.join(directory, filename));
    return filename;
  });
  const manifest = path.join(directory, "SHA256SUMS.packages");
  regular(manifest);
  if (!localBuild) {
    regular(publicKey); regular(manifest + ".minisig");
    const key = fs.readFileSync(publicKey, "utf8").split(/\r?\n/).find(line => /^[A-Za-z0-9+/]{56}$/.test(line));
    if (!key) throw new Error("Release public key is not configured.");
    const result = spawnSync("minisign", ["-Vm", manifest, "-x", manifest + ".minisig", "-P", key], { encoding: "utf8" });
    if (result.status !== 0) throw new Error("Package signature verification failed (minisign is required).");
  }
  const expectedNames = new Set([...names, "BUILDINFO.json"]);
  const seen = new Set();
  for (const line of fs.readFileSync(manifest, "utf8").trim().split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})  ([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(line);
    if (!match || seen.has(match[2]) || !expectedNames.has(match[2])) throw new Error("Invalid package checksum manifest.");
    seen.add(match[2]);
    regular(path.join(directory, match[2]));
    if (digest(path.join(directory, match[2])) !== match[1]) throw new Error(`Package checksum mismatch: ${match[2]}`);
  }
  if (seen.size !== expectedNames.size) throw new Error("Package manifest must cover RPM, Flatpak and BUILDINFO.json.");
  const info = JSON.parse(fs.readFileSync(path.join(directory, "BUILDINFO.json"), "utf8"));
  if (info.app !== cfg.repoName || info.version !== version || info.architecture !== "x64") throw new Error("Package build metadata identity/version/architecture mismatch.");
  if (!localBuild && (!/^[a-f0-9]{40}$/.test(info.sourceCommit) || info.tag !== `v${version}` || !/^[a-f0-9]{64}$/.test(info.lockfileSha256) || !info.repository || !info.tools || !info.electron || !info.templateVersion)) throw new Error("Incomplete signed package provenance.");
  return names;
}
if (require.main === module) {
  try {
    const [directory, ...args] = process.argv.slice(2);
    let publicKey = path.resolve("release.pub"); let localBuild = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--public-key" && args[i + 1]) publicKey = path.resolve(args[++i]);
      else if (args[i] === "--local-build") localBuild = true;
      else throw new Error("Unknown package verification option.");
    }
    console.log(verifyPackages(directory, require(path.resolve("app.config.js")), { publicKey, localBuild, version: require(path.resolve("package.json")).version }).join("\n"));
  } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}
module.exports = { verifyPackages };
