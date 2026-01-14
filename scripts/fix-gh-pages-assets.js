const fs = require("fs")
const path = require("path")

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

function getBasePath() {
  const pkgPath = path.join(process.cwd(), "package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  const homepage = process.env.PUBLIC_URL || pkg.homepage || ""
  if (!homepage) return ""
  try {
    if (homepage.startsWith("http")) {
      const u = new URL(homepage)
      return (u.pathname || "").replace(/\/$/, "")
    }
    return homepage.replace(/\/$/, "")
  } catch {
    return ""
  }
}

const base = getBasePath()
if (!base || base === "/") {
  console.log("[fix-gh-pages-assets] No base path needed. Skipping.")
  process.exit(0)
}

const buildDir = path.join(process.cwd(), "build")
if (!fs.existsSync(buildDir)) {
  console.log("[fix-gh-pages-assets] build/ not found. Run npm run build first.")
  process.exit(1)
}

const files = walk(buildDir).filter((f) => /\.(html|css|js|json|map|txt|xml)$/.test(f))

let changedFiles = 0
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8")
  let next = raw

  // "/assets/..." inside quotes
  next = next.replace(/(["'])\/assets\//g, `$1${base}/assets/`)

  // url(/assets/...)
  next = next.replace(/url\(\s*\/assets\//g, `url(${base}/assets/`)

  // url('/assets/...') or url("/assets/...")
  next = next.replace(/url\(\s*["']\/assets\//g, (m) => m.replace("/assets/", `${base}/assets/`))

  if (next !== raw) {
    fs.writeFileSync(file, next, "utf8")
    changedFiles++
  }
}

console.log(`[fix-gh-pages-assets] Base path: ${base}`)
console.log(`[fix-gh-pages-assets] Updated files: ${changedFiles}`)
