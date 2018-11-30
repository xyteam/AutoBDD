module.exports = function() {
  this.Given(/^I should see the "([^"]*)" modal\-dialog$/, {timeout: process.env.StepTimeoutInMS}, function (modalText) {
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    expect(browser.isExisting(myModalDialog)).toBe(true);
  });
};
