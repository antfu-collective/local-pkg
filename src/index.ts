import type { PackageJson } from 'pkg-types'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, win32 } from 'node:path'
import process from 'node:process'
import { findUp as _findUp, findUpSync } from 'find-up-simple'
import { interopDefault, resolvePathSync } from 'mlly'
import { quansyncMacro } from 'quansync'

export interface PackageInfo {
  name: string
  rootPath: string
  packageJsonPath: string
  version: string
  packageJson: PackageJson
}

export interface PackageResolvingOptions {
  paths?: string[]

  /**
   * @default 'auto'
   * Resolve path as posix or win32
   */
  platform?: 'posix' | 'win32' | 'auto'
}

function _resolve(path: string, options: PackageResolvingOptions = {}) {
  if (options.platform === 'auto' || !options.platform)
    options.platform = process.platform === 'win32' ? 'win32' : 'posix'

  if (process.versions.pnp) {
    const paths = options.paths || []
    if (paths.length === 0)
      paths.push(process.cwd())
    const targetRequire = createRequire(import.meta.url)
    try {
      return targetRequire.resolve(path, { paths })
    }
    catch {}
  }

  const modulePath = resolvePathSync(path, {
    url: options.paths,
  })
  if (options.platform === 'win32')
    return win32.normalize(modulePath)
  return modulePath
}

export function resolveModule(name: string, options: PackageResolvingOptions = {}) {
  try {
    return _resolve(name, options)
  }
  catch {
    return undefined
  }
}

export async function importModule<T = any>(path: string): Promise<T> {
  const i = await import(path)
  if (i)
    return interopDefault(i)
  return i
}

export function isPackageExists(name: string, options: PackageResolvingOptions = {}) {
  return !!resolvePackage(name, options)
}

function getPackageJsonPath(name: string, options: PackageResolvingOptions = {}) {
  const entry = resolvePackage(name, options)
  if (!entry)
    return

  return searchPackageJSON(entry)
}

const readFile = quansyncMacro({
  async: (id: string) => fs.promises.readFile(id, 'utf8'),
  sync: id => fs.readFileSync(id, 'utf8'),
})

export const getPackageInfo = quansyncMacro(async function (name: string, options: PackageResolvingOptions = {}) {
  const packageJsonPath = getPackageJsonPath(name, options)
  if (!packageJsonPath)
    return

  const packageJson: PackageJson = JSON.parse(await readFile(packageJsonPath))

  return {
    name,
    version: packageJson.version,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson,
  }
})

export const getPackageInfoSync = getPackageInfo.sync

function resolvePackage(name: string, options: PackageResolvingOptions = {}) {
  try {
    return _resolve(`${name}/package.json`, options)
  }
  catch {
  }
  try {
    return _resolve(name, options)
  }
  catch (e: any) {
    // compatible with nodejs and mlly error
    if (e.code !== 'MODULE_NOT_FOUND' && e.code !== 'ERR_MODULE_NOT_FOUND')
      console.error(e)
    return false
  }
}

function searchPackageJSON(dir: string) {
  let packageJsonPath
  while (true) {
    if (!dir)
      return
    const newDir = dirname(dir)
    if (newDir === dir)
      return
    dir = newDir
    packageJsonPath = join(dir, 'package.json')
    if (fs.existsSync(packageJsonPath))
      break
  }

  return packageJsonPath
}

const findUp = quansyncMacro({
  sync: findUpSync,
  async: _findUp,
})

export const loadPackageJSON = quansyncMacro(async function (cwd = process.cwd()): Promise<PackageJson | null> {
  const path = await findUp('package.json', { cwd })
  if (!path || !fs.existsSync(path))
    return null
  return JSON.parse(await readFile(path))
})
export const loadPackageJSONSync = loadPackageJSON.sync

export const isPackageListed = quansyncMacro(async function (name: string, cwd?: string) {
  const pkg = await loadPackageJSON(cwd) || {}

  return (name in (pkg.dependencies || {})) || (name in (pkg.devDependencies || {}))
})
export const isPackageListedSync = isPackageListed.sync
