const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const { When } = require('cucumber');
When(/^I download the (PDF) file by clicking "([^"]*)"$/, {timeout: 60*1000 * 2}, function (fileType, imageName) {
    // delete previous download file
    var downloadUrl = browser.getUrl();
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    this.fs_session.deleteDownloadFile(fileName, fileExt);
    
    // process PDF download icon
    const parsedImageNameOne = parseExpectedText(imageName);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = this.fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = this.fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);

    // shake mouse to induce the display of PDF download icon
    this.screen_session.moveMouse(0, 0);
    this.screen_session.moveMouse(100, 100);
    this.screen_session.moveMouse(0, 0);
    this.screen_session.moveMouse(100, 100);
    // click PDF download icon
    var screenActionResultOne;
    screenActionResultOne = JSON.parse(this.screen_session.screenClickImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(screenActionResultOne.length).not.toEqual(0, 'failed to click PDF download icon');

    // process FileSave_button
    const parsedImageNameTwo = parseExpectedText('FileSave_button:save');
    const [imageFileNametwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = this.fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = this.fs_session.globalSearchImageList(__dirname, imageFileNametwo, imageFileExtTwo);
    // click FileSave_button
    screenActionResult = JSON.parse(this.screen_session.screenClickImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(screenActionResult.length).not.toEqual(0, 'failed to click FileSave button');
    const downloadFilePath = this.fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
  });



