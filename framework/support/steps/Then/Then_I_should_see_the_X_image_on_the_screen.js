const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(/^I should(?: still)?( not)* see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (falseCase, imageName) {
    const parsedImageName = parseExpectedText(imageName);
    const [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedImageName);
    const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
    const imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedImageName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
    var screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
    console.log(screenFindResult);
    if (falseCase) {
      expect(screenFindResult.length).toEqual(0, `expect image ${parsedImageName} not on the screen but found.`);
    } else {
      expect(screenFindResult.length).not.toEqual(0, `expect image ${parsedImageName} on the screen but not found.`);
      this.lastSeen_screenFindResult = screenFindResult;
      // console.log(this.lastSeen_screenFindResult);
    }
  });
};
