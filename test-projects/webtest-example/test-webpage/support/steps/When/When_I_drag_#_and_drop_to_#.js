module.exports = function() {
  this.When(/^I drag "([^"]*)" and drop to "([^"]*)"$/, function (object, target) {
    // var imageSimilarity = process.env.imageSimilarity;
    var imageSimilarity = process.env.imageSimilarity;
    var imageWaitTime = process.env.imageWaitTime;
    var objectFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, object);
    var targetFullPath = this.fs_session.getLocalThenGlobalImageFullPath(__dirname, target);
    var objectString = this.screen_session.screenFindImage(objectFullPath, imageSimilarity, imageWaitTime);
    var targetString = this.screen_session.screenFindImage(targetFullPath, imageSimilarity, imageWaitTime);
    var object = JSON.parse(objectString)[0];
    var target = JSON.parse(targetString)[0];
    var objectCenter = object.center;
    var targetCenter = target.center;
    this.objectSimilarity = object.score;
    this.screen_session.drag_and_drop(objectCenter, targetCenter);
    browser.pause(1000);
  });
};
