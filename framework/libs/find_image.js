#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
process.env.DISPLAY = process.env.DISPLAY || ':0';
const onArea = argv.onArea || 'onScreen';
const imagePath = argv.imagePath;
const imageSimilarity = argv.imageSimilarity || parseFloat(process.env.imageSimilarity) || 0.8;
const imageWaitTime = argv.imageWaitTime || parseFloat(process.env.imageWaitTime) || 1;
const imageAction = argv.imageAction || false; 
const imageFindAll = argv.imageFindAll || false;
const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session');

var location = screen_session.findImage(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll);
console.log(location);
