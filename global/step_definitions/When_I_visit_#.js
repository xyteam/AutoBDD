// Recommended filename: When_I_visit_#.js
module.exports = function() {
  this.Given(/^I visit "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (url) {
    // Write the automation code here
    this.browser_session.openUrl(browser, url)
  });
};
