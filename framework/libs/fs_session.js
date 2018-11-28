// fs_session.js provides functions to read and write the Downlaods folder of the target system (local or remote)
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const ProjectPath = FrameworkPath + '/test-projects/' + process.env.ThisProject;
const ProjectImagePath = ProjectPath + '/global/test_images'
const fs = require('fs');

module.exports = {
  getTestImageFullPath: function(filePath, fileName, fileExt) {
    var imageExt = fileExt || ['gif', 'jpg', 'png'];
    var targetPath = filePath;
    var platformBrowserPath = '/' + process.env.PLATFORM + '/' + process.env.BROWSER;
    var platformOnlyPath = '/' + process.env.PLATFORM;
    var imageFullPath = null;

    if ((imageFullPath == null) && fs.existsSync(targetPath + platformBrowserPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformBrowserPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    } else if ((imageFullPath == null) && fs.existsSync(targetPath + platformOnlyPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformOnlyPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    } else if ((imageFullPath == null) && fs.existsSync(targetPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    return imageFullPath;
  },

  getLocalImageFullPath: function(filePath, fileName, fileExt) {
    var targetPath = filePath.substring(0, filePath.indexOf('step_definitions')) + 'test_images';
    var imageFullPath = this.getTestImageFullPath(targetPath, fileName, fileExt);
    return imageFullPath;
  },

  getGlobalImageFullPath: function(fileName, fileExt) {
    var targetPath = ProjectImagePath;
    var imageFullPath = this.getTestImageFullPath(targetPath, fileName, fileExt);
    return imageFullPath;
  },

  getLocalThenGlobalImageFullPath: function(filePath, fileName, fileExt) {
    var imageFullPath = this.getLocalImageFullPath(filePath, fileName, fileExt);
    if (!imageFullPath) {
      imageFullPath = this.getGlobalImageFullPath(fileName, fileExt);
    }
    return imageFullPath;
  }
}