#!/usr/bin/env node

const java = require('java');
var argv = require('minimist')(process.argv.slice(2));
const onArea = argv.onArea || 'onScreen';
const imagePath = argv.imagePath;
const imageSimilarity = argv.imageSimilarity || process.env.imageSimilarity || 0.8;
const imageWaitTime = argv.imageWaitTime || process.env.imageWaitTime || 1;
const imageAction = argv.imageAction || 'none';
const imageFindAll = argv.imageFindAll || 'false';
const imageSimilarityMax = argv.imageSimilarityMax || 1;
const sikuliApiJarPath = (process.env.FrameworkPath) ? process.env.FrameworkPath + '/framework/libs' : '.'
// const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session');

const findImage = (onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax, maxCount) => {
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myImageWaitTime = parseFloat(imageWaitTime);
  const myMaxCount = maxCount || 30;
    // Sikuli Property
    var sikuliApiJar;
    switch (process.env.ReleaseString) {
      case '16.04':
        sikuliApiJar = sikuliApiJarPath + '/sikulixapi-1.1.3.jar';
        break;
      case '18.04':
      default:
        // sikuliApiJar = sikuliApiJarPath + '/sikulixapi-1.1.4.jar';
        // sikuliApiJar = sikuliApiJarPath + '/sikulixapi-2.0.0.jar';
        sikuliApiJar = sikuliApiJarPath + '/sikulixapi-2.0.1.jar';
        break;
    }
    java.classpath.push(sikuliApiJar);
    // const App = java.import('org.sikuli.script.App');
    // const Region = java.import('org.sikuli.script.Region');
    const Screen = java.import('org.sikuli.script.Screen');
    const Pattern = java.import('org.sikuli.script.Pattern');

    var returnArray = [];
    var findRegion;
    var oneTarget, allTargets;

    switch (onArea) {
      // case 'onFocused':
      //   findRegion = App.focusedWindowSync();
      //   break;
      case 'onScreen':
      default:
        var findRegion = new Screen();
    }

    if (imagePath == 'center') {
      oneTarget = findRegion.getCenterSync();
    } else {
      // oneTarget for imageAction, allTargets for imageFindAll
      oneTarget = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
      allTargets = (new Pattern(imagePath)).similarSync(java.newFloat(myImageSimilarity));
    }

    try {
      if (imageFindAll == 'true') {
        var find_results = findRegion.findAllSync(allTargets);
        var matchCount = 0;
        while (matchCount < myMaxCount && find_results.hasNextSync()) {
          const find_item = find_results.nextSync();
          var returnItem = {location: null, dimension: null, center: null, clicked: null};
          returnItem.score = Math.floor(find_item.getScoreSync()*1000000)/1000000;
          if (returnItem.score >= imageSimilarity && returnItem.score <= imageSimilarityMax) {
            matchCount += 1;
            find_item.highlight(0.1);
            returnItem.location = {x: find_item.x, y: find_item.y};
            returnItem.dimension = {width: find_item.w, height: find_item.h};
            returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
            returnItem.text = find_item.textSync();
            returnArray.push(returnItem);
          }
        }
        if (returnArray.length == 0) returnArray.push('notFound');
      } else {
        const find_item = findRegion.waitSync(oneTarget, myImageWaitTime);
        find_item.highlight(0.1);
        var returnItem = {location: null, dimension: null, center: null, clicked: null, score: null};
        returnItem.location = {x: find_item.x, y: find_item.y};
        returnItem.dimension = {width: find_item.w, height: find_item.h};
        returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
        returnItem.score = Math.floor(find_item.getScoreSync()*1000000)/1000000;
        returnItem.text = find_item.textSync();
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
        returnArray.push(returnItem);
      }
      return JSON.stringify(returnArray);
    } catch(e) {
      // console.log(e);
      returnArray.push('notFound');
      return JSON.stringify(returnArray);
    }
  };
console.log([onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax]);
const findImage_result = findImage(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax);
console.log(findImage_result);

