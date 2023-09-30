import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/shared',
  ],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  failOnWarn: false,
})
