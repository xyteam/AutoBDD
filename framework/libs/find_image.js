#!/usr/bin/env node

const java = require('java');
const argv = require('minimist')(process.argv.slice(2));
const onArea = (argv.onArea != null && argv.onArea != 'undefined') ? argv.onArea : 'onScreen';
const imagePath = (argv.imagePath != null && argv.imagePath != 'undefined') ? argv.imagePath : 'center';
const imageSimilarity = (argv.imageSimilarity != null && argv.imageSimilarity != 'undefined') ? argv.imageSimilarity : process.env.imageSimilarity || 0.8;
const imageWaitTime = (argv.imageWaitTime != null && argv.imageWaitTime != 'undefined') ? argv.imageWaitTime : process.env.imageWaitTime || 1;
const imageAction = (argv.imageAction != null && argv.imageAction != 'undefined') ? argv.imageAction : 'none';
const maxSimilarityOrText = (argv.maxSimilarityOrText != null && argv.maxSimilarityOrText != 'undefined') ? argv.maxSimilarityOrText : 1;
const imageMaxCount = (argv.imageMaxCount != null && argv.imageMaxCount != 'undefined') ? argv.imageMaxCount : 1;
const SikulixApiVer = process.env.SikulixApiVer || '2.0.1';
const sikuliApiJarPath = (process.env.FrameworkPath) ? process.env.FrameworkPath + '/framework/libs' : '.'
const sikuliApiJar = `${sikuliApiJarPath}/sikulixapi-${SikulixApiVer}.jar`;
const notFoundStatus = {status: 'notFound'};
// const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session');

const findImage = (onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) => {
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myImageWaitTime = parseFloat(imageWaitTime);
  const myImageText = isNaN(maxSimilarityOrText) ? maxSimilarityOrText : '';
  const mySimilarityMax = (myImageText.length > 0) ? 1 : parseFloat(maxSimilarityOrText);
  const myImageMaxCount = imageMaxCount || 1;
  // Sikuli Property
  java.classpath.push(sikuliApiJar);
  // const App = java.import('org.sikuli.script.App');
  const Region = java.import('org.sikuli.script.Region');
  const Screen = java.import('org.sikuli.script.Screen');
  const Pattern = java.import('org.sikuli.script.Pattern');

  var findRegion;
  switch (onArea) {
    case 'onFocused':
      findRegion = App.focusedWindowSync();
      break;
    case 'onScreen':
    default:
      findRegion = new Screen();
  }
  findRegion.setAutoWaitTimeout(myImageWaitTime);

  try {
    var find_item;
    var returnItem = {location: null, dimension: null, center: null, clicked: null, text: null};
    var returnArray = [];
    switch (imagePath) {
      case 'Screen':
      case 'screen':
        find_item = Region(findRegion.getBoundsSync());
        find_item.highlight(0.1);
        returnItem.text = find_item.textSync();
        returnItem.location = {x: find_item.x, y: find_item.y};
        returnItem.dimension = {width: find_item.w, height: find_item.h};
        returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
        returnArray.push(returnItem);
      break;
      default:
        const oneTarget = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
        const find_results = findRegion.findAllSync(oneTarget);
        var matchCount = 0;
        while (matchCount < myImageMaxCount && find_results.hasNextSync()) {
          find_item = find_results.nextSync();
          returnItem.score = Math.floor(find_item.getScoreSync()*1000000)/1000000;
          returnItem.text = find_item.textSync();
          if (returnItem.score >= imageSimilarity && returnItem.score <= mySimilarityMax && returnItem.text.includes(myImageText)) {
            matchCount += 1;
            find_item.highlight(0.1);
            returnItem.location = {x: find_item.x, y: find_item.y};
            returnItem.dimension = {width: find_item.w, height: find_item.h};
            returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
            returnArray.push(returnItem);
          }
        }
        break;    
    }
    if (returnArray.length == 0) returnArray.push(notFoundStatus);
    // process imageAction if any
    var click_count = 0;
    switch (imageAction) {
      case 'single':
        click_count = find_item.hoverSync();
        click_count = find_item.clickSync();
      break;
      case 'double':
        click_count = find_item.hoverSync();
        click_count = find_item.doubleClickSync();
      break;
      case 'right':
        click_count = find_item.hoverSync();
        click_count = find_item.rightClickSync();
      break;
      case 'hover':
        click_count = find_item.hoverSync();
      break;
    }
    if (click_count > 0) {
      var clicked_target = find_item.getTargetSync();
      returnItem.clicked = {x: clicked_target.x, y: clicked_target.y}
    }
  } catch(e) {
    console.log(e);
    returnArray.push(notFoundStatus);
  }
  return JSON.stringify(returnArray);
};
const findImage_result = findImage(onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
console.log(findImage_result);
