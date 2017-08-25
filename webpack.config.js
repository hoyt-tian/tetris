/**
 * Created by htian on 5/25/2017.
 */

const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
const html = require('html-webpack-plugin');
var cleanup = require('clean-webpack-plugin');
var cpy = require('copy-webpack-plugin');

module.exports = {
    entry:'./src/game.jsx',
    devtool: 'source-map',
    output:{
        path:path.resolve(__dirname,'dist'),
        filename:'index.[hash].js'
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
        title:'',
        template:'src/index.ejs'
    })
    ]
    
}