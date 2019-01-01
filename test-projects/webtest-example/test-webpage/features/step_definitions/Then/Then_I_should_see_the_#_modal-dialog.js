module.exports = function() {
  this.Then(/^I should see the "([^"]*)" modal\-dialog$/, {timeout: process.env.StepTimeoutInMS}, function (modalText) {
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    browser.waitForVisible(myModalDialog, process.env.StepTimeoutInMS - 5000);
    expect(browser.isExisting(myModalDialog)).toBe(true);
  });
};
