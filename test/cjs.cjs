const { join } = require('node:path')
const { getPackageInfo, isPackageExists, resolveModule, importModule, loadPackageJSON, getPackageInfoSync, loadPackageJSONSync, isPackageListed, isPackageListedSync } = require('../dist/index.cjs')
const pkgJSON = require('../package.json')

console.warn('===== CJS =====')

async function run() {
  const { expect } = await import('chai')

  expect(resolveModule('@antfu/utils')).to.contain(join('node_modules', '@antfu', 'utils'))

  expect(isPackageExists('unbuild')).to.eq(true)
  expect(isPackageExists('hi')).to.eq(false)
  expect(isPackageExists('esno')).to.eq(true)

  const info1 = await getPackageInfo('unbuild')
  expect(!!info1).to.eq(true)
  expect(info1.name).to.eq('unbuild')
  expect(info1.packageJson.name).to.eq('unbuild')
  expect(getPackageInfoSync('unbuild')).deep.eq(info1)

  const info2 = await getPackageInfo('hi')
  expect(!!info2).to.eq(false)

  const info3 = await getPackageInfo('esno')
  expect(!!info3).to.eq(true)
  expect(info3.rootPath).to.contain(join('node_modules', 'esno'))

  const { slash } = await (importModule('@antfu/utils'))
  expect(slash('foo\\bar')).to.eq('foo/bar')

  expect(await loadPackageJSON()).to.eql(pkgJSON)
  expect(loadPackageJSONSync()).deep.eq(pkgJSON)

  expect(await isPackageListed('eslint')).eq(true)
  expect(isPackageListedSync('eslint')).eq(true)
}

run()
