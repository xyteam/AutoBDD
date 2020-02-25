#!/usr/bin/env node

const java = require('java');
const xysikulixapi = require('xysikulixapi');

// Sikuli Property
const App = xysikulixapi.App;
const Region = xysikulixapi.Region;
const Screen = xysikulixapi.Screen;
const Pattern = xysikulixapi.Pattern;

const argv = require('minimist')(process.argv.slice(2));
const onArea = (argv.onArea != null && argv.onArea != 'undefined') ? argv.onArea : 'onScreen';
const imagePath = (argv.imagePath != null && argv.imagePath != 'undefined') ? argv.imagePath : 'center';
const imageSimilarity = (argv.imageSimilarity != null && argv.imageSimilarity != 'undefined') ? argv.imageSimilarity : process.env.imageSimilarity || 0.8;
const imageWaitTime = (argv.imageWaitTime != null && argv.imageWaitTime != 'undefined') ? argv.imageWaitTime : process.env.imageWaitTime || 1;
const imageAction = (argv.imageAction != null && argv.imageAction != 'undefined') ? argv.imageAction : 'none';
const maxSimilarityOrText = (argv.maxSimilarityOrText != null && argv.maxSimilarityOrText != 'undefined') ? argv.maxSimilarityOrText : 1;
const imageMaxCount = (argv.imageMaxCount != null && argv.imageMaxCount != 'undefined') ? argv.imageMaxCount : 1;
const notFoundStatus = {status: 'notFound'};

const findImage = (onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) => {
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myImageWaitTime = parseFloat(imageWaitTime);
  const myImageText = isNaN(maxSimilarityOrText) ? maxSimilarityOrText : '';
  const mySimilarityMax = (myImageText.length > 0) ? 1 : parseFloat(maxSimilarityOrText);
  const myImageMaxCount = imageMaxCount || 1;

  var findRegion;
  switch (onArea) {
    case 'onFocused':
      findRegion = new App.focusedWindowSync();
      break;
    case 'onScreen':
    default:
      findRegion = new Screen();
  }
  findRegion.setAutoWaitTimeout(myImageWaitTime);

  try {
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
        const oneTarget = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
        const find_results = findRegion.findAllSync(oneTarget);
        var matchCount = 0;
        while (matchCount < myImageMaxCount && find_results.hasNextSync()) {
          find_item = find_results.nextSync();
          returnItem.score = Math.floor(find_item.getScoreSync()*1000000)/1000000;
          returnItem.text = find_item.textSync().split('\n');
          [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(find_item);
          if (returnItem.score >= myImageSimilarity && returnItem.score <= mySimilarityMax && returnItem.text.join('\n').includes(myImageText)) {
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
  } catch(e) {
    console.log(e);
    returnArray.push(notFoundStatus);
  }
  return JSON.stringify(returnArray);
};
const findImage_result = findImage(onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
console.log(`fidnImage_result: ${findImage_result}`);
