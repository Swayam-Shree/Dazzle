const path = require("path");
const webpack = require("webpack");

module.exports = {
	mode: "development",
	entry: "./src/main.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
	},
	devtool: "source-map",
	devServer: {
		static: "./dist"
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
	resolve: {
		alias: {
			process: "process/browser"
		},
	}
};