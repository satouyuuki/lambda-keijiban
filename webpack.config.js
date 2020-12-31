const path = require('path');
const isDevelopment = process.env.WEBPACK_ENV === 'development';
// const glob = require("glob");
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
// const authJS = glob.sync("./static/auth/js/*.js");
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: process.env.WEBPACK_ENV,
  devtool: isDevelopment ? 'source-map' : false,
  // エントリーポイントの設定
  entry: {
    'public/main': './static/public/js/main.js',
    'public/detail': './static/public/js/detail.js',
    'auth/main': './static/auth/js/main.js',
    'auth/login': './static/auth/js/login.js',
  },
  // 出力の設定
  output: {
    path: path.resolve('dist'),
    filename: './[name]/bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ['public/main'],
      filename: './public/index.html',
      template: './static/public/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ['public/detail'],
      filename: './public/detail.html',
      template: './static/public/detail.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ['auth/main'],
      filename: './auth/index.html',
      template: './static/auth/index.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      chunks: ['auth/login'],
      filename: './auth/login.html',
      template: './static/auth/login.html'
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist/public')
  },
  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};