// Scans content/ and writes content/manifest.json.
//
// Layout: content/<group>/**/<name>.pdf  (groups = top-level folders).
// Optional: a metadata.json next to the PDF(s), { "title": "...", "description": "..." },
// is merged into each of that folder's files as `metadata` (copied there by the docs build CI).
// Run automatically before dev/build; also run by the CI that pushes PDFs.
// The site reads <base>/content/manifest.json at runtime.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'content')

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

// metadata.json of one folder -> { title?, description? } | undefined (cached per folder)
const metadataCache = new Map()
async function readMetadata(dir) {
  if (metadataCache.has(dir)) return metadataCache.get(dir)
  let metadata
  try {
    const json = JSON.parse(await readFile(path.join(dir, 'metadata.json'), 'utf8'))
    const pick = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
    const { title, description } = { title: pick(json.title), description: pick(json.description) }
    if (title || description) metadata = { ...(title && { title }), ...(description && { description }) }
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn(`metadata: ignoring ${path.join(dir, 'metadata.json')} (${error.message})`)
  }
  metadataCache.set(dir, metadata)
  return metadata
}

const groups = new Map()
for await (const file of walk(root)) {
  if (path.extname(file).toLowerCase() !== '.pdf') continue
  const rel = path.relative(root, file).split(path.sep).join('/')
  const [group, ...rest] = rel.split('/')
  if (rest.length === 0) continue // ignore PDFs not inside a group folder
  const { size, mtime } = await stat(file)
  const list = groups.get(group) ?? []
  const metadata = await readMetadata(path.dirname(file))
  list.push({
    name: path.basename(file, path.extname(file)),
    path: rel, // relative to content/
    folder: rest.slice(0, -1).join('/'),
    size,
    modified: mtime.toISOString(),
    ...(metadata && { metadata }),
  })
  groups.set(group, list)
}

const manifest = {
  groups: [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, files]) => ({
      id,
      files: files.sort((a, b) => a.path.localeCompare(b.path)),
    })),
}

await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`manifest: ${manifest.groups.length} groups, ${[...groups.values()].flat().length} pdfs`)
