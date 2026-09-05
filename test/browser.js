/* One place that knows where a browser is and where the site is being
   served, so nineteen suites do not each hard-code a path that is only
   true on one machine.

   The browser: playwright-core does not download anything, so it needs
   to be told. CHROME wins if it is set; otherwise the first candidate
   that exists on disk. In CI, `npx playwright install chromium` puts
   one under PLAYWRIGHT_BROWSERS_PATH and the search below finds it.

   The site: SITE overrides, so the same suites can be pointed at a
   preview URL or at amorfati.today itself rather than only at the
   local server the runner starts. */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers",
                 path.join(process.env.HOME || "/root", ".cache/ms-playwright")]
                .filter(Boolean);
  const leaves = ["chrome-linux/chrome", "chrome-linux64/chrome",
                  "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
                  "chrome-win/chrome.exe"];
  for (const root of roots) {
    let dirs = [];
    try { dirs = fs.readdirSync(root).filter(d => d.startsWith("chromium")); }
    catch (e) { continue; }
    dirs.sort().reverse();                     /* newest build first */
    for (const d of dirs) for (const leaf of leaves) {
      const p = path.join(root, d, leaf);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;                                 /* let playwright try its own */
}

const EXE = findChrome();

function launch(extra) {
  const opts = Object.assign({ args: ["--no-sandbox"] }, extra || {});
  if (EXE) opts.executablePath = EXE;
  return chromium.launch(opts);
}

const SITE = (process.env.SITE || "http://127.0.0.1:8137").replace(/\/$/, "");

module.exports = { launch, SITE, EXE, chromium };
