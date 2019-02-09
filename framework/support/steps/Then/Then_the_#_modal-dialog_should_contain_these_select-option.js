module.exports = function() {
  this.Then(/^the "([^"]*)" modal\-dialoag should contain these select\-option$/, {timeout: process.env.StepTimeoutInMS}, function (modalText, table) {
    const web_selectors = this.web_selectors;
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    const myModalDialog_select = myModalDialog + web_selectors.select;
    var expected_browserList = table.hashes();
    var displayed_browserList = browser.getText(myModalDialog_select);
    browser.click(myModalDialog_select);
    expected_browserList.forEach(function(row) {
      expect(displayed_browserList).toContain(row['browser_name']);
    });
  });
};
