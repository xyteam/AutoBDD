module.exports = function() {
  this.When(/^I (click|hover) the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (mouseAction, imageName) {
    var imageFullPath = this.fs_session.globalSearchImageList(__dirname, imageName.split(':')[0]);
    var imageSimilarity = imageName.split(':')[1] || process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    var screenFindResult
    switch (mouseAction) {
      case "hover":
        screenFindResult = JSON.parse(this.screen_session.screenHoverImage(imageFullPath, imageSimilarity, imageWaitTime));
      break;
      case "click":
        screenFindResult = JSON.parse(this.screen_session.screenClickImage(imageFullPath, imageSimilarity, imageWaitTime));
      default:
      break;
    }
    console.log(screenFindResult);
    expect(screenFindResult.length).not.toEqual(0, `can not ${mouseAction} the "${imageName}" image on the screen`);
  });
};
