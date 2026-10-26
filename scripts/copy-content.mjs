// Copies content/ (manifest + PDFs) into dist/content/ after the Vite build.
import { cp } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
await cp(path.join(root, 'content'), path.join(root, 'dist', 'content'), { recursive: true })
