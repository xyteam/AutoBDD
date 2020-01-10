const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(
    /^I expect (?:that )?the image "([^"]*)?" does( not)* appear(?: (exactly|not exactly|more than|no more than|less than|no less than) (\d+) time(?:s)?)?$/,
    {timeout: process.env.StepTimeoutInMS},
    function (imageName, falseCase, compareAction, expectedNumber) {
      const parsedImageName = parseExpectedText(imageName);
      const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
      const myCompareAction = compareAction || ((typeof falseCase == 'undefined') ? 'more than' : 'exactly');
      const [imageFileName, imageFileExt, imageSimilarity, imageSimilarityMax] = this.fs_session.getTestImageParms(parsedImageName);
      const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
      const imageScore = this.lastImage && this.lastImage.imageName == parsedImageName ? this.lastImage.imageScore : imageSimilarity;
      const imageWaitTime = process.env.imageWaitTime || 5;
      browser.pause(500);
      const screenFindResult = JSON.parse(this.screen_session.screenFindAllImages(imagePathList, imageScore, imageWaitTime, null, true, imageSimilarityMax));
      var myScreenFindResult = [];
      if (screenFindResult.length == 0) {
        console.log('expected image does not show on screen');
      } else {
        console.log(screenFindResult);
        myScreenFindResult = myScreenFindResult.concat(screenFindResult);
      }
      switch (myCompareAction) {
        case 'exactly':
            expect(myScreenFindResult.length).toEqual(parseInt(myExpectedNumber));
            break;
        case 'not exactly':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(myScreenFindResult.length).not.toEqual(parseInt(myExpectedNumber));
            break;
        case 'more than':
            expect(myScreenFindResult.length).toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'no more than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(myScreenFindResult.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'less than':
            expect(myScreenFindResult.length).toBeLessThan(parseInt(myExpectedNumber));
            break;
        case 'no less than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(myScreenFindResult.length).not.toBeLessThan(parseInt(myExpectedNumber));
            break;
      }    
    }
  );
};
