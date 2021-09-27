import { join, dirname } from 'path'
import { promises as fs, existsSync } from 'fs'
import { createCommonJS } from 'mlly'

const { require } = createCommonJS(import.meta.url)

export function resolveModule(name, options) {
  try {
    return require.resolve(name, options)
  }
  catch (e) {
    return undefined
  }
}

export function importModule(path) {
  return import(path)
}

export function isPackageExists(name, options) {
  return !!resolvePackage(name, options)
}

export async function getPackageInfo(name, options) {
  const entry = resolvePackage(name, options)
  if (!entry)
    return

  const packageJsonPath = searchPackageJSON(entry)

  if (!packageJsonPath)
    return

  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

  return {
    name,
    version: pkg.version,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson: pkg,
  }
}

function resolvePackage(name, options = {}) {
  try {
    return require.resolve(`${name}/package.json`, options)
  }
  catch {
  }
  try {
    return require.resolve(name, options)
  }
  catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND')
      console.error(e)
    return false
  }
}

function searchPackageJSON(dir) {
  let packageJsonPath
  while (true) {
    if (!dir)
      return
    const newDir = dirname(dir)
    if (newDir === dir)
      return
    dir = newDir
    packageJsonPath = join(dir, 'package.json')
    if (existsSync(packageJsonPath))
      break
  }

  return packageJsonPath
}
