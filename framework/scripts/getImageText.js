#!/usr/bin/env node

// prepare for safeQuote
const safeQuote = require('../libs/safequote');

// all external env vars should be parsed or quoted
process.env.TESSDATA_PREFIX = safeQuote(process.env.TESSDATA_PREFIX) || '/usr/share/tesseract-ocr/4.00/tessdata';
process.env.OMP_THREAD_LIMIT = parseInt(process.env.OMP_THREAD_LIMIT) || 1;
const myDISPLAY = ':' + parseInt(process.env.DISPLAY.split(':')[1]) || ':1';

// needed for Tesseract-OCR property
process.env.LC_ALL = 'C';
process.env.LC_CTYPE = 'C';

// all args should be parsed or quoted to const
const argv = require('minimist')(process.argv.slice(2));
const myImagePath = safeQuote(argv.imagePath);

// require stuff
const fs = require('fs');
const execSync = require('child_process').execSync;
const uuid = require('uuid-random');

const imageExt = 'png';
const tmpUUID = uuid();
const tmpOriginalImagePath = `/tmp/${tmpUUID}.orig.${imageExt}`;
const tmpConvertedImagePath = `/tmp/${tmpUUID}.convt.${imageExt}`;
const takeScreenCmd = `import -silent -display ${myDISPLAY} -window root ${tmpOriginalImagePath}`;
const convertImageCmd = `convert ${tmpOriginalImagePath} -colorspace Gray ${tmpConvertedImagePath}`;
const getTextCmd = `tesseract ${tmpConvertedImagePath} -`;

if (myImagePath && myImagePath != 'null' && myImagePath != 'undefined') {
    fs.copyFileSync(myImagePath, tmpOriginalImagePath);
} else {
    execSync(takeScreenCmd, {shell: '/bin/bash'});
}

execSync(convertImageCmd, {shell: '/bin/bash'});

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
fs.unlinkSync(tmpOriginalImagePath);
fs.unlinkSync(tmpConvertedImagePath);
return returnString;
