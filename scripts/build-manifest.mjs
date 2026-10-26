// Scans content/ and writes content/manifest.json.
//
// Layout: content/<group>/**/<name>.pdf  (groups = top-level folders).
// Run automatically before dev/build; also run by the CI that pushes PDFs.
// The site reads <base>/content/manifest.json at runtime.
import { readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'content')

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

const groups = new Map()
for await (const file of walk(root)) {
  if (path.extname(file).toLowerCase() !== '.pdf') continue
  const rel = path.relative(root, file).split(path.sep).join('/')
  const [group, ...rest] = rel.split('/')
  if (rest.length === 0) continue // ignore PDFs not inside a group folder
  const { size, mtime } = await stat(file)
  const list = groups.get(group) ?? []
  list.push({
    name: path.basename(file, path.extname(file)),
    path: rel, // relative to content/
    folder: rest.slice(0, -1).join('/'),
    size,
    modified: mtime.toISOString(),
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
