module.exports = function() {
  this.When(/^I (click|hover) the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (mouseAction, imageName) {
    var imageFullPath = this.fs_session.globalSearchImagePath(__dirname, imageName);
    var imageSimilarity = process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    console.log(imageFullPath);
    switch (mouseAction) {
      case "hover":
      break;
      case "click":
      resultString = this.screen_session.screenHoverImage(imageFullPath, imageSimilarity, imageWaitTime);
      default:
      break;
    }
    var resultString = this.screen_session.screenClickImage(imageFullPath, imageSimilarity, imageWaitTime);
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    console.log(resultArray[0].clicked)
  });
};
