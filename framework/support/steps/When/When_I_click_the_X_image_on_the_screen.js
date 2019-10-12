module.exports = function() {
  this.When(/^I (click|hover) the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (mouseAction, imageName) {
    var imageFullPath = this.fs_session.globalSearchImageList(__dirname, imageName.split(':')[0]);
    var imageSimilarity = imageName.split(':')[1] || process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    var resultString
    switch (mouseAction) {
      case "hover":
        resultString = this.screen_session.screenHoverImage(imageFullPath, imageSimilarity, imageWaitTime);
      break;
      case "click":
        resultString = this.screen_session.screenClickImage(imageFullPath, imageSimilarity, imageWaitTime);
      default:
      break;
    }
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    console.log(resultArray[0].clicked)
  });
};
