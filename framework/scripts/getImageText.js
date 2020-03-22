#!/usr/bin/env node

// Tesseract-OCR Property
process.env.LC_ALL = 'C';
process.env.LC_CTYPE = 'C';
process.env.TESSDATA_PREFIX = process.env.TESSDATA_PREFIX || '/usr/share/tesseract-ocr/4.00/tessdata';
process.env.OMP_THREAD_LIMIT = process.env.OMP_THREAD_LIMIT || 1;

const fs = require('fs');
const execSync = require('child_process').execSync;
const uuid = require('uuid-random');

const argv = require('minimist')(process.argv.slice(2));
const tmpImagePath = `/tmp/${uuid()}.png`;
const saveScreenCmd = `import -display ${process.env.DISPLAY} -window root ${tmpImagePath}`;
const getTextCmd = `tesseract ${tmpImagePath} -`;

if (argv.imagePath && argv.imagePath != 'null' && argv.imagePath != 'undefined') {
    fs.copyFileSync(argv.imagePath, tmpImagePath);
} else {
    execSync(saveScreenCmd, {shell: '/bin/bash'});
}

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
fs.unlinkSync(tmpImagePath)
return returnString;

