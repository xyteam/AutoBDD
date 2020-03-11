const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.When(
    /^I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" (image|area) to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 60*60*1000},
    function (waitIntvSec, waitTimeoutMnt, firstOrLast, lineCount, targetName, targetType, falseState, expectType, expectedText) {
      // parse input
      const parsedTargetName = parseExpectedText(targetName);
      const myExpectedText = parseExpectedText(expectedText);
      const myWaitTimeoutMnt = parseInt(waitTimeoutMnt) || 1;
      const myWaitIntvSec = parseInt(waitIntvSec) || 15;

      // process target before check
      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      switch (targetType) {
        case 'area':
          imagePathList = parsedTargetName;
          imageScore = 1;
          maxSimilarityOrText = myExpectedText;
          break;
        case 'image':
        default:
          [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
          imageScore = this.lastImage && this.lastImage.imageName == parsedTargetName ? this.lastImage.imageScore : imageSimilarity;
          break;
      }

      // process wait and timeout condition
      var boolFalseState = !!falseState;
      var keepWaiting = true;
      var timeOut = false;
      var handle = setInterval(() => {
        console.log(`wait timeout: ${targetName}, ${myWaitTimeoutMnt} minute(s)`);
        timeOut = true;
      }, myWaitTimeoutMnt*60*1000);

      // wait and check loop
      var screenFindResult;
      do {
        // wait
        browser.pause(myWaitIntvSec*1000)
        // check
        screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
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
            break;
        }
        switch (expectType) {
          case 'regex':
            let myRegex = new RegExp(myExpectedText, 'i');
            keepWaiting = !lineText.match(myRegex);
            break;
          case 'text':
          default:
            keepWaiting = !lineText.includes(myExpectedText);
            break;
        }
        if (boolFalseState) {
          keepWaiting = !keepWaiting;
        }
        // loop decision
        console.log(`lineText: ${lineText}`);
        console.log(`expectedText: ${myExpectedText}`);
        console.log(`keepWaiting: ${keepWaiting}`);
      } while (keepWaiting && !timeOut)

      // clear timeout
      clearInterval(handle);
    }
  );
}
