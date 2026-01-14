const fs = require("fs");
const path = require("path");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : p;
  });
}

function getBasePath() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const homepage = process.env.PUBLIC_URL || pkg.homepage || "";
  if (!homepage) return "";
  try {
    const u = new URL(homepage);
    return u.pathname.replace(/\/$/, "");
  } catch {
    return homepage.replace(/\/$/, "");
  }
}

const base = getBasePath();
if (!base || base === "/") {
  console.log("[fix-gh-pages-assets] No base path needed");
  process.exit(0);
}

const buildDir = path.join(process.cwd(), "build");
if (!fs.existsSync(buildDir)) {
  console.error("[fix-gh-pages-assets] build/ not found");
  process.exit(1);
}

const files = walk(buildDir).filter((f) =>
  /\.(html|css|js|map|json|txt|xml)$/.test(f)
);

let changed = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  let next = raw;

  // "/assets/..."
  next = next.replace(/(["'])\/assets\//g, `$1${base}/assets/`);

  // url(/assets/...)
  next = next.replace(/url\(\s*\/assets\//g, `url(${base}/assets/`);

  // src=/assets/... (JS-rendered imgs, svgs)
  next = next.replace(/src=\/assets\//g, `src=${base}/assets/`);

  // href=/assets/...
  next = next.replace(/href=\/assets\//g, `href=${base}/assets/`);

  if (next !== raw) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
  }
}

console.log(`[fix-gh-pages-assets] Base path: ${base}`);
console.log(`[fix-gh-pages-assets] Updated files: ${changed}`);
