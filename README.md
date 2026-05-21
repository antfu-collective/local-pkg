# local-pkg

[![NPM version](https://img.shields.io/npm/v/local-pkg?color=a1b858&label=)](https://www.npmjs.com/package/local-pkg)

Get information on local packages.

## Install

```bash
npm i local-pkg
```

## Usage

```ts
import {
  getPackageInfo,
  importModule,
  isPackageExists,
  resolveModule,
} from 'local-pkg'

isPackageExists('local-pkg') // true
isPackageExists('foo') // false

await getPackageInfo('local-pkg')
/* {
 *   name: "local-pkg",
 *   version: "0.1.0",
 *   rootPath: "/path/to/node_modules/local-pkg",
 *   packageJson: {
 *     ...
 *   }
 * }
 */

// similar to `require.resolve` but works in ESM
resolveModule('local-pkg')
// '/path/to/node_modules/local-pkg/dist/index.mjs'

const { importModule } = await importModule('local-pkg')
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg' alt="Sponsors"/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2021 [Anthony Fu](https://github.com/antfu)
