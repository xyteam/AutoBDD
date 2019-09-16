module.exports = function() {
  this.When(/^I download the (XLS|PDF) file by going to URL "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS * 2}, function (fileType, downloadUrl) {
    // delete previous download file
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    this.fs_session.deleteDownloadFile(fileName, fileExt);

    // download file from URL
    browser.url(downloadUrl)
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
    // pass download Url for steps after
    this.downloadUrl = downloadUrl;
  });
};
