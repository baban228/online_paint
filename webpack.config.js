const path = require('path');

module.exports = {
    entry: {
        main: './public/main.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/', // Важно для корректных путей к ассетам
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            // Добавляем правило для изображений
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset/resource', // Webpack 5+ (автоматически копирует файлы)
                generator: {
                    filename: 'images/[name][ext]', // Сохраняет в dist/images/
                },
            }
        ]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
            publicPath: '/'
        },
        compress: true,
        port: 9000,
        // Добавляем поддержку History API (если используете SPA)
        historyApiFallback: true,
    }
};