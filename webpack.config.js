const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FlowWebpackPlugin = require('flow-webpack-plugin');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
  entry: {
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    overlay: path.join(__dirname, 'src', 'js', 'overlay.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'remove-flow-types-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/,
      },
      {
        test: new RegExp(`\.(${fileExtensions.join('|')})$`),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'file-loader?name=[name].[ext]!extract-loader!html-loader',
      },
    ],
  },
  resolve: {},
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([{
      from: 'src/manifest.json',
      transform: (content) => (
        Buffer.from(JSON.stringify({
          name: process.env.npm_package_name,
          description: process.env.npm_package_description,
          version: process.env.npm_package_version,
          ...JSON.parse(content.toString()),
        }))
      ),
    }]),
    new FlowWebpackPlugin(),
  ],
};

module.exports = options;
