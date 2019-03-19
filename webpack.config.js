const path = require('path')
module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    target: 'node',
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