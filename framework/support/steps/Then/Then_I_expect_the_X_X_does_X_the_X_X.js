const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.Then(
    /^I expect (?:that )?(?:the (first|last) (\d+) line(?:s)? of )?the (?:"([^"]*)?" )?(image|screen area) does( not)* (contain|equal|match) the (text|regex) "(.*)?"$/,
    {timeout: process.env.StepTimeoutInMS},
    function (firstOrLast, lineCount, targetName, targetArea, falseCase, compareAction, expectType, expectedText) {
      const myExpectedText = parseExpectedText(expectedText);
      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      var screenFindResult;
      if (targetName && targetName == 'last-seen') {
        screenFindResult = this.lastSeen_screenFindResult;
      } else if (targetName && targetArea == 'image') {
        const parsedTargetName = parseExpectedText(targetName);
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
        if (imageFileName.includes('Screen')) {
          imagePathList = imageFileName;
        } else {
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        }
        imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedTargetName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
        screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
      } else {
        screenFindResult = JSON.parse(this.screen_session.screenGetText());
      }  
      this.lastSeen_screenFindResult = screenFindResult;

      let lineArray = screenFindResult[0].text;
      var lineText;
      switch(firstOrLast) {
        case 'first':
            lineText = lineArray.slice(0, lineCount).join('\n');
          break;
        case 'last':
            lineText = lineArray.slice(-lineCount).join('\n');
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
              myExpectedText,
              `target image text should not contain the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
          case 'equal':
            expect(lineText).not.toEqual(
              myExpectedText,
              `target image text should not equal the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
          case 'match':
              expect(lineText.toLowerCase()).not.toMatch(
                myExpectedText.toLowerCase(),
                `target image text should match the ${expectType} ` +
                `"${myExpectedText}"`
              );        
            break;
          default:
            expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      } else {
        switch (compareAction) {
            case 'contain':
              expect(lineText).toContain(
                myExpectedText,
                `target image text should contain the ${expectType} ` +
                `"${myExpectedText}"`
              );        
              break;
          case 'equal':
              expect(lineText).toEqual(
                myExpectedText,
                `target image text should equal the ${expectType} ` +
                `"${myExpectedText}"`
              );        
              break;
            case 'match':
              expect(lineText.toLowerCase()).toMatch(
                myExpectedText.toLowerCase(),
                `target image text should match the ${expectType} ` +
                `"${myExpectedText}"`
              );        
              break;
            default:
              expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      }
    }
  );
}
