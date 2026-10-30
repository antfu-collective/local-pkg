import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { getPackageInfo, isPackageExists } from '../src'

const tmpDirs: string[] = []

afterEach(() => {
  for (const dir of tmpDirs.splice(0))
    fs.rmSync(dir, { recursive: true, force: true })
})

it('resolvePackage treats ENOTDIR as not-found without logging', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'local-pkg-enotdir-'))
  tmpDirs.push(tmp)
  // Point paths at a regular file so resolution hits ENOTDIR while walking
  const filePath = path.join(tmp, 'notafile.js')
  fs.writeFileSync(filePath, 'export {}')

  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(isPackageExists('does-not-exist-xyz', { paths: [filePath] })).toBe(false)
  expect(await getPackageInfo('does-not-exist-xyz', { paths: [filePath] })).toBeUndefined()

  expect(spy).not.toHaveBeenCalled()
  spy.mockRestore()
})
