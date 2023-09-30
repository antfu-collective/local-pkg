import { dirname, join, win32 } from 'node:path'
import fs from 'node:fs'
import { interopDefault, resolvePathSync } from 'mlly'
import type { PackageJson } from 'pkg-types'

export * from './shared'
export interface PackageInfo {
  name: string
  rootPath: string
  packageJsonPath: string
  version: string
  packageJson: PackageJson
}

export interface PackageResolvingOptions {
  paths?: string[]
  platform?: 'posix' | 'win32' | 'auto'
}

function _resolve(path: string, options: PackageResolvingOptions = {}) {
  if (options.platform === 'auto' || !options.platform)
    // eslint-disable-next-line n/prefer-global/process
    options.platform = process.platform === 'win32' ? 'win32' : 'posix'

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
  catch (e) {
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

export async function getPackageInfo(name: string, options: PackageResolvingOptions = {}) {
  const packageJsonPath = getPackageJsonPath(name, options)
  if (!packageJsonPath)
    return

  const packageJson: PackageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'))

  return {
    name,
    version: packageJson.version,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson,
  }
}

export function getPackageInfoSync(name: string, options: PackageResolvingOptions = {}) {
  const packageJsonPath = getPackageJsonPath(name, options)
  if (!packageJsonPath)
    return

  const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  return {
    name,
    version: packageJson.version,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson,
  }
}

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
