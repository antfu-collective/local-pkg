import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import { findUp } from 'find-up'
import type { PackageJson } from 'pkg-types'

export async function loadPackageJSON(cwd = process.cwd()): Promise<PackageJson | null> {
  const path = await findUp('package.json', { cwd } as any)
  if (!path || !existsSync(path))
    return null
  return JSON.parse(await fs.readFile(path, 'utf-8'))
}

export async function isPackageListed(name: string, cwd?: string) {
  const pkg = await loadPackageJSON(cwd) || {}

  return (name in (pkg.dependencies || {})) || (name in (pkg.devDependencies || {}))
}
