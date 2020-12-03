import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';

type Configuration = webpack.Configuration & {
	devServer: webpackDevServer.Configuration;
};

const config: Configuration = {
	devtool: 'source-map',
	devServer: {
		contentBase: path.resolve(__dirname, './public/'),
		open: true,
		publicPath: '/dist/',
		watchContentBase: true,
	},
	entry: path.resolve(__dirname, './src/index.ts'),
	module: {
		rules: [
			{
				test: /\.wasm$/i,
				type: 'javascript/auto',
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			{
				exclude: /node_modules/,
				test: /\.tsx?$/,
				use: 'ts-loader',
			},
		],
	},
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, './public/dist'),
	},
	resolve: {
		alias: {
			'@lib': path.resolve(__dirname, '../lib'),
		},
		extensions: ['.tsx', '.ts', '.js'],
	},
};

export default config;
