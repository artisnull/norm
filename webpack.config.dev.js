const path = require('path')
module.exports = {
    entry: './src/index.js',
    mode: 'development',
    target: 'node',
    devtool: 'cheap-module-eval-source-map',
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