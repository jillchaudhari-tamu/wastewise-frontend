
const path = require('path');

module.exports = {
  // Suppress source map warnings from html5-qrcode
  ignoreWarnings: [
    {
      module: /html5-qrcode/,
      message: /Failed to parse source map/,
    },
  ],
  

  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          // Exclude html5-qrcode from source map processing
          path.resolve(__dirname, 'node_modules/html5-qrcode')
        ]
      }
    ]
  }
};