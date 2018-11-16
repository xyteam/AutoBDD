// screen_session.js provides functions to see the screen, to control keyboard and mouse

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const myDISPLAY = process.env.DISPLAY || ':0';
const robot = require('robotjs');
const java = require('java');
const execSync = require('child_process').execSync;

// Sikuli Property
const sikuliApiJar = 'sikulixapi-latest.jar';
java.classpath.push(sikuliApiJar);
const Screen = java.import('org.sikuli.script.Screen');
const Pattern = java.import('org.sikuli.script.Pattern');
// Robot Property
robot.setXDisplayName(process.env.DISPLAY);
robot.setMouseDelay(50);
robot.setKeyboardDelay(50);

module.exports = {

  findImage: function(imagePath, imageSimilarity, clickImage, imageFindAll) {
    var sc = new Screen();
    var sim_java = java.newFloat(imageSimilarity);
    var pat = new Pattern(imagePath);
    var returnVal = [];
    var find_result;

    if (imageFindAll) {
      find_result = sc.findAllSync(pat.similarSync(sim_java));
      while (find_result.hasNextSync()) {
        returnVal.push(find_result.nextSync()); 
      }
    } else {
      find_result = sc.findSync(pat.similarSync(sim_java));
      returnVal.push(find_result);
      switch (clickImage) {
        case (true):
        case 'true':
        case 'single':
          sc.clickSync(pat.similarSync(sim_java));
        break;
        case 'double':
          sc.doubleClickSync(pat.similarSync(sim_java));
        break;
        case 'right':
          sc.rightClickSync(pat.similarSync(sim_java));
      }
    }
    return returnVal
  },

  clickImage: function(imagePath, imageSimilarity) {
    this.findImage(imagePath, imageSimilarity, 'single');
  },

  doubleClickImage: function(imagePath, imageSimilarity) {
    this.findImage(imagePath, imageSimilarity, 'double');
  },

  rightClickImage: function(imagePath, imageSimilarity) {
    this.findImage(imagePath, imageSimilarity, 'right');
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
