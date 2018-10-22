const clear = require('rollup-plugin-clear');
//const closure = require('rollup-plugin-closure-compiler-js');
const progress = require('rollup-plugin-progress');
const rollup = require('rollup').rollup;
const typescript = require('rollup-plugin-typescript2');

async function build() {
    const bundle = await rollup({
        input: 'src/index.ts',
        plugins: [
            clear({
                targets: ['./dist'],
                watch: false,
            }),
            /*
            closure({
                assumeFunctionWrapper: true,
                languageOut: 'ES6',
            }),*/
            progress({
                clearLine: false,
            }),
            typescript(),
        ],
    });

    await bundle.write({
        file: 'dist/app-shell.js',
        format: "cjs"
    });
}

build().catch(console.error);
