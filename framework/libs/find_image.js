#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
const onArea = argv.onArea;
const imagePath = argv.imagePath;
const imageSimilarity = argv.imageSimilarity || 0.8;
const clickImage = argv.clickImage || false; 
const imageFindAll = argv.imageFindAll || false;
const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session');

var location = screen_session.findImage(onArea, imagePath, imageSimilarity, clickImage, imageFindAll);
console.log(location);
