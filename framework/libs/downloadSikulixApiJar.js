#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
process.env.DISPLAY = process.env.DISPLAY || ':1';
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const sikuliApiJar = argv.sikulixApiJar || FrameworkPath + '/framework/libs/sikulixapi-2.0.1.jar';
const sikuliApiUrl_2_0_1 = 'https://launchpad.net/sikuli/sikulix/2.0.1/+download/sikulixapi-2.0.1.jar';
const sikuliApiUrl = argv.sikulixUrl || sikuliApiUrl_2_0_1;
const fs = require('fs');
const request = require('request');
const java = require('java');

const findJarStat = (filePath, getUrl) => {
    return new Promise(async (resolve, reject) => {
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            resolve(true);
        } else {
            const options = {
                url: getUrl,
	        encoding: null
            }
            await request.get(options, (err, res, body) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);
                try {
                    fs.writeFileSync(filePath, Buffer.from(body, 'utf8'));
                } catch(e) {
	            console.log(e);
	            reject(false);
                }
	        resolve(true);
          });
        }
    });
}

findJarStat(sikuliApiJar, sikuliApiUrl).then(function(jarStat) {
  if (jarStat) {
    java.classpath.push(sikuliApiJar);
  } else {
    throw Error (sikuliApiJar + ' jar file download error');
  }
  try {
    // test sikuli jar import
    const Screen = java.import('org.sikuli.script.Screen');
    console.log(sikuliApiJar + ' jar file is good');
  } catch(e) {
    throw Error (sikuliApiJar + ' jar import error: ' + e);
  }
}).catch(function(e) {
  console.log(e);
});

