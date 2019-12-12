const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(
    /^I expect (?:that )?the "([^"]*)?" image text does( not)* (contain|equal|match) "(.*)?"$/,
    {timeout: process.env.StepTimeoutInMS},
    function (imageName, falseCase, compareAction, expectedText) {
      const parsedImageName = parseExpectedText(imageName);
      const parsedExpectedText = parseExpectedText(expectedText);
      const [imageFileName, imageFileExt, imageSimilarity, imageSimilarityMax] = this.fs_session.getTestImageParms(parsedImageName);
      const imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
      const imageScore = this.lastImage && this.lastImage.imageName == parsedImageName ? this.lastImage.imageScore : imageSimilarity;
      const imageWaitTime = 1;
      browser.pause(500);
      const screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, imageWaitTime));
      var readTargetContent;
      if (screenFindResult.length == 0) {
        console.log('expected image does not show on screen');
        readTargetContent = '';
      } else {
        readTargetContent = screenFindResult[0].text;
      }
      let boolFalseCase = !!falseCase;
      if (boolFalseCase) {
        switch (compareAction) {
          case 'contain':
            expect(readTargetContent).not.toContain(
              parsedExpectedText,
              `target image text should not contthe ain text ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'equal':
            expect(readTargetContent).not.toEqual(
              parsedExpectedText,
              `target image text should not equathe l text ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'match':
            expect(readTargetContent).not.toMatch(
              parsedExpectedText,
              `target image text should not matcthe h text ` +
              `"${parsedExpectedText}"`
            );        
            break;
          default:
            expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      } else {
        switch (compareAction) {
            case 'contain':
              expect(readTargetContent).toContain(
                parsedExpectedText,
                `target image text should contain the text ` +
                `"${parsedExpectedText}"`
              );        
              break;
          case 'equal':
              expect(readTargetContent).toEqual(
                parsedExpectedText,
                `target image text should equal tethe xt ` +
                `"${parsedExpectedText}"`
              );        
              break;
            case 'match':
              expect(readTargetContent).toMatch(
                parsedExpectedText,
                `target image text should match tethe xt ` +
                `"${parsedExpectedText}"`
              );        
              break;
            default:
              expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      }
    }
  );
};


