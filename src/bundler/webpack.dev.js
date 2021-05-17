"use strict";
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.common.js');
var ip = require('internal-ip');
var portFinderSync = require('portfinder-sync');
var infoColor = function (_message) {
    return "\u001B[1m\u001B[34m" + _message + "\u001B[39m\u001B[22m";
};
module.exports = merge(commonConfiguration, {
    mode: 'development',
    devServer: {
        host: '0.0.0.0',
        port: portFinderSync.getPort(8080),
        contentBase: './dist',
        watchContentBase: true,
        open: true,
        https: false,
        useLocalIp: true,
        disableHostCheck: true,
        overlay: true,
        noInfo: true,
        after: function (app, server, compiler) {
            var port = server.options.port;
            var https = server.options.https ? 's' : '';
            var localIp = ip.v4.sync();
            var domain1 = "http" + https + "://" + localIp + ":" + port;
            var domain2 = "http" + https + "://localhost:" + port;
            console.log("Project running at:\n  - " + infoColor(domain1) + "\n  - " + infoColor(domain2));
        }
    }
});
