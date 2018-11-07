module.exports = function() {
  this.Given(/^I visit "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (url) {
    browser.url(url);
  });
};
