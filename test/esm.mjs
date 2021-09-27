import { join } from 'path'
import { expect } from 'chai'
import { getPackageInfo, isPackageExists } from '../index.mjs'

console.warn('===== ESM =====')

expect(isPackageExists('mlly')).to.eq(true)
expect(isPackageExists('hi')).to.eq(false)
expect(isPackageExists('esno')).to.eq(true)

const info1 = await getPackageInfo('mlly')
expect(!!info1).to.eq(true)
expect(info1.name).to.eq('mlly')
expect(info1.packageJson.name).to.eq('mlly')

const info2 = await getPackageInfo('hi')
expect(!!info2).to.eq(false)

const info3 = await getPackageInfo('esno')
expect(!!info3).to.eq(true)
expect(info3.rootPath).to.contain(join('node_modules', 'esno'))
