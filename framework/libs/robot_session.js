const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/Proto';
const robot = require('robotjs');
const execSync = require('child_process').execSync;

robot.setXDisplayName(process.env.DISPLAY);
robot.setMouseDelay(50);
robot.setKeyboardDelay(50);

module.exports = {

  findImage: function(imagePath, imageName, click) {
    var image_path = imagePath || FrameworkPath + '/global/step_images/' + process.env.PLATFORM;
    var image_fullPath = image_path + '/' + imageName;
    var findImage_JS = FrameworkPath + '/global/libs/find_image.js';
    var command_line = 'node ' + findImage_JS + ' ' + image_fullPath;

    if (this.fileExisting(image_fullPath)) {
      var cmd_result = execSync(command_line).toString();
      var find_result = cmd_result.substring(cmd_result.indexOf('\n') + 1);
      if (find_result.includes('nodeJava_org_sikuli_script_Match')) {
        var find_coordinate = find_result.substring(find_result.indexOf(' ') + 1);
        return find_coordinate;
      }
    }
    return null;
  },

  clickImage: function(imagePath, imageName) {
    var image_path = imagePath || FrameworkPath + '/global/step_images/' + process.env.PLATFORM;
    var image_fullPath = image_path + '/' + imageName;
    var clickImage_JS = FrameworkPath + '/global/libs/click_image.js';
    var command_line = 'node ' + clickImage_JS + ' ' + image_fullPath;

    if (this.fileExisting(image_fullPath)) {
      var cmd_result = execSync(command_line).toString();
      var click_result = cmd_result.substring(cmd_result.indexOf('\n') + 1);
      if (click_result.includes('CLICK on L')) {
        var click_coordinate;
        click_coordinate = click_result.substring(click_result.indexOf('CLICK on L') + 10);
        click_coordinate = click_coordinate.substring(0, click_coordinate.indexOf('] (') + 1);
        return click_coordinate;
      }
    }
    return null;
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
  },

  clickAndEnter: function(browser, linkToClick) {
    browser.waitForExist(linkToClick, 15000);
    try {
      browser.click(linkToClick)
      try {
        browser.pause(1000);
      } catch(e) {}
    } catch(e) {}
    robot.keyTap('enter');
  }

}
