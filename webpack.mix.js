const mix = require('laravel-mix');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const rimraf = require('rimraf');

const glob = require('glob');
const fs = require('fs');
const { promisify } = require('util');
const ttf2woff2 = require('ttf2woff2');

const writeFileAsync = promisify(fs.writeFile);

const TerserPlugin = require('terser-webpack-plugin');
const UglifyJS = require('uglify-js');
const path = require('path');

rimraf.sync('D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-symbole\\compress');
rimraf.sync('D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\template-preview\\compress');
rimraf.sync('D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-schriften\\woff2');
rimraf.sync('D:\\OSPanel\\domains\\cadenis2.loc\\plugins\\goe_gravur_designer\\frontend\\js\\min');

mix.setPublicPath(''); // Clear publicPath

const jsFiles = [
    'D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js/canvas2image.js',
    'D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js/configurator.lib.js'
];

// shrink without changing variable names and structures
jsFiles.forEach(filePath => {
    const code = fs.readFileSync(filePath, 'utf8');
    const minifiedCode = UglifyJS.minify(code, {
        output: {
            comments: false
        }
    }).code;

    const fileName = path.basename(filePath, path.extname(filePath));
    const outputPath = `D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js/min/`;

    // ?????????, ?????????? ?? ??????????, ? ??????? ??, ???? ???
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(`${outputPath}${fileName}.min.js`, minifiedCode);
});

/*jsFiles.forEach(filePath => {
    const fileName = path.basename(filePath, path.extname(filePath));
    mix.js(filePath, `D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js/min/${fileName}.min.js`)
        .webpackConfig({
            optimization: {
                minimize: true,
                minimizer: [
                    new TerserPlugin({
                        terserOptions: {
                            output: {
                                comments: false, // ????????? ?????????? ????????????
                            },
                            mangle: false, // ????????? ?????? ? ????????? ???? ??????????
                        },
                    }),
                ],
            },
        });
});*/



// // optimization svg & png
// mix.webpackConfig({
//     module: {
//         rules: [
//             {
//                 test: /\.svg$/,
//                 use: [
//                     {
//                         loader: 'file-loader',
//                         options: {
//                             name: 'images/[name].[ext]',
//                         },
//                     },
//                 ],
//             },
//         ],
//     },
//     plugins: [
//         new ImageminPlugin({
//             test: /\.(jpe?g|png|gif|svg)$/i,
//             svgo: {
//                 plugins: [
//                     { removeViewBox: false }, // save viewBox, it important to SVG
//                 ],
//             },
//             pngquant: {
//                 quality: '65-90',
//                 speed: 4,
//             },
//         }),
//         new CopyWebpackPlugin({
//             patterns: [
//                 {
//                     from: 'D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-symbole',
//                     to: 'D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-symbole\\compress',
//                 },
//                 {
//                     from: 'D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\template-preview',
//                     to: 'D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\template-preview\\compress',
//                 }
//             ],
//         }),
//     ],
// })
//
// // TTF to WOFF2
// const ttfFiles = glob.sync('D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-schriften\\*.ttf');
// const woff2Files = [];
//
// ttfFiles.forEach((ttfFile) => {
//     const ttfContent = fs.readFileSync(ttfFile);
//     const woff2Buffer = ttf2woff2(ttfContent);
//
//     const woff2FileName = ttfFile.replace('.ttf', '.woff2');
//     woff2Files.push(woff2FileName);
//
//     writeFileAsync(woff2FileName, woff2Buffer)
//         .then(() => console.log(`Converted ${ttfFile} to ${woff2FileName}`))
//         .catch((error) => console.error(`Error converting ${ttfFile} to ${woff2FileName}: ${error}`));
// });
//
// mix.copy(woff2Files, 'D:\\OSPanel\\domains\\cadenis2.loc\\mediafiles\\gravur-schriften\\woff2');