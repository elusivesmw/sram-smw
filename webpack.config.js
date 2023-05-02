const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var config = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
    plugins: [
        new MiniCssExtractPlugin({
          filename: "../css/style.css",
          chunkFilename: "[id].css"
        })
    ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

module.exports = (env, argv) => {
  // run:
  // npx webpack --env prod
  // for release

  if (!env.prod) {
    config.mode = "development"
    config.devtool = 'eval';
  }
  else { // production
    config.mode = "production";
    config.devtool = 'source-map';
  }
  console.log(config.mode); 

  return config;
};