#!/usr/bin/env node

// prepare for safeQuote
const safeQuote = require('../lib/safequote');

// all external env vars should be parsed or quoted
const SikulixApiVer = safeQuote(process.env.SikulixApiVer) || '4.0.0';

// Oculix self-contained Linux fat jar from the v${SikulixApiVer} GitHub release
// (preserves org.sikuli.script.*; bundles OpenCV + Tesseract + natives + tessdata)
const sikuliApiJar = `oculixapi-${SikulixApiVer}-linux.jar`;
const sikuliApiLibPath = `${__dirname}/../lib`;
const sikuliApiJarPath = `${sikuliApiLibPath}/${sikuliApiJar}`
const sikuliApiUrl = `https://github.com/oculix-org/Oculix/releases/download/v${SikulixApiVer}/${sikuliApiJar}`;

const fs = require('fs');
const request = require('request');
// java-bridge (MarkusJx) replaces node-java (JNI); N-API prebuilt, Node >= 14.
const java = require('java-bridge');

const findJarStat = (filePath, getUrl) => {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(sikuliApiLibPath)) fs.mkdirSync(sikuliApiLibPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
      resolve(true);
    } else {
      const options = {
        url: getUrl,
        encoding: null
      };
      await request.get(options, (err, res, body) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
        try {
          fs.writeFileSync(filePath, Buffer.from(body, 'utf8'));
          resolve(true);
        } catch(e) {
          console.log(e);
          reject(false);
        } finally {}
      });
    }
  });
};

findJarStat(sikuliApiJarPath, sikuliApiUrl).then(() => {
  try {
    java.classpath.append(sikuliApiJarPath);
    const Screen = java.importClass('org.sikuli.script.Screen');
    console.log(sikuliApiJarPath + ' jar file is good');
    console.log('run \'SikulixApiVer=2.0.x npm run download\' to download different versions');
  } catch(e) {
    console.log(sikuliApiJarPath + ' jar file error: ' + e);
  } finally {
    console.log('exit');
    process.exit();
  }
}, () => console.log('download failed: ' + sikuliApiUrl));
