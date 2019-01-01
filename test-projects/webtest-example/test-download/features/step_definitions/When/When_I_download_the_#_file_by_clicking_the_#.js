module.exports = function() {
  this.When(/^I download the (PDF) file by clicking "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (fileType, imageName) {
    // delete previous download file
    var downloadUrl = browser.getUrl();
    var fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.'));
    var fileExt = downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1);
    this.fs_session.deleteDownloadFile(fileName, fileExt);

    // click PDF download icon
    var imageFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, imageName);
    var imageSimilarity = process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    console.log(imageFullPath);
    // shake mouse to induce the display of PDF download icon
    this.screen_session.moveMouse(0, 0);
    this.screen_session.moveMouse(100, 100);
    var resultString = this.screen_session.screenFindImage(imageFullPath, imageSimilarity, imageWaitTime, 'single');
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    // click LinuxSave_button
    var saveButtonFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, 'LinuxSave_button');
    var resultString = this.screen_session.screenFindImage(saveButtonFullPath, imageSimilarity, imageWaitTime,'single');
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
  });
};
