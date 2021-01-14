"use strict";
const webpack = require('webpack');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
let productionBuild = (process.env.NODE_ENV == "production");

module.exports = {
    entry: [
        "./src/LibraryUtilities.ts",
        "./src/entry-point.tsx"
    ],
    target: "node",
    output: {
        filename: productionBuild ? "librarie.min.js" : "librarie.js",
        path: __dirname + "/dist/",
        publicPath: "./dist",
        libraryTarget: "umd",
        library: "LibraryEntryPoint"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        modules: [
            "node_modules"
        ],

        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                parallel: true,
                sourceMap: true,
            }),
        ],
    },

    module: {
        rules: [
            {
                // Include all modules that pass test assertion
                // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                test: /\.tsx?$/,
                use: 'awesome-typescript-loader'  
            },
            {
                test: /\.js$/,
                enforce: "pre",
                use: 'source-map-loader' // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            },
            {
                test: /\.css$/,
                use: 'css-loader'
            },
            {
                test: /\.ttf|.otf|.eot|.woff|.svg|.png$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '/resources/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    }
}
