const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(
    /^I expect (?:that )?(?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" (image|area) does( not)* (contain|equal|match) the (text|regex) "(.*)?"$/,
    {timeout: process.env.StepTimeoutInMS},
    function (firstOrLast, lineCount, targetName, targetType, falseCase, compareAction, expectType, expectedText) {
      const parsedTargetName = parseExpectedText(targetName);
      const parsedExpectedText = parseExpectedText(expectedText);
      browser.pause(500);

      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      switch (targetType) {
        case 'area':
          imagePathList = parsedTargetName;
          imageScore = 1;
          maxSimilarityOrText = (expectType == 'text') ? parsedExpectedText : 1;
          break;
        case 'image':
        default:
          [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
          imageScore = this.lastImage && this.lastImage.imageName == parsedTargetName ? this.lastImage.imageScore : imageSimilarity;
          break;
      }
      const screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
      let lineArray = screenFindResult[0].text;
      var lineText;
      switch(firstOrLast) {
        case 'first':
            lineText = lineArray.slice(0, lineCount).join('\n');
          break;
        case 'last':
            lineText = lineArray.slice(lineArray.length - lineCount, lineArray.length).join('\n');
          break;
        default:
          lineText = lineArray.join('\n');
      }

      if (screenFindResult.length == 0) {
        console.log('expected image or text does not show on screen');
      } else {
        console.log(screenFindResult);
      }
      
      let boolFalseCase = !!falseCase;
      if (boolFalseCase) {
        switch (compareAction) {
          case 'contain':
            expect(lineText).not.toContain(
              parsedExpectedText,
              `target image text should not contain the ${expectType} ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'equal':
            expect(lineText).not.toEqual(
              parsedExpectedText,
              `target image text should not equal the ${expectType} ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'match':
              expect(lineText.toLowerCase()).not.toMatch(
                parsedExpectedText.toLowerCase(),
                `target image text should match the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
            break;
          default:
            expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      } else {
        switch (compareAction) {
            case 'contain':
              expect(lineText).toContain(
                parsedExpectedText,
                `target image text should contain the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
          case 'equal':
              expect(lineText).toEqual(
                parsedExpectedText,
                `target image text should equal the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
            case 'match':
              expect(lineText.toLowerCase()).toMatch(
                parsedExpectedText.toLowerCase(),
                `target image text should match the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
            default:
              expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      }
    }
  );
}
