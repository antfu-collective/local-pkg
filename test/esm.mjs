import { join } from 'path'
import { promises as fs } from 'fs'
import { expect } from 'chai'
import { getPackageInfo, isPackageExists, resolveModule, importModule, loadPackageJSON } from '../index.mjs'

console.warn('===== ESM =====')

async function run() {
  expect(resolveModule('@antfu/utils')).to.contain(join('node_modules', '@antfu', 'utils'))

  expect(isPackageExists('tsup')).to.eq(true)
  expect(isPackageExists('hi')).to.eq(false)
  expect(isPackageExists('esno')).to.eq(true)

  const info1 = await getPackageInfo('tsup')
  expect(!!info1).to.eq(true)
  expect(info1.name).to.eq('tsup')
  expect(info1.packageJson.name).to.eq('tsup')

  const info2 = await getPackageInfo('hi')
  expect(!!info2).to.eq(false)

  const info3 = await getPackageInfo('esno')
  expect(!!info3).to.eq(true)
  expect(info3.rootPath).to.contain(join('node_modules', 'esno'))

  const { slash } = (await importModule('@antfu/utils'))
  expect(slash('foo\\bar')).to.eq('foo/bar')

  expect(await loadPackageJSON()).to.eql(JSON.parse(await fs.readFile('./package.json'), 'utf-8'))
}

run()
