const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        vendor: [
            'underscore',
            'core-js/es6',
            'core-js/es7/reflect',
            'zone.js/dist/zone',
            'rxjs/Observable',
            'rxjs/Subject',
            'rxjs/BehaviorSubject',
            'rxjs/add/operator/toPromise',
            '@angular/core',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/http',
            '@angular/forms',
            'bootstrap/dist/css/bootstrap.css',
            'font-awesome/css/font-awesome.css'
        ],
        app: './src/app.module',
        index: './src/index',
        specs: './src/specs'
    },
    devtool: productionValue(false, 'source-map'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: productionValue('[name].[hash].js', '[name].js') // See https://webpack.js.org/guides/caching/
    },
    module: {
        rules: [{ 
            oneOf: [{
                // See https://github.com/gajus/to-string-loader#use-case
                test: /\.component\.css$/, use: ['to-string-loader', 'css-loader']
            }, { 
                test: /\.css$/, use: ['style-loader', 'css-loader']
            }]
        }, { 
            test: /\.html$/, use: ['raw-loader']
        }, { 
            test: /\.(eot|woff|woff2|ttf|svg)(\?\S*)?$/, use: ['file-loader'] 
        }]
    },
    plugins: [
        // Workaround for https://github.com/angular/angular/issues/11580
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.resolve(__dirname, 'src')
        ),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['app', 'vendor'],
            minChunks: Infinity
        }),
        productionValue(new webpack.optimize.UglifyJsPlugin({ comments: false }), new NoopPlugin()),
        new webpack.DefinePlugin({
            IS_PRODUCTION_BUILD: productionValue('true', 'false')
        }),
        new HtmlWebpackPlugin({
            template: './src/index.html', 
            filename: 'index.html',
            chunks: ['index', 'app', 'vendor'],
            inject: 'body'
        }),
        new HtmlWebpackPlugin({
            filename: 'specs.html',
            chunks: ['specs', 'app', 'vendor']
        })
    ],
    devServer: {
        publicPath: '/',
        inline: false
    }
}

function productionValue(prod, other) {
    return process.env.NODE_ENV === 'production' ? prod : other    
}

function NoopPlugin() {
    this.apply = function() {}
}
