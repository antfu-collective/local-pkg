import { defineBuildConfig } from 'unbuild'
import Quansync from 'unplugin-quansync/rollup'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  failOnWarn: false,
  hooks: {
    'rollup:options': function (context, options) {
      options.plugins.push(Quansync())
    },
  },
})
