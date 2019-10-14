module.exports = function() {
  this.Then(/^I should see the "([^"]*)" image on the screen$/, {timeout: process.env.StepTimeoutInMS}, function (imageName) {
    var imageFullPath = this.fs_session.globalSearchImageList(__dirname, imageName.split(':')[0]);
    var imageSimilarity = imageName.split(':')[1] || process.env.imageSimilarity;
    var resultString = this.screen_session.screenFindImage(imageFullPath, imageSimilarity);
    expect(resultString).not.toContain('not found');
    expect(resultString).not.toContain('error');
    var resultArray = JSON.parse(resultString);
    console.log(resultArray[0].location)
  });
};
