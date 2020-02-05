// screen_session.js provides functions to see the screen, to control keyboard and mouse

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const robot = require('robotjs');
const execSync = require('child_process').execSync;

// Robot Property
robot.setXDisplayName(process.env.DISPLAY);
robot.setMouseDelay(1000);
robot.setKeyboardDelay(50);
const defaultCPM = process.env.robotDefaultCPM || 600;

module.exports = {
  runFindImage: function(onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) {
    var outputBuffer;
    var outputString;
    var returnVal;
    var runCommand = FrameworkPath + '/framework/libs/find_image.js'
                    + ' --onArea=' + onArea
                    + ' --imagePath=' + imagePath
                    + ' --imageSimilarity=' + imageSimilarity
                    + ' --maxSimilarityOrText=' + maxSimilarityOrText
                    + ' --imageWaitTime=' + imageWaitTime
                    + ' --imageAction=' + imageAction
                    + ' --imageMaxCount=' + imageMaxCount;
    try {
      // display run command for debugging
      console.log(runCommand);
      outputBuffer = execSync(runCommand);
      outputString = outputBuffer.toString('utf8');
      returnVal = outputString.substring(outputString.lastIndexOf('[{'), outputString.lastIndexOf('}]') + 2);
    } catch(e){
      returnVal = '[{execSyncError: ' + e.message + '}]';
    }
    return returnVal;
  },

  findImageFromList: function(onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount, listStrategy) {
    // listStrategy to be one of:
    // firstMatch, //default
    // bestMatch,
    var myListStrategy = listStrategy || 'firstMatch';
    var runResultString;
    var runResultJson = []
    var returnVal = [];
    if (typeof(imagePath) === 'object') {
      for (let singlePath of imagePath) {
        console.log(singlePath);
        runResultString = this.runFindImage(onArea, singlePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
        if (!runResultString.includes('notFound') && !runResultString.includes('execSyncError')) {
          runResultJson = JSON.parse(runResultString);
        }
        if (runResultJson.length > 0 && myListStrategy == 'firstMatch') {
          returnVal = [...runResultJson];
          break; // break for loop
        } else if (runResultJson.length > 0 && myListStrategy == 'bestMatch') {
          if (returnVal.length == 0 || returnVal[0].score < runResultJson.score) {
            returnVal = [...runResultJson];
          }
        }
      };
    } else {
      runResultString = this.runFindImage(onArea, imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
      if (!runResultString.includes('notFound') && !runResultString.includes('execSyncError')) {
        runResultJson = JSON.parse(runResultString);
      }
      returnVal = [...runResultJson];
    }
    // sort base on returnVal.score from high to low
    if (returnVal.length > 1) {
      returnVal.sort((a, b) => { return (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0 })
    }
    // console.log(JSON.stringify(runResultJson));
    console.log(JSON.stringify(returnVal));
    return JSON.stringify(returnVal);
  },

  screenFindAllImages: function (imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
    return returnVal;
  },

  screenWaitImage: function (imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, null, 1);
    return returnVal;
  },

  screenFindImage: function (imagePath, imageSimilarity, maxSimilarityOrText) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, null, null, 1);
    return returnVal;
  },

  screenHoverImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, null, 'hover', 1);
    return returnVal;
  },

  screenClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, null, 'single', 1);
    return returnVal;
  },

  screenDoubleClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, null, 'double', 1);
    return returnVal;
  },

  screenRightClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, maxSimilarityOrText, null, 'right', 1);
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

  typeString: function(string, cpm) {
    const myCPM = cpm || defaultCPM;
    var myCharArray = string.split('');
    var myShiftCharArray = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', ':', '"', '<', '>', '?'];
    myCharArray.forEach(function(myChar) {
      if (myShiftCharArray.indexOf(myChar) >= 0) {
        robot.keyTap(myChar, 'shift');
      } else {
        robot.typeStringDelayed(myChar, myCPM);
      }
    });
  },

  drag_and_drop(object, target) {
    robot.moveMouseSmooth(object.x, object.y);
    robot.mouseToggle('down');
    robot.dragMouse(object.x+10, object.y);
    robot.dragMouse(target.x-10, target.y);
    robot.mouseToggle('up');
  },

  moveMouseSmooth: function(xOffset, yOffset) {
    robot.moveMouseSmooth(xOffset, yOffset);
  },

  dragMouse: function(xOffset, yOffset) {
    robot.dragMouse(xOffset, yOffset);
  },

  mouseClick: function(button, double) {
    robot.mouseClick(button, double);
  },

  mouseToggle: function([down], [button]) {
    robot.mouseToggle([down], [button]);
  },

  getMousePos: function() {
    return robot.getMousePos();
  },

  getXDisplayName: function() {
    return robot.getXDisplayName();
  },
}