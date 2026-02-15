const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		context: __dirname,
		mode: isProduction ? 'production' : 'development',
		devtool: isProduction ? false : 'eval',

		entry: {
			'broccoli-field-htmm': './src/broccoli-field-htmm.js',
			'broccoli-field-htmm.css': './src/broccoli-field-htmm.css.scss',
			main: './tests/testdata/htdocs/index_files/main.src.js',
		},

		output: {
			path: __dirname,
			filename: (pathData) => {
				const name = pathData.chunk?.name;
				if (name === 'main') {
					return 'tests/testdata/htdocs/index_files/main.js';
				}
				return 'dist/[name].js';
			},
			publicPath: '/',
		},

		optimization: {
			splitChunks: false,
			runtimeChunk: false,
		},

		module: {
			rules: [
				// 1. 先頭: htmm の *.css?inline を CSS 文字列として渡す（style#htmm-styles 用）
				{
					test: /\.css$/,
					resourceQuery: /\?inline$/,
					type: 'asset/source',
					include: path.resolve(__dirname, 'node_modules/@tomk79/htmm'),
				},
				// 2. プロジェクトの SCSS/CSS（MiniCssExtractPlugin で 1 ファイルに）
				{
					test: /\.scss$/,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: [],
									hideNothingWarning: true,
								},
							},
						},
						{
							loader: 'sass-loader',
							options: {
								sassOptions: {
									precision: 8,
									outputStyle: 'expanded',
								},
							},
						},
					],
				},
				// 3. TypeScript/TSX（src + htmm）
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
					test: /\.twig$/,
					use: ['twig-loader'],
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
			],
		},

		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			alias: {
				react: path.resolve(__dirname, 'node_modules/react'),
				'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
			},
			fallback: {
				fs: false,
				path: false,
				crypto: false,
				stream: false,
				util: false,
			},
		},

		plugins: [
			new MiniCssExtractPlugin({
				filename: (pathData) => {
					const name = pathData.chunk?.name;
					if (name === 'broccoli-field-htmm.css') {
						return 'dist/broccoli-field-htmm.css';
					}
					return 'dist/[name].css';
				},
			}),
			new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 3 }),
			new CopyPlugin({
				patterns: [
					{
						from: 'vendor/broccoli-html-editor/broccoli-html-editor/client/dist/',
						to: 'tests/testdata/htdocs/libs/',
					},
				],
			}),
		],
	};
};
