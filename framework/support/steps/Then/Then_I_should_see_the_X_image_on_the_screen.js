module.exports = function() {
  this.Then(/^I should(?: still)?( not)* see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (falseCase, imageName) {
    const [imageFileName, imageFileExt, imageSimilarity] = this.fs_session.getTestImageParms(imageName);
    const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
    const imageScore = this.lastImage && this.lastImage.imageName == imageName ? this.lastImage.imageScore : imageSimilarity;
    const imageWaitTime = 1;
    browser.pause(500);
    var resultString = this.screen_session.screenFindImage(imagePathList, imageScore, imageWaitTime);
    expect(typeof resultString).not.toBe('undefined');
    expect(resultString).not.toContain('error');
    if (falseCase) {
      expect(resultString).toContain('not found', `expect image ${imageName} not on the screen but found.`);
    } else {
      expect(resultString).not.toContain('not found', `expect image ${imageName} on the screen but not found.`);
      var resultArray = JSON.parse(resultString);
      this.lastImage = {
        'imageName': imageName,
        'imageLocation': resultArray[0].location,
        'imageScore': resultArray[0].score
      }
      // console.log(this.lastImage);
    }
  });
};
