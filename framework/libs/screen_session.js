// screen_session.js provides functions to see the screen, to control keyboard and mouse

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const robot = require('robotjs');
const java = require('java');
const fs = require('fs');
const execSync = require('child_process').execSync;

// Sikuli Property
const sikuliApiJar = FrameworkPath + '/framework/libs/sikulixapi-1.1.4.jar';
if (!fs.existsSync(sikuliApiJar) || fs.statSync(sikuliApiJar).size == 0) {
  execSync(FrameworkPath + '/framework/libs/downloadSikulixApiJar.js');
}
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
  findImage: function(onArea, imagePath, imageSimilarity, clickImage, imageFindAll) {
    var imageSimilarity = imageSimilarity || 0.8;
    var clickImage = clickImage || false; 
    var imageFindAll = imageFindAll || false;
    var findRegion;

    switch (onArea) {
      case 'onFocus':
      case 'onFocused':
        findRegion = App.focusedWindowSync();
        break;
      case 'onScreen':
      default:
        findRegion = new Screen();
    }

    var sim_java = java.newFloat(imageSimilarity);
    var pat = new Pattern(imagePath);
    var returnArray = [];

    try {
      if (imageFindAll) {
        var find_results = findRegion.findAllSync(pat.similarSync(sim_java));
        while (find_results.hasNextSync()) {
          var find_item = find_results.nextSync();
          var returnItem = {dimention: null, location: null};
          returnItem.dimention = {width: find_item.w, height: find_item.h};
          returnItem.location = {x: find_item.x, y: find_item.y};
          returnArray.push(returnItem); 
        }
      } else {
        var find_item = findRegion.findSync(pat.similarSync(sim_java));
        var returnItem = {dimention: null, location: null};
        returnItem.dimention = {width: find_item.w, height: find_item.h};
        returnItem.location = {x: find_item.x, y: find_item.y};
        returnArray.push(returnItem);         
        switch (clickImage) {
          case (true):
          case 'true':
          case 'single':
            findRegion.clickSync(pat.similarSync(sim_java));
          break;
          case 'double':
            findRegion.doubleClickSync(pat.similarSync(sim_java));
          break;
          case 'right':
            findRegion.rightClickSync(pat.similarSync(sim_java));
        }
      }
      return JSON.stringify(returnArray);
    } catch(e) {
      // console.log(e.message);
      return 'not found';
    }
  },

  runFindImage: function(onArea, imagePath, imageSimilarity, clickImage, imageFindAll) {
    var outputBuffer = execSync(FrameworkPath + '/framework/libs/find_image.js'
                      + ' --onArea=' + onArea
                      + ' --imagePath=' + imagePath
                      + ' --imageSimilarity=' + imageSimilarity
                      + ' --clickImage=' + clickImage
                      + ' --imageFindAll' + imageFindAll);
    var outputString = outputBuffer.toString('utf8');
    var returnVal = outputString;
    return returnVal;
  },

  focusedFindImage: function(imagePath, imageSimilarity, clickImage, imageFindAll) {
    var returnVal = this.runFindImage('onFocused', imagePath, imageSimilarity, clickImage, imageFindAll);
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

  screenFindImage: function(imagePath, imageSimilarity, clickImage, imageFindAll) {
    var returnVal = this.runFindImage('onScreen', imagePath, imageSimilarity, clickImage, imageFindAll);
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
