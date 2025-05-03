/* eslint-disable */
const path = require('path');

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  performance: {
    hints: false,
  },
  output: {
    filename: './[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'production',
};
