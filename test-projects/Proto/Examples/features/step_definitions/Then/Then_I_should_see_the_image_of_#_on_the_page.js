module.exports = function() {
  this.Given(/^I should see the image of "([^"]*)" on the page$/, {timeout: process.env.StepTimeoutInMS}, function (imageName) {
    // var imageFullPath = this.fs_session.getImageFullPath(__dirname, imageName);
    var imageFullPath = this.fs_session.getGlobalImageFullPath(imageName);
    var imageSimilarity = 0.8;

    browser.url('file://' + imageFullPath);
    var resultString = this.screen_session.focusedFindImage(imageFullPath, imageSimilarity);
    expect(resultString).not.toContain('not found');
    var resultArray = JSON.parse(resultString);
    console.log(resultArray[0].location)
    this.screen_session.focusedRightClickImage(imageFullPath, imageSimilarity);
    browser.pause(5000);
  });
};
