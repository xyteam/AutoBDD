#!/usr/bin/env node

process.env.DISPLAY = process.env.DISPLAY || ':1';
const SikulixApiVer = process.env.SikulixApiVer || '2.0.1';
const sikuliApiJar = `sikulixapi-${SikulixApiVer}.jar`;
const sikuliApiJarPath = (process.env.FrameworkPath) ? `${process.env.FrameworkPath}/framework/libs/${sikuliApiJar}` : `./${sikuliApiJar}`
const sikuliApiUrl = `https://launchpad.net/sikuli/sikulix/${SikulixApiVer}/+download/${sikuliApiJar}`;

const fs = require('fs');
const request = require('request');
const java = require('java');

const findJarStat = (filePath, getUrl) => {
  return new Promise(async (resolve, reject) => {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) {
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
          resolve(true);
        } catch(e) {
          console.log(e);
          reject(false);
        }
      });
    }
  });
}

findJarStat(sikuliApiJarPath, sikuliApiUrl).then(() => {
  try {
    java.classpath.push(sikuliApiJarPath);
    const Screen = java.import('org.sikuli.script.Screen');
    console.log(sikuliApiJarPath + ' jar file is good');
  } catch(e) {
    console.log(sikuliApiJarPath + ' jar file error: ' + e);
  }  
}, () => console.log('download failed: ' + sikuliApiUrl));
