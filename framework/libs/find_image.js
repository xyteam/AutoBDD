#!/usr/bin/env node

const java = require('java');
var argv = require('minimist')(process.argv.slice(2));
// process.env.DISPLAY = process.env.DISPLAY || ':1';
const onArea = argv.onArea || 'onScreen';
const imagePath = argv.imagePath;
const imageSimilarity = argv.imageSimilarity || parseFloat(process.env.imageSimilarity) || 0.8;
const imageWaitTime = argv.imageWaitTime || parseFloat(process.env.imageWaitTime) || 1;
const imageAction = argv.imageAction || false; 
const imageFindAll = argv.imageFindAll || false;
const sikuliApiJarPath = (process.env.FrameworkPath) ? process.env.FrameworkPath + '/framework/libs' : '.'
// const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session');

const findImage = (onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll) => {
    // Sikuli Property
    var sikuliApiJar;
    switch (process.env.ReleaseString) {
      case '16.04':
        sikuliApiJar = sikuliApiJarPath + '/sikulixapi-1.1.3.jar';
        break;
      case '18.04':
      default:
        sikuliApiJar = sikuliApiJarPath + '/sikulixapi-1.1.4.jar';
        break;
    }
    java.classpath.push(sikuliApiJar);
    // const App = java.import('org.sikuli.script.App');
    // const Region = java.import('org.sikuli.script.Region');
    const Screen = java.import('org.sikuli.script.Screen');
    const Pattern = java.import('org.sikuli.script.Pattern');

    var imageSimilarity = parseFloat(imageSimilarity) || parseFloat(process.env.imageSimilarity) || 0.8;
    var imageWaitTime = parseFloat(imageWaitTime) || parseFloat(process.env.imageWaitTime) || 1;
    var imageAction = imageAction || false; 
    var imageFindAll = imageFindAll || false;

    var returnArray = [];
    var findRegion;
    var target;
    var sim_java = java.newFloat(imageSimilarity);

    switch (onArea) {
      // case 'onFocused':
      //   findRegion = App.focusedWindowSync();
      //   break;
      case 'onScreen':
      default:
        findRegion = new Screen();
    }

    if (imagePath == 'center') {
      target = findRegion.getCenterSync();
    } else {
      target = (new Pattern(imagePath)).similarSync(sim_java);
    }

    try {
      if (imageFindAll) {
        var find_results = findRegion.findAllSync(target);
        while (find_results.hasNextSync()) {
          var find_item = find_results.nextSync();
          var returnItem = {location: null, dimension: null, center: null, clicked: null};
          returnItem.location = {x: find_item.x, y: find_item.y};
          returnItem.dimension = {width: find_item.w, height: find_item.h};
          returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
          returnArray.push(returnItem); 
        }
      } else {
        var find_item = findRegion.waitSync(target, imageWaitTime);
        // uncomment this line to show selected image, however this will break test in xvfb
        // find_item.highlight(1);
        var returnItem = {location: null, dimension: null, center: null, clicked: null, score: null};
        returnItem.location = {x: find_item.x, y: find_item.y};
        returnItem.dimension = {width: find_item.w, height: find_item.h};
        returnItem.center = {x: find_item.x + Math.round(find_item.w / 2), y: find_item.y + Math.round(find_item.h / 2)};
        returnItem.score = find_item.getScoreSync();
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
      return '[not found]';
    }
  };

var location = findImage(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll);
console.log(imagePath);
console.log(location);
