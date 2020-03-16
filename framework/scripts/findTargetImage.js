#!/usr/bin/env node

// jvm property
const java = require('java');

// use xysikulixapi property
const sikulixapi = require('xysikulixapi');

// script property
const argv = require('minimist')(process.argv.slice(2));
const onArea = (argv.onArea && argv.onArea != 'null' && argv.onArea != 'undefined') ? argv.onArea : 'onScreen';
const imagePath = (argv.imagePath && argv.imagePath != 'null' && argv.imagePath != 'undefined') ? argv.imagePath : 'Screen';
const imageSimilarity = (argv.imageSimilarity && argv.imageSimilarity != 'null' && argv.imageSimilarity != 'undefined') ? argv.imageSimilarity : process.env.imageSimilarity || 0.8;
const imageWaitTime = (argv.imageWaitTime && argv.imageWaitTime != 'null' && argv.imageWaitTime != 'undefined') ? argv.imageWaitTime : process.env.imageWaitTime || 1;
const imageScanRate = (argv.imageScanRate && argv.imageScanRate != 'null' && argv.imageScanRate != 'undefined') ? argv.imageScanRate : process.env.imageScanRate || 1;
const imageAction = (argv.imageAction && argv.imageAction != 'null' && argv.imageAction != 'undefined') ? argv.imageAction : 'none';
const maxSimOrText = (argv.maxSimOrText && argv.maxSimOrText != 'null' && argv.maxSimOrText != 'undefined') ? argv.maxSimOrText : 1;
const imageMaxCount = (argv.imageMaxCount && argv.imageMaxCount != 'null' && argv.imageMaxCount != 'undefined') ? argv.imageMaxCount : 1;
const notFoundStatus = {status: 'notFound'};

const findImage = (onArea, imagePath, imageSimilarity, maxSimOrText, imageWaitTime, imageAction, imageMaxCount) => {
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myImageWaitTime = parseFloat(imageWaitTime);
  const myImageText = isNaN(maxSimOrText) ? maxSimOrText : '';
  const mySimilarityMax = (myImageText.length > 0) ? 1 : parseFloat(maxSimOrText);
  const myImageMaxCount = imageMaxCount || 1;
  // deal with tesseract-ocr issue
  process.env.LC_ALL = 'C';
  process.env.LC_CTYPE = 'C';

  var findRegion;
  switch (onArea) {
    case 'onFocused':
      const App = sikulixapi.App;
      findRegion = new App.focusedWindowSync();
      break;
    case 'onScreen':
    default:
      const Screen = sikulixapi.Screen;
      findRegion = new Screen();
  }
  findRegion.setAutoWaitTimeout(java.newFloat(myImageWaitTime));
  findRegion.setWaitScanRate(java.newFloat(imageScanRate));
  
  try {
    const Region = sikulixapi.Region;
    var find_item;
    var returnItem = {score: null, text: null, location: null, dimension: null, center: null, clicked: null};
    var returnArray = [];
    const fillRectangleInfo = (rectItem) => {
      location = {x: rectItem.x, y: rectItem.y};
      dimension = {width: rectItem.w, height: rectItem.h};
      center = {x: rectItem.x + Math.round(rectItem.w / 2), y: rectItem.y + Math.round(rectItem.h / 2)};
      return [location, dimension, center];
    }
    switch (imagePath) {
      case 'Screen':
      case 'screen':
        find_item = Region(findRegion.getBoundsSync());
        find_item.highlight(0.1);
        returnItem.text = find_item.textSync().split('\n');
        [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(find_item);
        returnArray.push(returnItem);
        break;
      case 'Console':
      case 'console':
        find_item = Region(findRegion.getBoundsSync()).growSync(-100);
        find_item.highlight(0.1);
        returnItem.text = find_item.textSync().split('\n');
        [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(find_item);
        returnArray.push(returnItem);
        break;
      default:
        const Pattern = sikulixapi.Pattern;
        const oneTarget = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
        const find_results = findRegion.findAllSync(oneTarget);
        const myRegex = new RegExp(myImageText, 'i');
        var matchCount = 0;
        while (matchCount < myImageMaxCount && find_results.hasNextSync()) {
          find_item = find_results.nextSync();
          returnItem.score = Math.floor(find_item.getScoreSync()*1000000)/1000000;
          returnItem.text = find_item.textSync().split('\n');
          [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(find_item);
          if (returnItem.score >= myImageSimilarity && returnItem.score <= mySimilarityMax && returnItem.text.join('\n').match(myRegex)) {
            matchCount += 1;
            find_item.highlight(0.1);
            returnArray.push(returnItem);
          }
        }
        break;
    }
    if (returnArray.length == 0) {
      returnArray.push(notFoundStatus)
     } else {
      // process imageAction if any
      if (imageAction && imageAction != 'none') {
        for (i=0; i<returnArray.length; i++) {
          var clickRegion = new Region(returnArray[i].location.x, returnArray[i].location.y, returnArray[i].dimension.width, returnArray[i].dimension.height);
          switch (imageAction) {
            case 'single':
              clickRegion.hoverSync();
              clickRegion.clickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'double':
              clickRegion.hoverSync();
              clickRegion.doubleClickSync();
              returnArray[i].clicked = returnArray[i].center;
            break;
            case 'right':
              clickRegion.hoverSync();
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
const findImage_result = findImage(onArea, imagePath, imageSimilarity, maxSimOrText, imageWaitTime, imageAction, imageMaxCount);
console.log(`fidnImage_result: ${findImage_result}`);
