const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(/^I should(?: still)?( not)* see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (falseCase, imageName) {
    var parsedImageName = parseExpectedText(imageName);
    const [imageFileName, imageFileExt, imageSimilarity, imageSimilarityMax] = this.fs_session.getTestImageParms(parsedImageName);
    const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
    const imageScore = this.lastImage && this.lastImage.imageName == parsedImageName ? this.lastImage.imageScore : imageSimilarity;
    const imageWaitTime = 1;
    browser.pause(500);
    var resultString = this.screen_session.screenFindImage(imagePathList, imageScore, imageWaitTime);
    expect(typeof resultString).not.toBe('undefined');
    expect(resultString).not.toContain('error');
    if (falseCase) {
      expect(resultString).toContain('not found', `expect image ${parsedImageName} not on the screen but found.`);
    } else {
      expect(resultString).not.toContain('not found', `expect image ${parsedImageName} on the screen but not found.`);
      var resultArray = JSON.parse(resultString);
      this.lastImage = {
        'imageName': parsedImageName,
        'imageLocation': resultArray[0].location,
        'imageScore': resultArray[0].score
      }
      // console.log(this.lastImage);
    }
  });
};
