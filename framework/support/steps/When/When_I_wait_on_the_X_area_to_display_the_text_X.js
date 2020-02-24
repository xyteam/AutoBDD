const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.When(
    /^I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" (image|area) to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 15*60*1000},
    function (waitIntvSec, waitMnt, firstOrLast, lineCount, targetName, targetType, falseState, expectType, expectedText) {
      const parsedTargetName = parseExpectedText(targetName);
      const parsedExpectedText = parseExpectedText(expectedText);
      const parsedWaitMnt = parseInt(waitMnt) || 1;
      const parsedWaitIntvSec = parseInt(waitIntvSec) || 15;

      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      switch (targetType) {
        case 'area':
          imagePathList = parsedTargetName;
          imageScore = 0.5;
          maxSimilarityOrText = parsedExpectedText;
          break;
        case 'image':
        default:
          [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
          imageScore = this.lastImage && this.lastImage.imageName == parsedTargetName ? this.lastImage.imageScore : imageSimilarity;
          break;
      }

      let boolFalseState = !!falseState;
  
      var timeOut = false;
      var handle = setInterval(() => {
        console.log(`wait timeout: ${targetName}, ${parsedWaitMnt} minute(s)`);
        timeOut = true;
      }, parsedWaitMnt*60*1000);

      var keeyGoing = true;
      while (keeyGoing && !timeOut) {
        browser.pause(parsedWaitIntvSec*1000);
        // calculate lines of text
        const screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
        let lineArray = screenFindResult[0].text.split('\n');
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

        switch (expectType) {
          case 'regex':
            let myRegex = `/${parsedExpectedText}/i`;
            keeyGoing = !lineText.matche(myRegex);
            break;
          case 'text':
          default:
            keeyGoing = !lineText.includes(parsedExpectedText);
            break;
        }
        if (boolFalseState) {
          keeyGoing = !keeyGoing;
        } 
        // console.log(`lineText: ${lineText}`);
        // console.log(`expectedText: ${parsedExpectedText}`);
        // console.log(`keepGoing: ${keeyGoing}`);
      }
      clearInterval(handle);
    }
  );
}
