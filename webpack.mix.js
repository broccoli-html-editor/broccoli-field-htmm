const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

const path = require('path');

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test:/\.twig$/,
					use:['twig-loader']
				},
				{
					test: /\.csv$/i,
					loader: 'csv-loader',
					options: {
						dynamicTyping: true,
						header: false,
						skipEmptyLines: false,
					},
				},
				{
					test: /\.tsx?$/,
					use: {
						loader: 'ts-loader',
						options: {
							allowTsInNodeModules: true,
							transpileOnly: true,
							compilerOptions: {
								jsx: 'react-jsx',
								module: 'ESNext',
								moduleResolution: 'node',
								noEmit: false,
							},
						},
					},
					include: [
						path.resolve(__dirname, 'src'),
						path.resolve(__dirname, 'node_modules/@tomk79/htmm'),
					],
					exclude: /node_modules\/@tomk79\/htmm\/node_modules/,
				},
				{
					test: /\.css$/,
					resourceQuery: /\?inline$/,
					type: 'asset/source',
					include: path.resolve(__dirname, 'node_modules/@tomk79/htmm'),
				},
			]
		},
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				'react': path.resolve(__dirname, 'node_modules/react'),
				'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
			},
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": false,
			}
		},
	})


	// --------------------------------------
	// broccoli-field-htmm
	.js('src/broccoli-field-htmm.js', 'dist/')
	.sass('src/broccoli-field-htmm.css.scss', 'dist/broccoli-field-htmm.css')

	// --------------------------------------
	// Test contents
	.js('tests/testdata/htdocs/index_files/main.src.js', 'tests/testdata/htdocs/index_files/main.js')

	// --------------------------------------
	// Static libs
	.copyDirectory('vendor/broccoli-html-editor/broccoli-html-editor/client/dist/', 'tests/testdata/htdocs/libs/')
;

// dist/ に broccoli-field-htmm.js のみ出力するため、別チャンク（332.js, 354.js）を出さない
mix.webpackConfig((webpack) => ({
	optimization: {
		splitChunks: false,
		runtimeChunk: false,
	},
	plugins: [new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 2 })],
}));
