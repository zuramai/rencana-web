// Run after `nuxt generate`: injects a hash-based Content-Security-Policy meta tag into every HTML file.
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const apiBase = process.env.NUXT_PUBLIC_API_BASE
if (!apiBase) {
  console.error('csp: NUXT_PUBLIC_API_BASE must be set')
  process.exit(1)
}
const api = new URL(apiBase).origin
const root = new URL('../.output/public', import.meta.url).pathname

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* htmlFiles(path)
    else if (entry.name.endsWith('.html')) yield path
  }
}

const inlineScript = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi

let count = 0
for await (const file of htmlFiles(root)) {
  const html = await readFile(file, 'utf8')
  const hashes = new Set()
  for (const [, attrs, body] of html.matchAll(inlineScript)) {
    if (/\bsrc\s*=/.test(attrs) || !body) continue
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }
  const policy = [
    `default-src 'self'`,
    `script-src 'self' ${[...hashes].join(' ')}`.trim(),
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${api} https://*.googleusercontent.com`,
    `font-src 'self' data:`,
    `connect-src 'self' ${api}`,
    `object-src 'none'`,
    `base-uri 'none'`,
    `form-action 'self' ${api}`,
    `frame-src 'none'`
  ].join('; ')
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`
  const out = html.replace(/<head([^>]*)>/i, m => `${m}${meta}`)
  if (out === html) throw new Error(`csp: no <head> in ${file}`)
  await writeFile(file, out)
  count++
}
console.log(`csp: injected into ${count} file(s)`)
