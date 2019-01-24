module.exports = function() {
  this.Then(/^I should not see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (imageName) {
    var imageFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, imageName);
    var imageSimilarity = this.objectSimilarity;
    var imageWaitTime = 1;
    browser.pause(500);
    var resultString = this.screen_session.screenFindImage(imageFullPath, imageSimilarity, imageWaitTime);
    expect(resultString).toContain('not found');
    expect(resultString).not.toContain('error');
  });
};
