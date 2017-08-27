/**
 * Created by htian on 5/25/2017.
 */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const html = require('html-webpack-plugin');
var cleanup = require('clean-webpack-plugin');
var cpy = require('copy-webpack-plugin');

module.exports = {
    entry:{
        index:'./src/index.js',
        evolution:'./src/evolution.jsx',
        test:'./test/index.js',
    },
    devtool: 'source-map',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'[name].[hash].js'
    },
    module: {
       
        loaders:[
        {
            test    : /\.jsx?$/,
            exclude : /node_modules/,
            loader  : 'babel-loader',
            query   : {
                 presets: ['react','es2015'] 
            }
        }, 
        {
            test   : /\.json$/,
            loader : 'json'
        },
        {
            test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader" // compiles Sass to CSS
            }]
        }
        ]
        
    },
    plugins:[
    new cleanup(['dist'],{
//        root:     __dirname,
        exclude:  [
            //'shared.js'
        ],
        verbose:  true,
        dry:      false
    }),
    new html({
        inject: true,
        title:'Mocha Test',
        filename:"test.html",
        template:'test-html/index.ejs',
        chunks:["test"]
    }),
    new html({
        inject: true,
        title:'React Tetris',
        template:'src/index.ejs',
        chunks:["index"]
    }),
    new html({
        inject: true,
        title:'AI Training',
        filename:"evolution.html",
        template:'src/index.ejs',
        chunks:["evolution"]
    }),
    new cpy([{
       from:'./test-html/mocha.*',
       to:'./mocha.[ext]' 
    }])
    ]
    
}