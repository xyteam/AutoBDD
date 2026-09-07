"use strict"

// java-bridge (MarkusJx, Rust/napi) replaces node-java (JNI); N-API prebuilt,
// requires Node >= 14 (Phase 5: Node 20 runtime). API mapping:
//   java.classpath.push  -> java.classpath.append
//   java.import          -> java.importClass
//   *Sync() names retained; methods auto-convert native types.
const java = require('java-bridge');

// prepare for safeQuote
const safeQuote = require('../lib/safequote');

// safe quote any external input
const SikulixApiVer = safeQuote(process.env.SikulixApiVer) || '2.0.4';

const sikuliApiJar = `sikulixapi-${SikulixApiVer}.jar`;
const sikuliApiLibPath = `${__dirname}/../lib`;
const sikuliApiJarPath = `${sikuliApiLibPath}/${sikuliApiJar}`;

// Append the jar to the classpath before importing classes from it.
java.classpath.append(sikuliApiJarPath);

// import classes for export
const App = java.importClass('org.sikuli.script.App');
const Button = java.importClass('org.sikuli.script.Button');
const ImagePath = java.importClass('org.sikuli.script.ImagePath');
const Mouse = java.importClass('org.sikuli.script.Mouse');
const OCR = java.importClass('org.sikuli.script.OCR');
const Pattern = java.importClass('org.sikuli.script.Pattern');
const Region = java.importClass('org.sikuli.script.Region');
const Settings = java.importClass('org.sikuli.basics.Settings');
const Screen = java.importClass('org.sikuli.script.Screen');

// export classes
module.exports = {App, Button, ImagePath, Mouse, OCR, Pattern, Region, Settings, Screen}
