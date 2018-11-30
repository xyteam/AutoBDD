module.exports = function() {
  this.When(/^I click the "([^"]*)" button on the page$/, function (buttonName) {
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myButton = seleniumPage_selectors.texted_button.replace('__TEXT__', buttonName);
    browser.click(myButton);
  });
}