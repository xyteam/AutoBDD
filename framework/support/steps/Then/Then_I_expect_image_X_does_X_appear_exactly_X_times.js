const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const { Then } = require('cucumber');
Then(
    /^I expect (?:that )?the "([^"]*)?" image does( not)* appear(?: (exactly|not exactly|more than|no more than|less than|no less than) (\d+) time(?:s)?)?$/,
    { timeout: 60*1000 },
    function (imageName, falseCase, compareAction, expectedNumber) {
      const parsedImageName = parseExpectedText(imageName);
      const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
      const myCompareAction = compareAction || ((typeof falseCase == 'undefined') ? 'more than' : 'exactly');
      
      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText;
      var imagePathList, expectedImageSimilarity, expectedImageNumberMax;
      var screenFindResult;
      
      if (imageName && imageName == 'last-seen') {
        screenFindResult = this.lastSeen_screenFindResult;
      } else {
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedImageName);
        imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        expectedImageSimilarity = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedImageName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
        expectedImageNumberMax = myExpectedNumber;
        screenFindResult = JSON.parse(this.screen_session.screenFindAllImages(imagePathList, expectedImageSimilarity, maxSimilarityOrText, null, null, expectedImageNumberMax));  
      }
      this.lastSeen_screenFindResult = screenFindResult;
      if (screenFindResult.length == 0) {
        console.log('expected image does not show on screen');
      } else {
        console.log(screenFindResult);
      }
      switch (myCompareAction) {
        case 'exactly':
            expect(screenFindResult.length).toEqual(parseInt(myExpectedNumber));
            break;
        case 'not exactly':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toEqual(parseInt(myExpectedNumber));
            break;
        case 'more than':
            expect(screenFindResult.length).toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'no more than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'less than':
            expect(screenFindResult.length).toBeLessThan(parseInt(myExpectedNumber));
            break;
        case 'no less than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toBeLessThan(parseInt(myExpectedNumber));
            break;
      }    
    }
  );


