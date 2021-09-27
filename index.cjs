const { dirname, join } = require('path')
const { existsSync } = require('fs')
const fs = require('fs').promises

function resolvePackage(name, options = {}) {
  try {
    return require.resolve(`${name}/package.json`, options)
  }
  catch {
  }
  try {
    return require.resolve(name, options)
  }
  catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND')
      throw e
    return false
  }
}

function searchPackageJSON(dir) {
  let packageJsonPath
  while (true) {
    if (!dir)
      return
    const newDir = dirname(dir)
    if (newDir === dir)
      return
    dir = newDir
    packageJsonPath = join(dir, 'package.json')
    if (existsSync(packageJsonPath))
      break
  }

  return packageJsonPath
}

function isPackageExists(name, options = {}) {
  return !!resolvePackage(name, options)
}

async function getPackageInfo(name, options) {
  const entry = resolvePackage(name, options)
  if (!entry)
    return

  const packageJsonPath = searchPackageJSON(entry)

  if (!packageJsonPath)
    return

  const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))

  return {
    name,
    version: pkg.version,
    rootPath: dirname(packageJsonPath),
    packageJsonPath,
    packageJson: pkg,
  }
}

module.exports = {
  isPackageExists,
  getPackageInfo,
}
