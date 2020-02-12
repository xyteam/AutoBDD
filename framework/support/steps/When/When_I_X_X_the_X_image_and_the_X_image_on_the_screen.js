const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function () {
  this.When(/^I (click|rightclick|hover|wave|shake|circle) (on|between) the "([^"]*)" image(?: and the "([^"]*)" image)? on the screen$/, { timeout: process.env.StepTimeoutInMS }, function (mouseAction, targetType, imageNameOne, imageNameTwo) {
    // re imageNameOne
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = this.fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = this.fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = this.fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = this.fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);
    switch (targetType) {
      case 'between':
        var locationOne, locationTwo;
        var targetLocation = {};
        locationOne = JSON.parse(this.screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
        expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
        locationTwo = JSON.parse(this.screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
        expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
        targetLocation.x = (locationOne[0].center.x + locationTwo[0].center.x) / 2;
        targetLocation.y = (locationOne[0].center.y + locationTwo[0].center.y) / 2;
        switch (mouseAction) {
          case "hover":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            break;
          case "click":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            this.screen_session.mouseClick();
            break;
          case "rightclick":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            this.screen_session.mouseClick("right");
            break;
          case "wave":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x - 5, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x + 5, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            break;
          case "shake":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y - 5);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y + 5);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            break;
          case "circle":
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y - 5);
            this.screen_session.moveMouseSmooth(targetLocation.x + 5, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y + 5);
            this.screen_session.moveMouseSmooth(targetLocation.x - 5, targetLocation.y);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y - 5);
            this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
            break;
        }
        break;
      case 'on':
      default:
        var screenFindResult
        switch (mouseAction) {
          case "hover":
            screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            break;
          case "click":
            screenFindResult = JSON.parse(this.screen_session.screenClickImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            break;
          case "rightclick":
            screenFindResult = JSON.parse(this.screen_session.screenRightClickImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            break;
          case "wave":
            screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x - 5, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x + 5, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            break;
          case "shake":
            screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y - 5);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y + 5);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            break;
          case "circle":
            screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y - 5);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x + 5, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y + 5);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x - 5, screenFindResult[0].center.y);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y - 5);
            this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
            break;
        }
        console.log(screenFindResult);
        expect(screenFindResult.length).not.toEqual(0, `can not ${mouseAction} the "${imageNameOne}" image on the screen`);
        break;
    }
  });
};


