"use strict"

// node-java general
const java = require('java');

// prepare for safeQuote
const safeQuote = require('../lib/safequote');

// safe quote any external input
const SikulixApiVer = safeQuote(process.env.SikulixApiVer) || '2.0.4';

const sikuliApiJar = `sikulixapi-${SikulixApiVer}.jar`;
const sikuliApiLibPath = `${__dirname}/../lib`;
const sikuliApiJarPath = `${sikuliApiLibPath}/${sikuliApiJar}`;
java.classpath.push(sikuliApiJarPath);

// import classes for export
const App = java.import('org.sikuli.script.App');
const Button = java.import('org.sikuli.script.Button');
const ImagePath = java.import('org.sikuli.script.ImagePath');
const Mouse = java.import('org.sikuli.script.Mouse');
const OCR = java.import('org.sikuli.script.OCR');
const Pattern = java.import('org.sikuli.script.Pattern');
const Region = java.import('org.sikuli.script.Region');
const Settings = java.import('org.sikuli.basics.Settings');
const Screen = java.import('org.sikuli.script.Screen');

// export classes
module.exports = {App, Button, ImagePath, Mouse, OCR, Pattern, Region, Settings, Screen}
