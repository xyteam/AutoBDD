#!/usr/bin/env node

const fs = require('fs');
const execSync = require('child_process').execSync;
const uuid = require('uuid-random');

const argv = require('minimist')(process.argv.slice(2));
const imagePath = (argv.imagePath && argv.imagePath != 'null' && argv.imagePath != 'undefined') ? argv.imagePath : `/tmp/${uuid()}.png`;
const saveScreenCmd = `import -window root ${imagePath}`;
const getTextCmd = `tesseract ${imagePath} -`;

if (!argv.imagePath || argv.onArea == 'onScreen') execSync(saveScreenCmd, {shell: '/bin/bash'})

var result;
var exitcode;
try {
    result = execSync(getTextCmd, {shell: '/bin/bash'}).toString().split('\n');
    exitcode = 0;
} catch(e) {
    result = e.stdout.toString();
    exitcode = e.status;
}

const returnVal = [{text: result, exitcode: exitcode}];
const returnString = JSON.stringify(returnVal);
console.log(returnString);
fs.unlinkSync(imagePath)
return returnString;

