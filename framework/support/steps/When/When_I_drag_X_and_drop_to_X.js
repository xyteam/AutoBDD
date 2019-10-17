module.exports = function() {
  this.When(/^I drag "([^"]*)" and drop to "([^"]*)"$/, function (object, target) {
    // var imageSimilarity = process.env.imageSimilarity;
    var objectSimilarity = object.split(':')[1] || process.env.imageSimilarity;
    var targetSimilarity = target.split(':')[1] || process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    var objectFullPath = this.fs_session.globalSearchImageList(__dirname, object);
    var targetFullPath = this.fs_session.globalSearchImageList(__dirname, target);
    var objectString = this.screen_session.screenFindImage(objectFullPath, objectSimilarity, imageWaitTime);
    var targetString = this.screen_session.screenFindImage(targetFullPath, targetSimilarity, imageWaitTime);
    var object = JSON.parse(objectString)[0];
    var target = JSON.parse(targetString)[0];
    var objectCenter = object.center;
    var targetCenter = target.center;
    this.screen_session.drag_and_drop(objectCenter, targetCenter);
    browser.pause(1000);
  });
};
