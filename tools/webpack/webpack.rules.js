const { inDev } = require('./webpack.helpers');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  {
    // Typescript loader
    test: /\.(t|j)sx?$/i,
    exclude: /(node_modules|\.webpack)/,
    use: {
	    loader : 'babel-loader' ,
	    options : {
		    presets: [
			    [
				    "@babel/preset-env",
				    {
					    modules: false,
				    },
			    ],
			    [
				    "@babel/preset-react",
				    {
					    runtime: "automatic",
				    },
			    ],
			    "@babel/preset-typescript",
		    ],
		    plugins: [
			    [
				    "@babel/plugin-proposal-decorators",
				    {
					    legacy: true,
				    },
			    ],
			    "@babel/plugin-proposal-do-expressions",
			    "@babel/plugin-proposal-duplicate-named-capturing-groups-regex",
			    "@babel/plugin-proposal-export-default-from",
			    "@babel/plugin-proposal-function-bind",
			    "@babel/plugin-proposal-throw-expressions",
		    ],
	    }
    } ,
  },
  {
    // CSS Loader
    test: /\.css$/,
    use: [
      { loader: inDev() ? 'style-loader' : MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
    ],
  },
  {
    // Less loader
    test: /\.less$/,
    use: [
      { loader: inDev() ? 'style-loader' : MiniCssExtractPlugin.loader },
      { loader: 'css-loader' },
      { loader: 'less-loader' },
    ],
  },
  {
    // Assets loader
    // More information here https://webpack.js.org/guides/asset-modules/
    test: /\.(gif|jpe?g|tiff|png|webp|bmp|svg|eot|ttf|woff|woff2)$/i,
    type: 'asset',
    generator: {
      filename: 'assets/[hash][ext][query]',
    },
  },
];
