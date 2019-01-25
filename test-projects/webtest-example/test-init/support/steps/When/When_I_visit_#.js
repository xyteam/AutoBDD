module.exports = function() {
  this.When(/^I visit "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (url) {
    browser.url(url);
  });
};
