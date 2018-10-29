// Recommended filename: Then_I_should_see_the_title_of_#.js
module.exports = function() {
  this.Given(/^I should see the title contains the keyword of "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (keyword) {
    // Write the automation code here
    expect(browser.getTitle().toLowerCase()).toContain(keyword);
    expect(browser.getTitle().toLowerCase()).not.toEqual(keyword + '.com');
  });
};
