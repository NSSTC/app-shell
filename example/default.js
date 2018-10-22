'use strict';

const fs = require('fs');

const AppShell = require('..').AppShell;
const shell = new AppShell();

shell.register({
    name: 'test',
    handler: args => shell.write(JSON.stringify(args)),
});

shell.register({
    name: 'exit',
    handler: () => {
        shell.write('Exiting test...');
        shell.stopShell();
    },
});


shell.startShell(fs.createReadStream('./example/default.in.txt'), process.stdout);
