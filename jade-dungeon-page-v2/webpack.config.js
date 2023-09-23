const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

let env = process.env.NODE_ENV;
if (env === "dev" || env === "development") {
    env = "development";
} else {
    env = "production";
}

module.exports = {
    mode: env, // "development" for dev and "production" for release
    entry: "./src/scripts/app.tsx",
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "main.js",
        clean: true
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: ['ts-loader']
        },{ 
			enforce: "pre", test: /\.js$/, loader: "source-map-loader" 
		},{
            test: /\.css$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        },{
            test: /\.less$/,
            exclude: /node_modules/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
        },{
            test: /favicon\.ico$/,
            exclude: /node_modules/,
            type: "asset/resource",
            generator: { filename: "static/images/favicon.ico" }
        },{
            test: /\.(png|jpe?g|gif|svg|webp)$/,
            exclude: /node_modules/,
            type: "asset/resource",
            generator: { filename: "static/images/[hash][ext][query]" }
        },{
            test: /\.(ttf|woff|woff2)$/,
            exclude: /node_modules/,
            type: "asset/resource",
            generator: { filename: "static/fonts/[hash][ext][query]" }
        }]
    },
    plugins: [
        new CssMinimizerPlugin(), // compress js where mode = production
        new MiniCssExtractPlugin({ // concat js
            filename: 'static/css/app.css'
        }),
        new HtmlWebpackPlugin({ // generate dist/index.html by template
            template: path.resolve(__dirname + '/src/templets/', 'index.html'),
			favicon : path.resolve(__dirname + '/static/images/', 'favicon.ico')
        })
    ],
    devtool: "source-map",
    devServer: {  // auto compile and run http server
        host: "localhost",
        port: 8000,
        open: true
    }
}
