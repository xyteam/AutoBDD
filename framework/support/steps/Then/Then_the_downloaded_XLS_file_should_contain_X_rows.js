module.exports = function() {
  this.Then(/^the downloaded XLS file should contain (\d+) rows$/, {timeout: process.env.StepTimeoutInMS}, function (rowCount) {
    // get downloaded filename
    var downloadUrl = this.downloadUrl;
    console.log(downloadUrl);
    var fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.'));
    var fileExt = downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1);
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    var xlsData = this.fs_session.readXlsData(downloadFilePath);
    expect(xlsData.length).toEqual(parseInt(rowCount));
  });
};
