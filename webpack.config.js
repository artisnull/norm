const path = require('path')
module.exports = {
    entry: './src/index.js',
    mode: 'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'norm',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {test: /\.js$/, use: 'babel-loader'}
        ]
    },
}