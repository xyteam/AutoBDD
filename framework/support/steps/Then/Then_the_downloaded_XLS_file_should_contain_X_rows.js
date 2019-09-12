module.exports = function() {
  this.Then(/^the downloaded XLS file should contain (\d+) rows and (\d+) columns$/, {timeout: process.env.StepTimeoutInMS}, function (rowCount, columnCoung) {
    // get downloaded filename
    var downloadUrl = this.downloadUrl;
    console.log(downloadUrl);
    var fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.'));
    var fileExt = downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1);
    var downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    var xlsData = this.fs_session.readXlsData(downloadFilePath).filter(row => row.length > 0);
    if (rowCount) {
      expect(xlsData.length).toEqual(parseInt(rowCount));
    }
    if (columnCoung) {
      expect(xlsData[0].length).toEqual(parseInt(columnCoung));
    }
    // pass download file path to subsequent steps
    this.downloadFilePath = downloadFilePath;
  });
};
