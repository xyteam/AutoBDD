module.exports = function() {
  this.Then(
    /^I expect (?:that )?the image "([^"]*)?" does( not)* appear(?: (exactly|not exactly|more than|no more than|less than|no less than) (\d+) time(?:s)?)?$/,
    {timeout: process.env.StepTimeoutInMS},
    function (imageName, falseCase, compareAction, expectedNumber) {
      const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
      const myCompareAction = compareAction || ((typeof falseCase == 'undefined') ? 'more than' : 'exactly');
      const [imageFileName, imageFileExt, imageSimilarity, imageSimilarityMax] = this.fs_session.getTestImageParms(imageName);
      const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
      const imageScore = this.lastImage && this.lastImage.imageName == imageName ? this.lastImage.imageScore : imageSimilarity;
      const imageWaitTime = 1;
      browser.pause(500);
      const resultString = this.screen_session.screenFindAllImages(imagePathList, imageScore, imageWaitTime, null, true, imageSimilarityMax);
      var appearanceNumber;
      if (resultString.includes('not found')) {
        console.log('expected image does not show on screen');
        appearanceNumber = 0;
      } else {
        console.log(JSON.parse(resultString));
        appearanceNumber = JSON.parse(resultString).length;
      }
      switch (myCompareAction) {
        case 'exactly':
            expect(appearanceNumber).toEqual(parseInt(myExpectedNumber));
            break;
        case 'not exactly':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(appearanceNumber).not.toEqual(parseInt(myExpectedNumber));
            break;
        case 'more than':
            expect(appearanceNumber).toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'no more than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(appearanceNumber).not.toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'less than':
            expect(appearanceNumber).toBeLessThan(parseInt(myExpectedNumber));
            break;
        case 'no less than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(appearanceNumber).not.toBeLessThan(parseInt(myExpectedNumber));
            break;
      }    
    }
  );
};


