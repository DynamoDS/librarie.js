const webpack = require('webpack');
var InjectHtmlPlugin = require('inject-html-webpack-plugin')
var PROD = (process.env.NODE_ENV == 1);
let plugins = [];

if (PROD) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            mangle: {
                except: ["LibraryView"]
            }
        })
    )
};

plugins.push(
    new InjectHtmlPlugin({
        filename: "./index.html",
        customInject: [{
            start: "<!-- start:librarie inject -->",
            end: "<!-- end:librarie inject -->",
            content: PROD ? "<script src = './dist/librarie.min.js'></script>" : "<script src = './dist/librarie.js'></script>"
        }]
    })
);

module.exports = {
    entry: [
        "./src/LibraryUtilities.ts",
        "./src/LibraryView.tsx"
    ],
    target: "node",
    output: {
        filename: PROD ? "librarie.min.js" : "librarie.js",
        path: __dirname + "/dist",
        libraryTarget: "var",
        library: "LibraryEntryPoint"
    },
    plugins: plugins,

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        modules: [
            "node_modules"
        ],

        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: ["babel-loader", "awesome-typescript-loader"], // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader" // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
}
