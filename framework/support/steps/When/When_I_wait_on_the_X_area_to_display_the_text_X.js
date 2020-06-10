const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const { When } = require('cucumber');
When(
    /^I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the (?:"([^"]*)?" image|screen area) to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 60*60*1000},
    function (waitIntvSec, waitTimeoutMnt, firstOrLast, lineCount, targetName, falseState, expectType, expectedText) {
      // parse input
      const myExpectedText = parseExpectedText(expectedText);
      const myWaitTimeoutMnt = parseInt(waitTimeoutMnt) || 1;
      const myWaitIntvSec = parseInt(waitIntvSec) || 5;

      // process target before check
      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      if (targetName) {
        const parsedTargetName = parseExpectedText(targetName);
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
        if (imageFileName.includes('Screen')) {
          imagePathList = imageFileName;
        } else {
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        }
        imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedTargetName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
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
        if (targetName) {
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
