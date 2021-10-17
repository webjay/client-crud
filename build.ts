import { build, BuildOptions } from 'esbuild';

const options = {
  outdir: 'dist',
  platform: 'node',
  target: 'node14',
  bundle: true,
  minify: true,
  sourcemap: true,
};

void build({
  ...options,
  entryPoints: ['src/index.ts'],
} as BuildOptions);
