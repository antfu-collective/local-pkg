import fs from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { resolvePathSync } from 'mlly'
import { afterAll, beforeEach, expect, it, vi } from 'vitest'
import { getPackageInfoSync, isPackageExists } from '../src'

vi.mock('mlly', async (importOriginal) => {
  const mlly = await importOriginal<typeof import('mlly')>()
  return { ...mlly, resolvePathSync: vi.fn(mlly.resolvePathSync) }
})

const tmp = fs.mkdtempSync(join(os.tmpdir(), 'local-pkg-'))
// One path per layer, as Nuxt modules pass them. They don't need to exist.
const layers = Array.from({ length: 23 }, (_, i) => join(tmp, 'layers', `layer-${i}`))

const app = join(tmp, 'app')
const foo = join(app, 'node_modules', 'foo')
fs.mkdirSync(foo, { recursive: true })
fs.writeFileSync(join(foo, 'package.json'), '{"name":"foo","main":"index.js"}')
fs.writeFileSync(join(foo, 'index.js'), 'module.exports = 1')

beforeEach(() => {
  vi.mocked(resolvePathSync).mockClear()
})

afterAll(() => {
  fs.rmSync(tmp, { recursive: true, force: true })
})

it('answers a missing package without calling mlly', () => {
  expect(isPackageExists('local-pkg-missing', { paths: layers })).toBe(false)
  expect(isPackageExists('@local-pkg/missing', { paths: layers })).toBe(false)
  expect(getPackageInfoSync('local-pkg-missing', { paths: layers })).toBeUndefined()
  expect(resolvePathSync).not.toHaveBeenCalled()
})

it('resolves other names as before', () => {
  const paths = [...layers, process.cwd()]
  expect(isPackageExists('mlly', { paths })).toBe(true)
  expect(getPackageInfoSync('mlly', { paths })?.rootPath).toContain(join('node_modules', 'mlly'))
  expect(isPackageExists('fs', { paths })).toBe(true)
  // self-reference
  expect(isPackageExists('local-pkg', { paths })).toBe(true)
  // mlly does not export ./package.json
  expect(isPackageExists('mlly/package.json', { paths })).toBe(false)
  expect(resolvePathSync).toHaveBeenCalled()
})

it.each(['.mjs', '.cjs', '.js', '.json'])('finds a package installed as the name plus %s', (ext) => {
  // mlly also tries the name plus each extension as a specifier
  const dir = join(tmp, `ext${ext}`)
  const pkg = join(dir, 'node_modules', `ext-variant${ext}`)
  fs.mkdirSync(pkg, { recursive: true })
  fs.writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: `ext-variant${ext}`, main: 'index.js' }))
  fs.writeFileSync(join(pkg, 'index.js'), 'module.exports = 1')
  expect(isPackageExists('ext-variant', { paths: [dir] })).toBe(true)
})

it.each([`${app}\\layer`, pathToFileURL(app)])('reads %s as mlly does', (path) => {
  // mlly turns backslashes into slashes and accepts URL objects
  const options = { paths: [path] as unknown as string[] }
  expect(isPackageExists('foo', options)).toBe(true)
  expect(getPackageInfoSync('foo', options)?.rootPath).toContain(join('node_modules', 'foo'))
  expect(isPackageExists('local-pkg-missing', options)).toBe(false)
})

it('reads the working directory as mlly does when there are no paths', () => {
  vi.spyOn(process, 'cwd').mockReturnValue(`${app}\\layer`)
  try {
    expect(isPackageExists('foo')).toBe(true)
  }
  finally {
    vi.mocked(process.cwd).mockRestore()
  }
})

it('lets mlly decide when an ancestor package.json is unreadable', () => {
  const dir = join(tmp, 'broken-package-json')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(join(dir, 'package.json'), '{')
  expect(isPackageExists('local-pkg-missing', { paths: [dir] })).toBe(false)
  expect(resolvePathSync).toHaveBeenCalled()
})
