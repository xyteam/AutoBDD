const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(`${FrameworkPath}/framework/functions/common/parseExpectedText`);
const fs_session = require(`${FrameworkPath}/framework/libs/fs_session`);
const screen_session = require(`${FrameworkPath}/framework/libs/screen_session`);

const fuzz = require('fuzzball');
const { Then } = require('cucumber');
Then(
    /^I expect (?:that )?(?:the( first| last)? (\d+)(?:st|nd|rd|th)? line(?:s)? of )?the (?:"([^"]*)?" )?(image|screen area) does( not)* (contain|equal|mimic|match) the (text|regex) "(.*)?"$/,
    { timeout: 60*1000 },
    function (firstOrLast, lineCount, targetName, targetArea, falseCase, compareAction, expectType, expectedText) {
      const myExpectedText = parseExpectedText(expectedText);
      const myFirstOrLast = firstOrLast || '';

      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      var screenFindResult;
      if (targetName && targetName == 'last-seen') {
        screenFindResult = this.lastSeen_screenFindResult;
      } else if (targetName && targetArea == 'image') {
        const parsedTargetName = parseExpectedText(targetName);
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = fs_session.getTestImageParms(parsedTargetName);
        if (imageFileName.includes('Screen')) {
          imagePathList = imageFileName;
        } else {
          imagePathList = fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        }
        imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedTargetName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
        screenFindResult = JSON.parse(screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
      } else {
        screenFindResult = JSON.parse(screen_session.screenGetText());
      }  
      this.lastSeen_screenFindResult = screenFindResult;

      let lineArray = screenFindResult[0].text;
      var lineText;
      switch(myFirstOrLast.trim()) {
        case 'first':
            lineText = lineArray.slice(0, lineCount).join('\n');
          break;
        case 'last':
            lineText = lineArray.slice(-lineCount).join('\n');
          break;
        default:
            if (lineCount) {
              lineText = lineArray[lineCount - 1];
            } else {
              lineText = lineArray.join('\n');
            }
          }

      const mimicScore = (myExpectedText && myExpectedText.length > 0) ? fuzz.partial_ratio(lineText, myExpectedText) : 100;

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
            case 'mimic':
              expect(mimicScore).not.toBeGreaterThanOrEqual(60,
                `target image text should not mimic the ${expectType} ` +
                `"${myExpectedText}"`
              );        
            break;
            case 'match':
              expect(lineText.toLowerCase()).not.toMatch(
                RegExp(myExpectedText.toLowerCase()),
                `target image text should not match the ${expectType} ` +
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
          case 'mimic':
            expect(mimicScore).toBeGreaterThanOrEqual(60,
              `target image text should mimic the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
          case 'match':
            expect(lineText.toLowerCase()).toMatch(
              RegExp(myExpectedText.toLowerCase()),
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
