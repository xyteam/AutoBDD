const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(/^I should(?: still)?( not)* see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (falseCase, imageName) {
    const parsedImageName = parseExpectedText(imageName);
    const [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedImageName);
    const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
    const imageScore = this.lastImage && this.lastImage.imageName == parsedImageName ? this.lastImage.imageScore : imageSimilarity;
    browser.pause(500);
    var screenFindResult = JSON.parse(this.screen_session.screenFindAllImages(imagePathList, imageScore, maxSimilarityOrText));
    console.log(screenFindResult);
    if (falseCase) {
      expect(screenFindResult.length).toEqual(0, `expect image ${parsedImageName} not on the screen but found.`);
    } else {
      expect(screenFindResult.length).not.toEqual(0, `expect image ${parsedImageName} on the screen but not found.`);
      this.lastImage = {
        'imageName': parsedImageName,
        'imageLocation': screenFindResult[0].location,
        'imageScore': screenFindResult[0].score
      }
      // console.log(this.lastImage);
    }
  });
};
