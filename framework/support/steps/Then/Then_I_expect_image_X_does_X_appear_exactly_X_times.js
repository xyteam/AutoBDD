module.exports = function() {
  this.Then(
    /^I expect (?:that )?image "([^"]*)?" does( not)* appear (more than|less than|exactly) "([^"]*)?" time(?:s)?$/,
    {timeout: process.env.StepTimeoutInMS},
    function (imageName, falseCase, compareAction, expectedNumber) {
      const [imageFileName, imageFileExt, imageSimilarity] = this.fs_session.getTestImageParms(imageName);
      const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
      const imageScore = this.lastImage && this.lastImage.imageName == imageName ? this.lastImage.imageScore : imageSimilarity;
      const imageWaitTime = 1;
      browser.pause(500);
      const resultString = this.screen_session.screenFindImage(imagePathList, imageScore, imageWaitTime, null, true);
      console.log(typeof JSON.parse(resultString));
      console.log(JSON.parse(resultString));
      const appearanceNumber = JSON.parse(resultString).length;
      switch (compareAction) {
        case 'more than':
          if (falseCase) {
            expect(appearanceNumber).not.toBeGreaterThan(parseInt(expectedNumber));
          }
          else {
            expect(appearanceNumber).toBeGreaterThan(parseInt(expectedNumber))
          }
          break;
        case 'less than':
          if (falseCase) {
            expect(appearanceNumber).not.toBeLessThan(parseInt(expectedNumber));
          }
          else {
            expect(appearanceNumber).toBeLessThan(parseInt(expectedNumber))
          }
          break;
        case 'exactly':
        default:
          if (falseCase) {
            expect(appearanceNumber).not.toEqual(parseInt(expectedNumber));
          }
          else {
            expect(appearanceNumber).toEqual(parseInt(expectedNumber))
          }
      }
    }
  );
};
