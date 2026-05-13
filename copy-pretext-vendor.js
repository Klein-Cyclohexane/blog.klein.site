/**
 * Copies @chenglou/pretext dist/*.js into js/vendor/pretext for browser ESM imports.
 * npm run vendor:pretext  |  postinstall
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const srcDir = path.join(root, "node_modules", "@chenglou", "pretext", "dist");
const dstDir = path.join(root, "js", "vendor", "pretext");
const files = ["layout.js", "bidi.js", "analysis.js", "measurement.js", "line-break.js", "line-text.js"];
const subDirs = [{ src: path.join(srcDir, "generated"), dst: path.join(dstDir, "generated") }];

if (!fs.existsSync(srcDir)) {
  console.error("Missing:", srcDir, "\nRun: npm install");
  process.exit(1);
}
fs.mkdirSync(dstDir, { recursive: true });
for (const f of files) {
  fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
}
for (const { src, dst } of subDirs) {
  if (fs.existsSync(src)) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(dst, f));
    }
  }
}
console.log("Pretext vendor copied to js/vendor/pretext/");
