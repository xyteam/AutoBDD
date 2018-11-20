// screen_session.js provides functions to see the screen, to control keyboard and mouse

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const myDISPLAY = process.env.DISPLAY || ':0';
const robot = require('robotjs');
const java = require('java');
const fs = require('fs');
const execSync = require('child_process').execSync;

// Sikuli Property
const sikuliApiJar = FrameworkPath + '/framework/libs/sikulixapi-latest.jar';
java.classpath.push(sikuliApiJar);
if (!fs.existsSync(sikuliApiJar) || fs.statSync(sikuliApiJar).size == 0) {
  execSync(FrameworkPath + '/framework/libs/downloadSikulixApiJar.js');
}
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
    var returnVal = [];
    var find_result;

    try {
      if (imageFindAll) {
        find_result = findRegion.findAllSync(pat.similarSync(sim_java));
        while (find_result.hasNextSync()) {
          returnVal.push(find_result.nextSync()); 
        }
      } else {
        find_result = findRegion.findSync(pat.similarSync(sim_java));
        returnVal.push(find_result);
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
      return returnVal
    } catch(e) {
      console.log(e.message);
      return false;
    }
  },

  screenFindImage: function(imagePath, imageSimilarity, clickImage, imageFindAll) {
    var returnVal = this.areaFindImage('onScreen', imagePath, imageSimilarity, clickImage, imageFindAll);
    return returnVal
  },

  screenClickImage: function(imagePath, imageSimilarity) {
    this.screenFindImage(imagePath, imageSimilarity, 'single');
  },

  screenDoubleClickImage: function(imagePath, imageSimilarity) {
    this.screenFindImage(imagePath, imageSimilarity, 'double');
  },

  screenRightClickImage: function(imagePath, imageSimilarity) {
    this.screenFindImage(imagePath, imageSimilarity, 'right');
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
