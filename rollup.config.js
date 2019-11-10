import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import genHeader from './dev-lib/header';
import assets from 'postcss-assets';
import postcss from 'rollup-plugin-postcss';

// TypeScript because Babel transpiles modules in isolation, therefore no type reexports.
// CommonJS because Babel is not 100 % ESM.

const plugins = {
	nodeResolve: nodeResolve({
		extensions: ['.ts', '.js', '.json']
	}),
	typescript: typescript({
		tsconfig: 'tsconfig.code.json'
	}),
	commonjs: commonjs({
		namedExports: {
			'timsort': ['sort']
		}
	}),
	babel: babel({
		extensions: ['.ts', '.js'],
		runtimeHelpers: true
	}),
	minify: terser({
		output: {
			comments: (_node, { value }) => /@license/.test(value)
		}
	}),
	cssRaw: postcss({
		extract: 'dist/vis-network.css',
		inject: false,
		minimize: false,
		sourceMap: false,
		plugins: [
			assets({
				loadPaths: ["lib/assets/"]
			})
		]
	}),
	cssMin: postcss({
		extract: 'dist/vis-network.min.css',
		inject: false,
		minimize: true,
		sourceMap: false,
		plugins: [
			assets({
				loadPaths: ["lib/assets/"]
			})
		]
	})
}

export default [
	{
		input: 'lib/index-legacy-bundle.ts',
		output: [{
			file: 'dist/vis-network.esm.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		}, {
			file: 'dist/vis-network.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			extend: true,
			banner: genHeader('network'),
			sourcemap: true
		}],
		plugins: [
			plugins.commonjs,
			plugins.nodeResolve,
			plugins.cssRaw,
			plugins.typescript,
			plugins.babel
		]
	},
	{
		input: 'lib/index-legacy-bundle.ts',
		output: [{
			file: 'dist/vis-network.esm.min.js',
			format: 'esm',
			banner: genHeader('network'),
			sourcemap: true
		}, {
			file: 'dist/vis-network.min.js',
			format: 'umd',
			exports: 'named',
			name: 'vis',
			extend: true,
			banner: genHeader('network'),
			sourcemap: true
		}],
		plugins: [
			plugins.commonjs,
			plugins.nodeResolve,
			plugins.cssMin,
			plugins.typescript,
			plugins.babel,
			plugins.minify
		]
	}
]
