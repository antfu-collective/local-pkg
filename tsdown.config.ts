import { defineConfig } from 'tsdown'
import Quansync from 'unplugin-quansync/rolldown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
  exports: true,
  plugins: [Quansync()],
  deps: {
    onlyBundle: ['find-up-simple'],
  },
})
