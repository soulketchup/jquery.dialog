const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const glob = require('glob');

module.exports = {
	mode: 'production',
	entry: {
		//'jquery.dialog.date': glob.sync('./src/jquery.dialog.date.*')
		'jquery.dialog.date': './src/jquery.dialog.date.js',
		'jquery.dialog.date.ko-KR': './src/jquery.dialog.date.ko-KR.js'
	},
	output: {
		filename: '[name].min.js',
		path: __dirname + '/dist'
	},
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true // set to true if you want JS source maps
	  		}),
			new OptimizeCSSAssetsPlugin({})
		]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				// use: {
				// 	loader: 'babel-loader'
				// }
			},
			{
				test: /\.css$/,
				use: [{
					loader: MiniCssExtractPlugin.loader,
					options: {
						
					}
				}, "css-loader"]
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].min.css"
		})
	]
};