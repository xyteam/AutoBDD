const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { When } = require('cucumber');
When(/^I download the (XLS|PDF) file by going to URL "([^"]*)"$/, {timeout: 60*1000 * 2}, function (fileType, downloadUrl) {
    // delete previous download file
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    fs_session.deleteDownloadFile(fileName, fileExt);

    // download file from URL
    browser.url(downloadUrl)
    var downloadFilePath = fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
    // pass download Url for steps after
    this.downloadUrl = downloadUrl;
  });


