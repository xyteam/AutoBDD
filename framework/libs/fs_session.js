// fs_session.js provides functions to read and write the Downlaods folder of the target system (local or remote)
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkSupportPath = FrameworkPath + '/framework/support';
const ProjectPath = FrameworkPath + '/test-projects/' + process.env.ThisProject;
const ProjectSupportPath = ProjectPath + '/project/support'
const ModulePath = ProjectPath + '/' + process.env.ThisModule;
const ModuleSupportPath = ModulePath + '/support';
const DownloadPathLocal = process.env.DownloadPathLocal;
const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const execSync = require('child_process').execSync;

module.exports = {
  getTestFileFullPath: function(fileName, fileExt) {
    var testFileExt = fileExt || ['json'];
    var testFileFullPath = null;

    // Search order: Module, Project, Support, will return null if not found
    if (testFileFullPath == null && process.env.ThisProject && process.env.ThisModule) {
      testFileExt.some(function(ext) {
        var filePath = ModuleSupportPath + '/testfiles/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) testFileFullPath = filePath;
      })
    }
    if (testFileFullPath == null && process.env.ThisProject) {
      testFileExt.some(function(ext) {
        var filePath = ProjectSupportPath + '/testfiles/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) testFileFullPath = filePath;
      })
    }
    if (testFileFullPath == null && process.env.FrameworkPath) {
      testFileExt.some(function(ext) {
        var filePath = FrameworkSupportPath + '/testfiles/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) testFileFullPath = filePath;
      })
    }
    return testFileFullPath;
  },

  getTestImagePath: function(filePath, fileName, fileExt) {
    var imageExt = fileExt || ['gif', 'jpg', 'png'];
    var targetPath = filePath;
    var platformBrowserXVFBPath = '/' + process.env.PLATFORM + '/' + process.env.BROWSER + '/' + process.env.XVFB;
    var platformXVFBPath = '/' + process.env.PLATFORM + '/' + process.env.XVFB;
    var platformBrowserPath = '/' + process.env.PLATFORM + '/' + process.env.BROWSER;
    var platformOnlyPath = '/' + process.env.PLATFORM;
    var imagePath = null;

    // TESTIMAGE/PLATFORM/BROWSER/XVFB/
    if ((imagePath == null) && (process.env.XVFB == 'XVFB') && fs.existsSync(targetPath + platformBrowserXVFBPath)) {
      imageExt.some(function(ext) {
        var filePath = targetPath + platformBrowserXVFBPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) imagePath = filePath;
      });
    }
    // TESTIMAGE/PLATFORM/BROWSER/
    if ((imagePath == null) && fs.existsSync(targetPath + platformBrowserPath)) {
      imageExt.some(function(ext) {
        var filePath = targetPath + platformBrowserPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) imagePath = filePath;
      });
    }
    // TESTIMAGE/PLATFORM/XVFB/
    if ((imagePath == null) && (process.env.XVFB == 'XVFB') && fs.existsSync(targetPath + platformXVFBPath)) {
      imageExt.some(function(ext) {
        var filePath = targetPath + platformXVFBPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) imagePath = filePath;
      });
    }
    // TESTIMAGE/PLATFORM/
    if ((imagePath == null) && fs.existsSync(targetPath + platformOnlyPath)) {
      imageExt.some(function(ext) {
        var filePath = targetPath + platformOnlyPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) imagePath = filePath;
      });
    }
    // TESTIMAGE/
    if ((imagePath == null) && fs.existsSync(targetPath)) {
      imageExt.some(function(ext) {
        var filePath = targetPath + '/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) imagePath = filePath;
      });
    }
    return imagePath;
  },

  getModuleImagePath: function(filePath, fileName, fileExt) {
    var targetPath = ModuleSupportPath + '/testimages/';
    var imagePath = this.getTestImagePath(targetPath, fileName, fileExt);
    return imagePath;
  },

  getProjectImagePath: function(fileName, fileExt) {
    var targetPath = ProjectSupportPath + '/testimages/';
    var imagePath = this.getTestImagePath(targetPath, fileName, fileExt);
    return imagePath;
  },

  getFrameworkImagePath: function(fileName, fileExt) {
    var targetPath = FrameworkSupportPath + '/testimages/';
    var imagePath = this.getTestImagePath(targetPath, fileName, fileExt);
    return imagePath;
  },  

  globalSearchImagePath: function(filePath, fileName, fileExt) {
    // Search order: Module, Project, Support, will return null if not found
    var imagePath = this.getModuleImagePath(filePath, fileName, fileExt);
    if (!imagePath) {
      imagePath = this.getProjectImagePath(fileName, fileExt);
    }
    if (!imagePath) {
      imagePath = this.getFrameworkImagePath(fileName, fileExt);
    }
    return imagePath;
  },

  deleteDownloadFile: function(fileName, fileExt) {
    const filePath = DownloadPathLocal + '/' + fileName + '.' + fileExt;
    const oldFilesFullPath = DownloadPathLocal + '/' + fileName + '\\ \\([0-9]*\\)' + '.' + fileExt;
    const rm_downloadFile_cmd = 'rm -f ' + filePath + ' ' + oldFilesFullPath;
    execSync(rm_downloadFile_cmd);
  },

  checkDownloadFile: function(fileName, fileExt) {
    const filePath = DownloadPathLocal + '/' + fileName + '.' + fileExt;
    while (!fs.existsSync(filePath)) {
      browser.pause(1000);
    }
    return filePath;
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