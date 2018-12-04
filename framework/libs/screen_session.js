// screen_session.js provides functions to see the screen, to control keyboard and mouse

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const robot = require('robotjs');
const java = require('java');
const fs = require('fs');
const execSync = require('child_process').execSync;

// Sikuli Property
const sikuliApiJar = FrameworkPath + '/framework/libs/sikulixapi-1.1.4.jar';
java.classpath.push(sikuliApiJar);
const App = java.import('org.sikuli.script.App');
const Screen = java.import('org.sikuli.script.Screen');
const Region = java.import('org.sikuli.script.Region');
const Pattern = java.import('org.sikuli.script.Pattern');
// Robot Property
robot.setXDisplayName(process.env.DISPLAY);
robot.setMouseDelay(50);
robot.setKeyboardDelay(50);

module.exports = {
  findImage: function(onArea, imagePath, imageSimilarity, imageAction, imageFindAll) {
    var imageSimilarity = parseFloat(imageSimilarity) || 0.8;
    var imageAction = imageAction || false; 
    var imageFindAll = imageFindAll || false;

    var returnArray = [];
    var findRegion;
    var target;
    var sim_java = java.newFloat(imageSimilarity);

    switch (onArea) {
      case 'onFocus':
      case 'onFocused':
        findRegion = App.focusedWindowSync();
        break;
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
          var returnItem = {dimention: null, location: null};
          returnItem.dimention = {width: find_item.w, height: find_item.h};
          returnItem.location = {x: find_item.x, y: find_item.y};
          returnArray.push(returnItem); 
        }
      } else {
        var find_item = findRegion.findSync(target);
        var returnItem = {dimention: null, location: null, clicked: null};
        returnItem.dimention = {width: find_item.w, height: find_item.h};
        returnItem.location = {x: find_item.x, y: find_item.y};
        var click_count = 0;
        switch (imageAction) {
          case (true):
          case 'single':
            click_count = findRegion.clickSync(target);
          break;
          case 'double':
            click_count = findRegion.doubleClickSync(target);
          break;
          case 'right':
            click_count = findRegion.rightClickSync(target);
          case 'hover':
          default:
            click_count = findRegion.hoverSync(target);
        }
        if (click_count > 0) {
          var clicked_target = find_item.getTargetSync();
          returnItem.clicked = {x: clicked_target.x, y: clicked_target.y}
        }
        returnArray.push(returnItem);
      }
      return JSON.stringify(returnArray);
    } catch(e) {
      console.log(e.message);
      return 'error';
    }
  },

  runFindImage: function(onArea, imagePath, imageSimilarity, imageAction, imageFindAll) {
    var outputBuffer = execSync(FrameworkPath + '/framework/libs/find_image.js'
                      + ' --onArea=' + onArea
                      + ' --imagePath=' + imagePath
                      + ' --imageSimilarity=' + imageSimilarity
                      + ' --imageAction=' + imageAction
                      + ' --imageFindAll' + imageFindAll);
    var outputString = outputBuffer.toString('utf8');
    var returnVal = outputString.substring(outputString.lastIndexOf('['), outputString.lastIndexOf(']') + 1);
    return returnVal;
  },

  focusedFindImage: function(imagePath, imageSimilarity, imageAction, imageFindAll) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, imageAction, imageFindAll);
    return returnVal;
  },

  focusedHoverImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, 'hover');
    return returnVal;
  },

  focusedClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, 'single');
    return returnVal;
  },

  focusedDoubleClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, 'double');
    return returnVal;
  },

  focusedRightClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, 'right');
    return returnVal;
  },

  screenFindImage: function(imagePath, imageSimilarity, imageAction, imageFindAll) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, imageAction, imageFindAll);
    return returnVal;
  },

  screenHoverImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, 'hover');
    return returnVal;
  },

  screenClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, 'single');
    return returnVal;
  },

  screenDoubleClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, 'double');
    return returnVal;
  },

  screenRightClickImage: function(imagePath, imageSimilarity) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, 'right');
    return returnVal;
  },

  screenHoverCenter: function() {
    var returnVal = this.runFindImage('onScreen', 'center', null, 'hover');
    return returnVal;
  },

  keyTap: function(key, modifier) {
    var myKey = key || 'enter';
    var myModifier = modifier || null;

    if (myModifier) {
      robot.keyTap(myKey, myModifier);
    } else {
      robot.keyTap(myKey);
    }
  },

  keyToggle: function(key, keyUpDown, modifier) {
    if (modifier) {
      robot.keyToggle(key, keyUpDown, modifier);
    } else {
      robot.keyToggle(key, keyUpDown);
    }
  },

  typeString: function(string) {
    var myCharArray = string.split('');
    var myShiftCharArray = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', ':', '"', '<', '>', '?'];
    myCharArray.forEach(function(myChar) {
      if (myShiftCharArray.indexOf(myChar) >= 0) {
        robot.keyTap(myChar, 'shift');
      } else {
        robot.typeString(myChar);
      }
    });
  },


  moveMouse: function(xOffset, yOffset) {
    robot.moveMouse(xOffset, yOffset);
  },

  mouseClick: function(button, double) {
    robot.mouseClick(button, double);
  },

  getMousePos: function() {
    return robot.getMousePos();
  },

  getXDisplayName: function() {
    return robot.getXDisplayName();
  },

  typeStringDelayed: function(string, defaultCPM) {
    robot.typeStringDelayed(string, defaultCPM);
  }
}
