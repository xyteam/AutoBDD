const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { When } = require('cucumber');
When(/^I download the (PDF) file by clicking "([^"]*)"$/, {timeout: 60*1000 * 2}, function (fileType, imageName) {
    // delete previous download file
    var downloadUrl = browser.getUrl();
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    fs_session.deleteDownloadFile(fileName, fileExt);
    
    // process PDF download icon
    const parsedImageNameOne = parseExpectedText(imageName);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);

    // shake mouse to induce the display of PDF download icon
    screen_session.moveMouse(0, 0);
    screen_session.moveMouse(100, 100);
    screen_session.moveMouse(0, 0);
    screen_session.moveMouse(100, 100);
    // click PDF download icon
    var screenActionResultOne;
    screenActionResultOne = JSON.parse(screen_session.screenClickImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(screenActionResultOne.length).not.toEqual(0, 'failed to click PDF download icon');

    // process FileSave_button
    const parsedImageNameTwo = parseExpectedText('FileSave_button:save');
    const [imageFileNametwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = fs_session.globalSearchImageList(__dirname, imageFileNametwo, imageFileExtTwo);
    // click FileSave_button
    screenActionResult = JSON.parse(screen_session.screenClickImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(screenActionResult.length).not.toEqual(0, 'failed to click FileSave button');
    const downloadFilePath = fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
  });



