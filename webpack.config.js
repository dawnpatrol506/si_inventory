module.exports = {
    entry: {
        index: './src/index.js',
        reports: './src/reports.js'
    },
    
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    }
};