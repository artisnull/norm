const path = require('path')
module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    target: 'node',
    devtool: 'cheap-module-eval-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: 'norm',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {test: /\.(t|j)s$/, use: 'babel-loader'}
        ]
    },
}