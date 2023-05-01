const path = require('path');
const env = process.env.NODE_ENV == "production" ? "production" : "development";

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  mode: env,
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};