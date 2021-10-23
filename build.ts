import { build, BuildOptions } from 'esbuild';

const options = {
  outdir: 'dist',
  platform: 'node',
  target: 'node14',
  bundle: true,
  minify: true,
  sourcemap: false,
};

void build({
  ...options,
  entryPoints: ['src/index.ts'],
} as BuildOptions);
