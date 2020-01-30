const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = function() {
  this.When(/^I (click|hover) (on|between) the "([^"]*)" image(?: and the "([^"]*)" image)? on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (mouseAction, targetType, imageNameOne, imageNameTwo) {
    // re imageNameOne
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, imageSimilarityMaxOne] = this.fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = this.fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    const imageScoreOne = this.lastImage && this.lastImage.imageNameOne == parsedImageNameOne ? this.lastImage.imageScoreOne : imageSimilarityOne;
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, imageSimilarityMaxTwo] = this.fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = this.fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);
    const imageScoreTwo = this.lastImage && this.lastImage.imageNameTwo == parsedImageNameTwo ? this.lastImage.imageScoreTwo : imageSimilarityTwo;
    const imageWaitTime = process.env.imageWaitTime;
    switch (targetType) {
      case 'between':
        var locationOne, locationTwo;
        var targetLocation = {};
        locationOne = JSON.parse(this.screen_session.screenFindImage(imagePathListOne, imageScoreOne, imageWaitTime));
        expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
        locationTwo = JSON.parse(this.screen_session.screenFindImage(imagePathListTwo, imageScoreTwo, imageWaitTime));
        expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
        targetLocation.x = (locationOne[0].center.x + locationTwo[0].center.x) / 2;
        targetLocation.y = (locationOne[0].center.y + locationTwo[0].center.y) / 2;
        switch (mouseAction) {
          case "hover":
            this.screen_session.moveMouse(targetLocation.x,targetLocation.y);
            break;
          case "click":
            this.screen_session.moveMouse(targetLocation.x,targetLocation.y);
            this.screen_session.mouseClick();
            break;
        }
        break;
      case 'on':
      default:
        var screenFindResult
        switch (mouseAction) {
          case "hover":
            screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imagePathListOne, imageScoreOne, imageWaitTime));
            break;
          case "click":
            screenFindResult = JSON.parse(this.screen_session.screenClickImage(imagePathListOne, imageScoreOne, imageWaitTime));
            break;
        }
        console.log(screenFindResult);
        expect(screenFindResult.length).not.toEqual(0, `can not ${mouseAction} the "${imageNameOne}" image on the screen`);
        break;
    }
  });
};

