module.exports = function() {
  this.Then(/^I should not see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (imageName) {
    var imageFullPath = this.fs_session.globalSearchImagePath(__dirname, imageName.split(':')[0]);
    var objectScore = this.objectScore || process.env.imageSimilarity;
    var imageWaitTime = 1;
    browser.pause(500);
    var resultString = this.screen_session.screenFindImage(imageFullPath, objectScore, imageWaitTime);
    expect(resultString).toContain('not found');
    expect(resultString).not.toContain('error');
  });
};
