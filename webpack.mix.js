const mix               = require('laravel-mix');
const ImageminPlugin    = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const rimraf            = require('rimraf');

const glob          = require('glob');
const fs            = require('fs');
const { promisify } = require('util');
const ttf2woff2     = require('ttf2woff2');

const writeFileAsync = promisify(fs.writeFile);

const TerserPlugin = require('terser-webpack-plugin');
const UglifyJS     = require('uglify-js');
const path         = require('path');

const pathArr = {
    'symbole': {
        'src': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/gravur-symbole',
        'dest': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/gravur-symbole/compress'
    },
    'preview': {
        'src': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/template-preview',
        'dest': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/template-preview/compress'
    },
    'schriften': {
        'src': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/gravur-schriften',
        'dest': 'D:/OSPanel/domains/cadenis2.loc/mediafiles/gravur-schriften/woff2'
    },
    'js_goe_gravur': {
        'src': 'D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js',
        'dest': 'D:/OSPanel/domains/cadenis2.loc/plugins/goe_gravur_designer/frontend/js/min'
    }
};

// Clean destination paths
for (const key in pathArr) {
    rimraf.sync(pathArr[key]['dest']);
}

mix.setPublicPath(''); // Clear publicPath

const jsFiles = {'js_goe_gravur':
    [
        'canvas2image.js',
        'configurator.lib.js'
    ]
};

// js optimisation
for (const key in jsFiles) {
    jsFiles[key].forEach(fileName => {
        const fullPath = pathArr[key]['src'] + '/' + fileName;
        const code     = fs.readFileSync(fullPath, 'utf8');
        // minification without changing variable names and structures
        const minifiedCode  = UglifyJS.minify(code, {
            output: {
                comments: false
            }
        }).code;
        const directoryPath = pathArr[key]['dest'];

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        const minFilePath = path.join(directoryPath, `${fileName}.min.js`);

        fs.writeFileSync(minFilePath, minifiedCode);
    });
}


// optimization svg & png
mix.webpackConfig({
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            svgo: {
                plugins: [
                    { removeViewBox: false }, // save viewBox, it important to SVG
                ],
            },
            pngquant: {
                quality: '65-90',
                speed: 4,
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: pathArr['symbole']['src'],
                    to: pathArr['symbole']['dest'],
                },
                {
                    from: pathArr['preview']['src'],
                    to: pathArr['preview']['dest'],
                }
            ],
        }),
    ],
})

// TTF to WOFF2
const ttfFiles = glob.sync(pathArr['schriften']['src']+'/*.ttf');
const woff2Files = [];

ttfFiles.forEach((ttfFile) => {
    const ttfContent = fs.readFileSync(ttfFile);
    const woff2Buffer = ttf2woff2(ttfContent);

    const woff2FileName = ttfFile.replace('.ttf', '.woff2');
    woff2Files.push(woff2FileName);

    writeFileAsync(woff2FileName, woff2Buffer)
        .then(() => console.log(`Converted ${ttfFile} to ${woff2FileName}`))
        .catch((error) => console.error(`Error converting ${ttfFile} to ${woff2FileName}: ${error}`));
});

mix.copy(woff2Files, pathArr['schriften']['dest']);
