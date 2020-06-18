const { Then } = require('cucumber');
Then(/^the "([^"]*)" modal\-dialoag should contain these select\-option$/, { timeout: 60*1000 }, function (modalText, table) {
    const web_selectors = this.web_selectors;
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    const myModalDialog_select = myModalDialog + web_selectors.select;
    var expected_browserList = table.hashes();
    var displayed_browserList = browser.$(myModalDialog_select).getText();
    browser.$(myModalDialog_select).click();
    expected_browserList.forEach(function(row) {
      expect(displayed_browserList).toContain(row['browser_name']);
    });
  });


