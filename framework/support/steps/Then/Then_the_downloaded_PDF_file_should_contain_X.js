module.exports = function() {
  this.Then(/^the downloaded PDF file should contain "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (expectedText) {
    // get downloaded filename
    var downloadUrl = browser.getUrl();
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    var pdfData = this.fs_session.readPdfData(downloadFilePath);
    expect(pdfData.text).toContain(expectedText);
  });
};
