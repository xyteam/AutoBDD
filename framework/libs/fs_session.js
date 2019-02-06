// fs_session.js provides functions to read and write the Downlaods folder of the target system (local or remote)
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkImagePath = FrameworkPath + 'framework/support/images';
const ProjectPath = FrameworkPath + '/test-projects/' + process.env.ThisProject;
const ProjectImagePath = ProjectPath + '/project/support/images'
const DownloadPathLocal = process.env.DownloadPathLocal;
const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const execSync = require('child_process').execSync;

module.exports = {
  getTestFileFullPath: function(filePath, fileName, fileExt) {
    var testFileExt = fileExt || ['json'];
    var targetPath = filePath;
    var testFileFullPath = null;

    testFileExt.some(function(ext) {
      var fileFullPath = targetPath + '/' + fileName + '.' + ext;
      if (fs.existsSync(fileFullPath)) testFileFullPath = fileFullPath;
    })
    return testFileFullPath;
  },

  getLocalTestFileFullPath: function(filePath, fileName, fileExt) {
    var targetPath = filePath.substring(0, filePath.indexOf('steps')) + 'files';
    var testFileFullPath = this.getTestFileFullPath(targetPath, fileName, fileExt);
    return testFileFullPath;
  },

  getTestImageFullPath: function(filePath, fileName, fileExt) {
    var imageExt = fileExt || ['gif', 'jpg', 'png'];
    var targetPath = filePath;
    var platformBrowserXVFBPath = '/' + process.env.PLATFORM + '/' + process.env.BROWSER + '/' + process.env.XVFB;
    var platformXVFBPath = '/' + process.env.PLATFORM + '/' + process.env.XVFB;
    var platformBrowserPath = '/' + process.env.PLATFORM + '/' + process.env.BROWSER;
    var platformOnlyPath = '/' + process.env.PLATFORM;
    var imageFullPath = null;

    // TESTIMAGE/PLATFORM/BROWSER/XVFB/
    if ((imageFullPath == null) && (process.env.XVFB == 'XVFB') && fs.existsSync(targetPath + platformBrowserXVFBPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformBrowserXVFBPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    // TESTIMAGE/PLATFORM/BROWSER/
    if ((imageFullPath == null) && fs.existsSync(targetPath + platformBrowserPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformBrowserPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    // TESTIMAGE/PLATFORM/XVFB/
    if ((imageFullPath == null) && (process.env.XVFB == 'XVFB') && fs.existsSync(targetPath + platformXVFBPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformXVFBPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    // TESTIMAGE/PLATFORM/
    if ((imageFullPath == null) && fs.existsSync(targetPath + platformOnlyPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + platformOnlyPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    // TESTIMAGE/
    if ((imageFullPath == null) && fs.existsSync(targetPath)) {
      imageExt.some(function(ext) {
        var fileFullPath = targetPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(fileFullPath)) imageFullPath = fileFullPath;
      });
    }
    return imageFullPath;
  },

  getLocalImageFullPath: function(filePath, fileName, fileExt) {
    var targetPath = filePath.substring(0, filePath.indexOf('steps')) + 'images';
    var imageFullPath = this.getTestImageFullPath(targetPath, fileName, fileExt);
    return imageFullPath;
  },

  getGlobalImageFullPath: function(fileName, fileExt) {
    var targetPath = ProjectImagePath;
    var imageFullPath = this.getTestImageFullPath(targetPath, fileName, fileExt);
    return imageFullPath;
  },

  getFrameworkImageFullPath: function(fileName, fileExt) {
    var targetPath = FrameworkImagePath;
    var imageFullPath = this.getTestImageFullPath(targetPath, fileName, fileExt);
    return imageFullPath;
  },  

  getLocalThenGlobalImageFullPath: function(filePath, fileName, fileExt) {
    var imageFullPath = this.getLocalImageFullPath(filePath, fileName, fileExt);
    if (!imageFullPath) {
      imageFullPath = this.getGlobalImageFullPath(fileName, fileExt);
    }
    return imageFullPath;
  },

  deleteDownloadFile: function(fileName, fileExt) {
    const fileFullPath = DownloadPathLocal + '/' + fileName + '.' + fileExt;
    const oldFilesFullPath = DownloadPathLocal + '/' + fileName + '\\ \\([0-9]*\\)' + '.' + fileExt;
    const rm_downloadFile_cmd = 'rm -f ' + fileFullPath + ' ' + oldFilesFullPath;
    execSync(rm_downloadFile_cmd);
  },

  checkDownloadFile: function(fileName, fileExt) {
    const fileFullPath = DownloadPathLocal + '/' + fileName + '.' + fileExt;
    while (!fs.existsSync(fileFullPath)) {
      browser.pause(1000);
    }
    return fileFullPath;
  },

  readPdfData: function(pdfFullPath) {
    const dataBuffer = fs.readFileSync(pdfFullPath);
    var pdfData = null;
    // pdfParse is an async function, need a while-wait statement for pdfData to be filled.
    pdfParse(dataBuffer).then(function(data) {
      pdfData = data;
    });
    while (pdfData == null) {
      browser.pause(1000);
    }
    return pdfData;
  },

  readXlsData: function(xlsFullPath) {
    const dataBuffer = fs.readFileSync(xlsFullPath);
    const workbook = XLSX.read(dataBuffer, {type:'buffer'});
    var  xlsData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header:1});
    return xlsData;
  }
}