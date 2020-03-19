#!/usr/bin/env node

// Tesseract-OCR Property
process.env.LC_ALL = 'C';
process.env.LC_CTYPE = 'C';
process.env.TESSDATA_PREFIX = '/usr/share/tesseract-ocr/4.00/tessdata';

const java = require('java');
const xysikulixapi = require('xysikulixapi');

// Sikuli Property
const Region = xysikulixapi.Region;
const Screen = xysikulixapi.Screen;
const Pattern = xysikulixapi.Pattern;
const Settings = xysikulixapi.Settings;
const Mouse = xysikulixapi.Mouse;
const Button = xysikulixapi.Button;

const argv = require('minimist')(process.argv.slice(2));
const imagePath = (argv.imagePath != null && argv.imagePath != 'undefined') ? argv.imagePath : 'Screen';
const imageSimilarity = (argv.imageSimilarity != null && argv.imageSimilarity != 'undefined') ? argv.imageSimilarity : process.env.imageSimilarity || 0.8;
const imageWaitTime = (argv.imageWaitTime != null && argv.imageWaitTime != 'undefined') ? argv.imageWaitTime : process.env.imageWaitTime || 1;
const imageAction = (argv.imageAction != null && argv.imageAction != 'undefined') ? argv.imageAction : 'none';
const maxSim = (argv.maxSim != null && argv.maxSim != 'undefined') ? argv.maxSim : 1;
const textHint = (argv.textHint != null && argv.textHint != 'undefined') ? argv.textHint : '';
const imageMaxCount = (argv.imageMaxCount != null && argv.imageMaxCount != 'undefined') ? argv.imageMaxCount : 1;
const notFoundStatus = {status: 'notFound'};

const findImage = (imagePath, imageSimilarity, maxSim, textHint, imageWaitTime, imageAction, imageMaxCount) => {
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myMaxSim = parseFloat(maxSim);
  const myTextHint = textHint;
  const myImageWaitTime = parseInt(imageWaitTime);
  const myImageMaxCount = imageMaxCount || 1;

  const findRegion = new Screen();
  // findRegion.setAutoWaitTimeout(java.newFloat(myImageWaitTime));

  try {
    var oneTarget;
    var returnItem = {score: null, text: null, location: null, dimension: null, center: null, clicked: null};
    var returnArray = [];
    const fillRectangleInfo = (rectItem) => {
      location = {x: rectItem.x, y: rectItem.y};
      dimension = {width: rectItem.w, height: rectItem.h};
      center = {x: rectItem.x + Math.round(rectItem.w / 2), y: rectItem.y + Math.round(rectItem.h / 2)};
      return [location, dimension, center];
    }
    if (imagePath.includes('Screen')) {
      const screenMargin = imagePath.includes('-') ? parseInt(imagePath.split('-')[1]) : 1;
      oneTarget = Region(findRegion.getBoundsSync()).growSync(-screenMargin);
      returnItem.text = oneTarget.textSync().split('\n');
      [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(oneTarget);
      oneTarget.highlight(0.1);
      returnArray.push(returnItem);
    } else {
      const oneSample = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
      const findTargets = findRegion.findAllSync(oneSample);
      const myRegex = new RegExp(myTextHint, 'i');
      var matchCount = 0;
      while (matchCount < myImageMaxCount && findTargets.hasNextSync()) {
        const oneMatch = findTargets.nextSync();
        returnItem.score = Math.floor(oneMatch.getScoreSync()*1000000)/1000000;
        [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(oneMatch);
        oneTarget = Region(oneMatch);
        returnItem.text = oneTarget.textSync().split('\n');
        if (returnItem.score >= myImageSimilarity && returnItem.score <= myMaxSim && returnItem.text.join('\n').match(myRegex)) {
          matchCount += 1;
          oneTarget.highlight(0.1);
          returnArray.push(returnItem);
        }
      }
    }
    if (returnArray.length == 0) {
      returnArray.push(notFoundStatus)
     } else {
      // process imageAction if any
      if (imageAction && imageAction != 'none' && imageAction != 'null') {
        for (i=0; i<returnArray.length; i++) {
          var clickRegion = new Region(returnArray[i].location.x, returnArray[i].location.y, returnArray[i].dimension.width, returnArray[i].dimension.height);
          var mySettings = new Settings();
          switch (imageAction) {
            case 'single':
            case 'click':
              mySettings.ClickDelay = 0;
              clickRegion.clickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'hoverClick':
              clickRegion.hoverSync();
              mySettings.ClickDelay = 0;
              clickRegion.clickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'double':
            case 'doubleClick':
              mySettings.ClickDelay = 0;
              clickRegion.doubleClickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'right':
            case 'rightClick':
              mySettings.ClickDelay = 0;
              clickRegion.rightClickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'hover':
              clickRegion.hoverSync();
            break;
          }
        }  
      }
    }
  } catch(e) {
    console.log(e);
    returnArray.push(notFoundStatus);
  }
  return JSON.stringify(returnArray);
};
const target_result = findImage(imagePath, imageSimilarity, maxSim, textHint, imageWaitTime, imageAction, imageMaxCount);
console.log(`target_result: ${target_result}`);
