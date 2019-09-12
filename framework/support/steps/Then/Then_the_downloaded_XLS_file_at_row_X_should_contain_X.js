module.exports = function() {
  this.Then(/^the downloaded XLS file at row (\d+) should contain "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (rowNum, expectedText) {
    // get downloaded filename
    var xlsData = this.fs_session.readXlsData(this.downloadFilePath).filter(row => row.length > 0);
    console.log(xlsData[rowNum])
    expect(xlsData[rowNum]).toContain(expectedText);
  });
};
