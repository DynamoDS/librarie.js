const webpack = require('webpack');
var productionBuild = (process.env.production_build == 1);
let version = "v0.0.1";
let plugins = [];

if (productionBuild) {
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

module.exports = {
    entry: [
        "./src/LibraryUtilities.ts",
        "./src/LibraryView.tsx"
    ],
    target: "node",
    output: {
        filename: productionBuild ? "librarie.min.js" : "librarie.js",
        path: __dirname + "/dist/" + version + "/",
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
