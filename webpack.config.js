const path = require("path");
const pathToPhaser = path.join(__dirname, "/node_modules/phaser/");
const phaser = path.join(pathToPhaser, "dist/phaser.js");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src/nononoyesgram.ts",
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "./index.html" }
            ]
        })
    ],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", exclude: "/node_modules/" },
            {
                test: /phaser\.js$/,
                loader: "expose-loader",
                options: { exposes: { globalName: "Phaser", override: true } },
            },
        ],
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./"),
        publicPath: "/dist/",
        host: "127.0.0.1",
        port: 8080,
        open: true,
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            phaser: phaser,
        },
    },
    performance: {
        maxEntrypointSize: 2048000,
        maxAssetSize: 2048000,
    },
};
