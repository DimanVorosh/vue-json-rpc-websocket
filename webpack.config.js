const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/wsMain.js',
  output: {
    path: path.resolve('dist'),
    library: 'Vue-JSONRPC-WS',
    libraryTarget: 'umd',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.js']
  }
}