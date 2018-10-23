const clear = require('rollup-plugin-clear');
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
