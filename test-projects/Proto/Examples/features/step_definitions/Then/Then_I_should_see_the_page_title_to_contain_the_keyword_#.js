module.exports = function() {
  this.Given(/^I should see the page title to contain the keyword "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (keyword) {
    expect(browser.getTitle().toLowerCase()).toContain(keyword);
  });
};
