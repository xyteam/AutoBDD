const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const { When } = require('cucumber');
When(/^I drag "([^"]*)" and drop to "([^"]*)"$/, function (imageNameOne, imageNameTwo) {
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = this.fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = this.fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = this.fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = this.fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);

    var locationOne = JSON.parse(this.screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
    var locationTwo = JSON.parse(this.screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
    this.screen_session.drag_and_drop(locationOne[0].center, locationTwo[0].center);
    browser.pause(1000);
  });


