// fs_session.js provides functions to read and write the Downlaods folder of the target system (local or remote)
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkSupportPath = FrameworkPath + '/framework/support';
const ProjectPath = process.env.PROJECTRUNPATH;
const ProjectSupportPath = ProjectPath + '/project/support';
const ModulePath = ProjectPath + '/' + process.env.ThisModule;
const ModuleSupportPath = ModulePath + '/support';
const DownloadPathLocal = process.env.DownloadPathLocal;
const fs = require('fs');
const glob = require("glob");
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const execSync = require('child_process').execSync;

module.exports = {
  getTestFileFullPath: function(fileName, fileExt) {
    var testFileExt = fileExt || ['json'];
    var testFileFullPath = null;

    // Search order: Module, Project, Support, will return null if not found
    if (testFileFullPath == null && process.env.PROJECTNAME && process.env.ThisModule) {
      testFileExt.some(function(ext) {
        var filePath = ModuleSupportPath + '/testfiles/' + fileName + '.' + ext;
        if (fs.existsSync(filePath)) testFileFullPath = filePath;
      })
    }
    if (testFileFullPath == null && process.env.PROJECTNAME) {
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

  getTestImageParms: function(imageName) {
    const imageName_extSplit = imageName.split(':')[0].split('.');
    const imageSimilarity = imageName.split(':')[1] || process.env.imageSimilarity;
    const imageFileExt = imageName_extSplit.length > 1 ? imageName_extSplit.pop() : null;
    const imageFileName = imageName_extSplit.join('.');
    return [imageFileName, imageFileExt, imageSimilarity];
  },

  getTestImageList: function(filePath, fileName, fileExt) {
    var imageExt = fileExt || ['gif', 'jpg', 'png'];
    var targetPath = filePath;
    var imageList = [];

    // TESTIMAGE/
    if (fs.existsSync(targetPath)) {
      imageExt.some(function(ext) {
        var filePathExact = targetPath + '/' + fileName + '.' + ext;
        var filePathMatch = targetPath + '/' + fileName + '.*.' + ext;
        [filePathExact, filePathMatch].forEach((path) => {
          imageList = imageList.concat(glob.sync(path));
        });
      });
    }
    return imageList;
  },

  getModuleImageList: function(fileName, fileExt) {
    var targetPath = ModuleSupportPath + '/testimages';
    var imageList = this.getTestImageList(targetPath, fileName, fileExt);
    return imageList;
  },

  getProjectImageList: function(fileName, fileExt) {
    var targetPath = ProjectSupportPath + '/testimages';
    var imageList = this.getTestImageList(targetPath, fileName, fileExt);
    return imageList;
  },

  getFrameworkImageList: function(fileName, fileExt) {
    var targetPath = FrameworkSupportPath + '/testimages';
    var imageList = this.getTestImageList(targetPath, fileName, fileExt);
    return imageList;
  },  

  globalSearchImageList: function(filePath, fileName, fileExt) {
    // Search order: current, Module, Project, Support, will return [] if not found
    var imageList = this.getTestImageList(filePath, fileName, fileExt);
    if (imageList.length == 0) {
      imageList = this.getModuleImageList(fileName, fileExt);
    }
    if (imageList.length == 0) {
      imageList = this.getProjectImageList(fileName, fileExt);
    }
    if (imageList.length == 0) {
      imageList = this.getFrameworkImageList(fileName, fileExt);
    }
    return imageList;
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