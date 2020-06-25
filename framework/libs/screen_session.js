// screen_session.js provides functions to see the screen, to control keyboard and mouse

const robot = require('robotjs');
const execSync = require('child_process').execSync;

// Robot Property
robot.setXDisplayName(process.env.DISPLAY);
robot.setMouseDelay(50);
robot.setKeyboardDelay(50);
const defaultCPM = process.env.robotDefaultCPM || 600;

module.exports = {
  runFindImage: function(imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) {
    const maxSimOrText = (maxSimilarityOrText && maxSimilarityOrText != 'null' && maxSimilarityOrText != 'undefined') ? maxSimilarityOrText : 1;
    const maxSim = parseFloat(maxSimOrText) || 1;
    const textHint = isNaN(maxSimOrText) ? maxSimOrText : '';
    var outputBuffer;
    var outputString;
    var returnVal;
    var runCommand = 'findTargetImage.js'
                    + ' --imagePath=' + imagePath
                    + ' --imageSimilarity=' + imageSimilarity
                    + ' --maxSim=' + maxSim
                    + ' --textHint="' + textHint + '"'
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
    const returnString = JSON.stringify(JSON.parse(returnVal));
    return returnString;
  },

  findImageFromList: function(imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount, listStrategy) {
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
        runResultString = this.runFindImage(singlePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
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
      runResultString = this.runFindImage(imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
      if (!runResultString.includes('notFound') && !runResultString.includes('execSyncError')) {
        runResultJson = JSON.parse(runResultString);
      }
      returnVal = [...runResultJson];
    }
    // sort base on returnVal.score from high to low
    if (returnVal.length > 1) {
      returnVal.sort((a, b) => { return (a.score > b.score) ? -1 : (a.score < b.score) ? 1 : 0 })
    }
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  screenFindAllImages: function (imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, imageAction, imageMaxCount);
    return returnString;
  },

  screenWaitImage: function (imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, imageWaitTime, null, 1);
    return returnString;
  },

  screenFindImage: function (imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, null, 1);
    return returnString;
  },

  screenHoverImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, 'hover', 1);
    return returnString;
  },

  screenClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, 'click', 1);
    return returnString;
  },

  screenHoverClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, 'hoverClick', 1);
    return returnString;
  },

  screenDoubleClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, 'doubleClick', 1);
    return returnString;
  },

  screenRightClickImage: function(imagePath, imageSimilarity, maxSimilarityOrText) {
    const returnString = this.findImageFromList(imagePath, imageSimilarity, maxSimilarityOrText, null, 'rightClick', 1);
    return returnString;
  },

  screenGetText: function() {
    var runCommand = 'getImageText.js'
    console.log(runCommand);
    const outputString = execSync(runCommand).toString('utf8');
    const returnString = outputString.substring(outputString.lastIndexOf('[{'), outputString.lastIndexOf('}]') + 2);
    return returnString;
  },

  keyTap: function(key, modifier) {
    const myKey = key || 'enter';
    if (modifier) {
      robot.keyTap(myKey, modifier);
    } else {
      robot.keyTap(myKey);
    }
  },

  keyToggle: function(key, keyUpDown, modifier) {
    const myKey = key || 'enter';
    if (keyUpDown && modifier) {
      robot.keyToggle(myKey, keyUpDown, modifier);
    } else if (keyUpDown) {
      robot.keyToggle(myKey, keyUpDown);
    } else if (modifier) {
      robot.keyTap(myKey, modifier);
    } else {
      robot.keyTap(myKey);
    }
  },

  typeString: function(string, cpm) {
    const myCPM = cpm || defaultCPM;
    var myCharArray = string.split('');
    // chars require shift
    var myShiftCharArray = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
                            '{', '}', '|', ':', '>', '?', '"'];
    myCharArray.forEach(function(myChar) {
      if (myShiftCharArray.indexOf(myChar) >= 0) {
        if (myChar == '"') {
          robot.keyTap('\'', 'shift');
        } else {
          robot.keyTap(myChar, 'shift');
        }
      } else {
        robot.typeStringDelayed(myChar, myCPM);
      }
    });
  },

  drag_and_drop(object, target) {
    robot.setMouseDelay(1000);
    robot.moveMouse(object.x, object.y);
    robot.mouseToggle('down');
    robot.dragMouse(object.x+10, object.y);
    robot.dragMouse(target.x-10, target.y);
    robot.mouseToggle('up');
  },

  moveMouse: function(xOffset, yOffset) {
    robot.moveMouse(xOffset, yOffset);
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
    const returnVal = robot.getMousePos();
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  getXDisplayName: function() {
    const returnVal = robot.getXDisplayName();
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },
}
