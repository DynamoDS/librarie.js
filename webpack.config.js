const webpack = require('webpack');
let productionBuild = (process.env.NODE_ENV == "production");
let version = "v0.0.1";
let plugins = [];

plugins.push(
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'global': {}
    })
);

if (productionBuild) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true, 
            mangle: {
                except: ["LibraryView", "on"]
            }
        })
    );
}

module.exports = {
    entry: [
        "./src/LibraryUtilities.ts",
        "./src/LibraryView.tsx"
    ],
    target: "node",
    output: {
        filename: productionBuild ? "librarie.min.js" : "librarie.js",
        path: __dirname + "/dist/" + version + "/",
        publicPath: "./dist/" + version,
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
                loader: ["awesome-typescript-loader"] // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            },
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader" // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            },
            {
                test: /\.css$/,
                loader: ["style-loader", "css-loader"]
            },
            {
                test: /\.ttf$/,
                loader: "file-loader",
                options: {
                    name: '/resources/[name].[ext]'
                }
            }
        ]
    }
}
