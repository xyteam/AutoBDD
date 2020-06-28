const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { When } = require('cucumber');
When(/^I drag "([^"]*)" and drop to "([^"]*)"$/, function (imageNameOne, imageNameTwo) {
    // re imageNameOne
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = fs_session.getTestImageParms(parsedImageNameOne);
    var imagePathListOne;
    if (imageFileNameOne.includes('Screen')) {
      imagePathListOne = imageFileNameOne;
    } else {
      imagePathListOne = fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    }
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = fs_session.getTestImageParms(parsedImageNameTwo);
    var imagePathListTwo;
    if (imageFileNameTwo.includes('Screen')) {
      imagePathListTwo = imageFileNameTwo;
    } else {
      imagePathListTwo = fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);
    }

    var locationOne = JSON.parse(screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
    var locationTwo = JSON.parse(screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
    screen_session.drag_and_drop(locationOne[0].center, locationTwo[0].center);
    browser.pause(1000);
  });


