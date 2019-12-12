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
  runFindImage: function(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax) {
    var outputBuffer;
    var outputString;
    var returnVal;
    try {
      outputBuffer = execSync(FrameworkPath + '/framework/libs/find_image.js'
                        + ' --onArea=' + onArea
                        + ' --imagePath=' + imagePath
                        + ' --imageSimilarity=' + imageSimilarity
                        + ' --imageWaitTime=' + imageWaitTime
                        + ' --imageAction=' + imageAction
                        + ' --imageFindAll=' + imageFindAll
                        + ' --imageSimilarityMax=' + imageSimilarityMax);
      outputString = outputBuffer.toString('utf8');
      console.log(outputString);
      returnVal = outputString.substring(outputString.lastIndexOf('['), outputString.lastIndexOf(']') + 1);
    } catch(e){
      returnVal = '["execSyncError": ' + e.message + ']';
    }
    return returnVal;
  },

  findImageFromList: function(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax, listStrategy) {
    // listStrategy to be one of:
    // firstMatch,
    // bestMatch,
    // allMatchSorted (default)
    var runResultString;
    var runResultJson = []
    var returnVal = [];
    if (typeof(imagePath) === 'object') {
      for (let singlePath of imagePath) {
        runResultString = this.runFindImage(onArea, singlePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax);
        if (!runResultString.includes('notFound') && !runResultString.includes('execSyncError')) {
          runResultJson = JSON.parse(runResultString);
        }
        if (runResultJson.length > 0 && listStrategy == 'firstMatch') {
          returnVal = [...runResultJson];
          break; // break for loop
        } else if (runResultJson.length > 0 && listStrategy == 'bestMatch') {
          if (returnVal.length == 0 || returnVal[0].score < runResultJson.score) {
            returnVal = [...runResultJson];
          }
        } else if (runResultJson.length > 0) {
          returnVal = returnVal.concat(runResultJson);
        }
      };
    } else {
      runResultString = this.runFindImage(onArea, imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax);
      if (!runResultString.includes('notFound') && !runResultString.includes('execSyncError')) {
        runResultJson = JSON.parse(runResultString);
      }
      returnVal = [...runResultJson];
    }
    // sort base on returnVal.score from npmhigh to low
    if (returnVal.length > 0) {
      returnVal.sort((a, b) => { return (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0 })
    }
    // console.log(runResultString);
    // console.log(JSON.stringify(runResultJson));
    // console.log(JSON.stringify(returnVal));
    return JSON.stringify(returnVal);
  },

  screenFindAllImages: function (imagePath, imageSimilarity, imageWaitTime, imageAction, imageFindAll, imageSimilarityMax) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, null, true, imageSimilarityMax);
    return returnVal;
  },

  screenFindImage: function(imagePath, imageSimilarity, imageWaitTime, imageAction) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, imageAction);
    return returnVal;
  },

  screenWaitImage: function(imagePath, imageSimilarity, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime);
    return returnVal;
  },

  screenHoverImage: function(imagePath, imageSimilarity, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, 'hover');
    return returnVal;
  },

  screenClickImage: function(imagePath, imageSimilarity, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, 'single');
    return returnVal;
  },

  screenDoubleClickImage: function(imagePath, imageSimilarity, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, 'double');
    return returnVal;
  },

  screenRightClickImage: function(imagePath, imageSimilarity, imageWaitTime) {
    var returnVal = this.findImageFromList('onScreen', imagePath, imageSimilarity, imageWaitTime, 'right');
    return returnVal;
  },

  screenHoverCenter: function() {
    var returnVal = this.findImageFromList('onScreen', 'center', null, null, 'hover');
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
    robot.moveMouse(object.x, object.y);
    robot.mouseToggle('down');
    robot.dragMouse(object.x+10, object.y);
    robot.dragMouse(target.x-10, target.y);
    robot.mouseToggle('up');
  },

  moveMouse: function(xOffset, yOffset) {
    robot.moveMouse(xOffset, yOffset);
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
