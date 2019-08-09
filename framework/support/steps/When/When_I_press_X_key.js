module.exports = function() {
  this.When(/^I press "([^"]*)?" key$/, {timeout: process.env.StepTimeoutInMS}, function (keyName) {
    this.screen_session.keyTap(keyName);
  });
};
