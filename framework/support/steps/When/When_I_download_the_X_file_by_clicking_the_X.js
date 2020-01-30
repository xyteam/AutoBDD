module.exports = function() {
  this.When(/^I download the (PDF) file by clicking "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS * 2}, function (fileType, imageName) {
    // delete previous download file
    var downloadUrl = browser.getUrl();
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    this.fs_session.deleteDownloadFile(fileName, fileExt);

    // click PDF download icon
    var imageFullPath = this.fs_session.globalSearchImageList(__dirname, imageName.split(':')[0]);
    var imageSimilarity = imageName.split(':')[1] || process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    var screenFindResult;
    // shake mouse to induce the display of PDF download icon
    this.screen_session.moveMouseSmooth(0, 0);
    this.screen_session.moveMouseSmooth(100, 100);
    this.screen_session.moveMouseSmooth(0, 0);
    this.screen_session.moveMouseSmooth(100, 100);
    screenFindResult = JSON.parse(this.screen_session.findImageFromList('onScreen', imageFullPath, imageSimilarity, imageWaitTime, 'single'));
    expect(screenFindResult.length).not.toEqual(0, 'failed to click PDF download icon');
    // click LinuxSave_button
    var saveButtonFullPath = this.fs_session.globalSearchImageList(__dirname, 'FileSave_button');
    // console.log(saveButtonFullPath);
    screenFindResult = JSON.parse(this.screen_session.findImageFromList('onScreen', saveButtonFullPath, (imageSimilarity * 0.6), imageWaitTime, 'single'));
    expect(screenFindResult.length).not.toEqual(0, 'failed to click FileSave button');
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
  });
};

