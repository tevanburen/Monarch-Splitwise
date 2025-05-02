const path = require('path');

module.exports = {
  entry: {
    widget: './src/widget/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'none',
};