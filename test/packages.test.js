"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "aaha-packages-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const names = ["fixture-aaha-v2.1.0-x86_64.rpm", "fixture-aaha-v2.1.0-x86_64.flatpak"];
  for (const filename of names) fs.writeFileSync(path.join(directory, filename), "inert package " + filename);
  fs.writeFileSync(path.join(directory, "BUILDINFO.json"), JSON.stringify({ app: "fixture-aaha", version: "2.1.0", architecture: "x64", sourceCommit: "a".repeat(40), tag: "v2.1.0", lockfileSha256: "b".repeat(64), repository: "https://github.com/example/fixture-aaha", templateVersion: "3.0.0", tools: { node: "v24.21.0" }, electron: { version: "44.7.0" } }));
  function manifest(extra = []) {
    fs.writeFileSync(path.join(directory, "SHA256SUMS.packages"), [...names, "BUILDINFO.json", ...extra].map(filename => `${crypto.createHash("sha256").update(fs.readFileSync(path.join(directory, filename))).digest("hex")}  ${filename}\n`).join(""));
  }
  manifest();
  const key = path.join(directory, "signing.key");
  const pub = path.join(directory, "release.pub");
  assert.equal(spawnSync("minisign", ["-G", "-W", "-s", key, "-p", pub]).status, 0);
  function sign() { assert.equal(spawnSync("minisign", ["-Sm", path.join(directory, "SHA256SUMS.packages"), "-s", key]).status, 0); }
  sign();
  return { directory, names, pub, sign, manifest };
}

test("package signatures authenticate both packages and shared provenance without an AppImage", t => {
  const f = fixture(t);
  const { verifyPackages } = require("../scripts/verify-packages.js");
  assert.deepEqual(verifyPackages(f.directory, { repoName: "fixture-aaha" }, { version: "2.1.0", publicKey: f.pub }), f.names);
  fs.appendFileSync(path.join(f.directory, f.names[0]), "changed");
  assert.throws(() => verifyPackages(f.directory, { repoName: "fixture-aaha" }, { version: "2.1.0", publicKey: f.pub }), /checksum/i);
});

test("package verification refuses missing, ambiguous and linked payloads", t => {
  const f = fixture(t);
  const verify = () => require("../scripts/verify-packages.js").verifyPackages(f.directory, { repoName: "fixture-aaha" }, { version: "2.1.0", publicKey: f.pub });
  fs.renameSync(path.join(f.directory, f.names[0]), path.join(f.directory, "saved"));
  assert.throws(verify, /exactly one|missing/i);
  fs.symlinkSync("saved", path.join(f.directory, f.names[0]));
  assert.throws(verify, /regular/i);
  fs.unlinkSync(path.join(f.directory, f.names[0]));
  fs.renameSync(path.join(f.directory, "saved"), path.join(f.directory, f.names[0]));
  fs.copyFileSync(path.join(f.directory, f.names[0]), path.join(f.directory, "second.rpm"));
  assert.throws(verify, /exactly one/i);
});

test("package verification rejects wrong keys, manifest paths and mismatched metadata", t => {
  const f = fixture(t);
  const verify = options => require("../scripts/verify-packages.js").verifyPackages(f.directory, { repoName: "fixture-aaha" }, { version: "2.1.0", publicKey: f.pub, ...options });
  const other = path.join(f.directory, "other.pub");
  assert.equal(spawnSync("minisign", ["-G", "-W", "-s", path.join(f.directory, "other.key"), "-p", other]).status, 0);
  assert.throws(() => verify({ publicKey: other }), /signature/i);
  fs.appendFileSync(path.join(f.directory, "SHA256SUMS.packages"), `${"a".repeat(64)}  ../outside\n`);
  f.sign();
  assert.throws(() => verify(), /manifest/i);
  const info = JSON.parse(fs.readFileSync(path.join(f.directory, "BUILDINFO.json"), "utf8"));
  info.version = "9.0.0";
  fs.writeFileSync(path.join(f.directory, "BUILDINFO.json"), JSON.stringify(info));
  f.manifest(); f.sign();
  assert.throws(() => verify(), /identity|version/i);
});
