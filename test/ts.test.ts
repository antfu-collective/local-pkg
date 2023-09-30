import { join } from 'path'
import { existsSync, promises as fs } from 'fs'
import { expect, test } from 'vitest'
import { getPackageInfo, importModule, isPackageExists, loadPackageJSON, resolveModule } from '../src/index'

test('test by typescript', async () => {
  expect(existsSync('/Users/chizuki/Documents/forks/local-pkg/node_modules/.pnpm/unbuild@2.0.0_typescript@5.1.6/node_modules/unbuild/package.json')).toBe(true)

  expect(resolveModule('@antfu/utils')).to.contain(join('node_modules', '@antfu', 'utils'))

  expect(isPackageExists('unbuild')).to.eq(true)
  expect(isPackageExists('hi')).to.eql(false)
  expect(isPackageExists('esno')).to.eq(true)

  const info1 = await getPackageInfo('unbuild')
  expect(!!info1).to.eq(true)
  expect(info1?.name).to.eq('unbuild')
  expect(info1?.packageJson.name).to.eq('unbuild')

  const info2 = await getPackageInfo('hi')
  expect(!!info2).to.eq(false)

  const info3 = await getPackageInfo('esno')
  expect(!!info3).to.eq(true)
  expect(info3?.rootPath).to.contain(join('node_modules', 'esno'))

  const { slash } = (await importModule('@antfu/utils'))
  expect(slash('foo\\bar')).to.eq('foo/bar')

  expect(await loadPackageJSON()).to.eql(JSON.parse(await fs.readFile('./package.json', 'utf-8')))
})
