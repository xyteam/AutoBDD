#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const sikuliApiJar = argv.sikulixApiJar || FrameworkPath + '/framework/libs/sikulixapi-1.1.4.jar';
const sikuliApiUrl_latest = 'https://raiman.github.io/SikuliX1/sikulixapi.jar';
const sikuliApiUrl_114 = 'https://raiman.github.io/SikuliX1/sikulixapi.jar';
var sikuliApiUrl = argv.sikulixUrl || sikuliApiUrl_114;
const fs = require('fs');
const https = require('https');
const java = require('java');

var findJarStat = function(filePath, getUrl) {
  return new Promise(async function(resolve, reject) {
    if (!fs.existsSync(sikuliApiJar) || fs.statSync(sikuliApiJar).size == 0) {
      var request = await https.get(getUrl, function(res) {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        if (res.statusCode != 200) {
          reject(false);
        } else {
          try {
            var saveDest= fs.createWriteStream(filePath);
            var saveStat = res.pipe(saveDest);
            saveDest.on('finish', function(){
              resolve(true)
            });
          } catch(e) {
            reject(false);
          }
        }
      })
    } else {
      resolve(true);
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
    throw Error (sikuliApiJar + ' jar import error');
  }
}).catch(function(e) {
  console.log(e);
});
