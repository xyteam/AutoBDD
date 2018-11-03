#!/usr/bin/env node

const java = require('java');
java.classpath.push(process.env.HOME + '/Projects/Sikulix/lib/sikulixlibslux.jar');
java.classpath.push(process.env.HOME + '/Projects/Sikulix/lib/sikulixapi.jar');
const Screen = java.import('org.sikuli.script.Screen');

var imageFullName = process.argv[2];
var s = new Screen();

try {
  s.clickSync(imageFullName);
} catch(e) {
  console.log('image not clicked (not found): ' + imageFullName);
}
