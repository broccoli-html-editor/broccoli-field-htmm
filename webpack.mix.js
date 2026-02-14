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
			]
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": false,
			}
		}
	})


	// --------------------------------------
	// table-tag-editor
	.js('src/broccoli-field-htmm.js', 'dist/')
	.sass('src/broccoli-field-htmm.css.scss', 'dist/broccoli-field-htmm.css')

	// --------------------------------------
	// Test contents
	.js('tests/testdata/htdocs/index_files/main.src.js', 'tests/testdata/htdocs/index_files/main.js')

	// --------------------------------------
	// Static libs
	.copyDirectory('vendor/broccoli-html-editor/broccoli-html-editor/client/dist/', 'tests/testdata/htdocs/libs/')
;
