/**
 * GlassesJS — Build script
 *
 * Generates:
 * - dist/glassesjs.esm.js              (ES module — lightweight)
 * - dist/glassesjs.cjs.js              (CommonJS — lightweight)
 * - dist/glassesjs.min.js              (UMD minified — lightweight, for CDN)
 * - dist/glassesjs.standalone.esm.js   (ES module — standalone with MediaPipe)
 * - dist/glassesjs.standalone.cjs.js   (CommonJS — standalone with MediaPipe)
 * - dist/glassesjs.standalone.min.js   (UMD minified — standalone, for CDN)
 */

const esbuild = require('esbuild');
const path = require('path');

const mainEntry = path.resolve(__dirname, '../dist/index.js');
const standaloneEntry = path.resolve(__dirname, '../dist/standalone.js');

/** Shared config for all builds */
const shared = {
  target: 'es2020',
  sourcemap: true,
  // MediaPipe is a peer/dynamic dependency, mark as external
  external: ['@mediapipe/tasks-vision'],
};

async function build() {
  // ─── Lightweight (core) bundles ──────────────────────────────────

  await esbuild.build({
    ...shared,
    entryPoints: [mainEntry],
    bundle: true,
    format: 'esm',
    outfile: 'dist/glassesjs.esm.js',
  });
  console.log('✓ dist/glassesjs.esm.js');

  await esbuild.build({
    ...shared,
    entryPoints: [mainEntry],
    bundle: true,
    format: 'cjs',
    outfile: 'dist/glassesjs.cjs.js',
  });
  console.log('✓ dist/glassesjs.cjs.js');

  await esbuild.build({
    ...shared,
    entryPoints: [mainEntry],
    bundle: true,
    format: 'iife',
    globalName: 'GlassesJS',
    outfile: 'dist/glassesjs.min.js',
    minify: true,
  });
  console.log('✓ dist/glassesjs.min.js');

  // ─── Standalone bundles ──────────────────────────────────────────

  await esbuild.build({
    ...shared,
    entryPoints: [standaloneEntry],
    bundle: true,
    format: 'esm',
    outfile: 'dist/glassesjs.standalone.esm.js',
  });
  console.log('✓ dist/glassesjs.standalone.esm.js');

  await esbuild.build({
    ...shared,
    entryPoints: [standaloneEntry],
    bundle: true,
    format: 'cjs',
    outfile: 'dist/glassesjs.standalone.cjs.js',
  });
  console.log('✓ dist/glassesjs.standalone.cjs.js');

  await esbuild.build({
    ...shared,
    entryPoints: [standaloneEntry],
    bundle: true,
    format: 'iife',
    globalName: 'GlassesJSStandalone',
    outfile: 'dist/glassesjs.standalone.min.js',
    minify: true,
  });
  console.log('✓ dist/glassesjs.standalone.min.js');

  console.log('\nBuild complete!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
