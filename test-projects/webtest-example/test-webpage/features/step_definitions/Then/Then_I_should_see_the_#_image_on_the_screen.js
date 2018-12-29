module.exports = function() {
  this.Then(/^I should see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (imageName) {
    var imageFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, imageName);
    var imageSimilarity = process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    console.log(imageFullPath);
    var resultString = this.screen_session.screenFindImage(imageFullPath, imageSimilarity, imageWaitTime);
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    console.log(resultArray[0].location)
  });
};
