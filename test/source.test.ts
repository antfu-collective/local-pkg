import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { getPackageInfo, getPackageInfoSync, importModule, isPackageExists, loadPackageJSON, resolveModule } from '../src'

it('test by source', async () => {
  expect(resolveModule('@antfu/utils')).to.contain(join('node_modules', '@antfu', 'utils'))

  expect(isPackageExists('unbuild')).to.eq(true)
  expect(isPackageExists('hi')).to.eql(false)
  expect(isPackageExists('esno')).to.eq(true)

  const info1 = await getPackageInfo('unbuild')
  expect(!!info1).to.eq(true)
  expect(info1?.name).to.eq('unbuild')
  expect(info1?.packageJson.name).to.eq('unbuild')
  expect(getPackageInfoSync('unbuild')).deep.eq(info1)

  const info2 = await getPackageInfo('hi')
  expect(!!info2).to.eq(false)

  const info3 = await getPackageInfo('esno')
  expect(!!info3).to.eq(true)
  expect(info3?.rootPath).to.contain(join('node_modules', 'esno'))

  const { slash } = (await importModule('@antfu/utils'))
  expect(slash('foo\\bar')).to.eq('foo/bar')

  expect(await loadPackageJSON()).to.eql(JSON.parse(await fs.readFile('./package.json', 'utf-8')))
})
