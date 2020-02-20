const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.When(
    /^I wait (?:(\d+)ms )?on the "([^"]*)?" (image|area) to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 15*60*1000},
    function (waitMs, targetName, targetType, falseState, expectType, expectedText) {
      const parsedTargetName = parseExpectedText(targetName);
      const parsedExpectedText = parseExpectedText(expectedText);
      browser.pause(500);

      var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
      switch (targetType) {
        case 'area':
          imagePathList = parsedTargetName;
          imageScore = 1;
          maxSimilarityOrText = parsedExpectedText;
          break;
        case 'image':
        default:
          [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = this.fs_session.getTestImageParms(parsedTargetName);
          imagePathList = this.fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
          imageScore = this.lastImage && this.lastImage.imageName == parsedTargetName ? this.lastImage.imageScore : imageSimilarity;
          break;
      }

      const myWaitMs = parseInt(waitMs) || 15*60*1000;
      let boolFalseState = !!falseState;
  
      var timeOut = false;
      var handle = setInterval(() => {
        console.log(`wait timeout: ${targetName}, ${myWaitMs} ms`);
        timeOut = true;
      }, myWaitMs);

      var keeyGoing = true;
      while (keeyGoing && !timeOut) {
        let screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
        switch (expectType) {
          case 'regex':
            let myRegex = `/${parsedExpectedText}/i`;
            keeyGoing = !screenFindResult[0].text.matche(myRegex);
            break;
          case 'text':
          default:
            keeyGoing = !screenFindResult[0].text.includes(parsedExpectedText);
            break;
        }
        if (boolFalseState) {
          keeyGoing = !keeyGoing;
        } 
        browser.pause(3000);
      }
      clearInterval(handle);
    }
  );
}
