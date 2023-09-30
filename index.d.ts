import { PackageJson } from 'pkg-types'

export * from './dist/shared'

export interface PackageInfo {
  name: string
  rootPath: string
  packageJsonPath: string
  version: string
  packageJson: PackageJson
}

export interface PackageResolvingOptions {
  paths?: string[]
}

export function isPackageExists(name: string, options?: PackageResolvingOptions): boolean

export function getPackageInfo(name: string, options?: PackageResolvingOptions): Promise<PackageInfo | undefined>

export function getPackageInfoSync(name: string, options?: PackageResolvingOptions): PackageInfo | undefined

export function resolveModule(path: string, options?: PackageResolvingOptions): string | undefined

export function importModule<T = any>(path: string): Promise<T>
