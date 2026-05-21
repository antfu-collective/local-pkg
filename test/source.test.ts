import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { getPackageInfo, getPackageInfoSync, importModule, isPackageExists, isPackageListed, isPackageListedSync, loadPackageJSON, loadPackageJSONSync, resolveModule } from '../src'

it('test by source', async () => {
  expect(resolveModule('@antfu/utils')).to.contain(join('node_modules', '@antfu', 'utils'))

  expect(isPackageExists('tsdown')).to.eq(true)
  expect(isPackageExists('hi')).to.eql(false)
  expect(isPackageExists('tsx')).to.eq(true)

  const info1 = await getPackageInfo('tsdown')
  expect(!!info1).to.eq(true)
  expect(info1?.name).to.eq('tsdown')
  expect(info1?.packageJson.name).to.eq('tsdown')
  expect(getPackageInfoSync('tsdown')).deep.eq(info1)

  const info2 = await getPackageInfo('hi')
  expect(!!info2).to.eq(false)

  const info3 = await getPackageInfo('tsx')
  expect(!!info3).to.eq(true)
  expect(info3?.rootPath).to.contain(join('node_modules', 'tsx'))

  const { slash } = (await importModule('@antfu/utils'))
  expect(slash('foo\\bar')).to.eq('foo/bar')

  const json = await loadPackageJSON()
  expect(json).to.eql(JSON.parse(await fs.readFile('./package.json', 'utf-8')))
  expect(loadPackageJSONSync()).deep.eq(json)

  expect(await isPackageListed('eslint')).eq(true)
  expect(isPackageListedSync('eslint')).eq(true)
})
