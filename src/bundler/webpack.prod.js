"use strict";
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.common.js');
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
module.exports = merge(commonConfiguration, {
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin()
    ]
});
