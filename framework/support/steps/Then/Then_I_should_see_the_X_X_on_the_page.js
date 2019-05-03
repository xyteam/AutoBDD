module.exports = function() {
  this.Then(/^I should see the "([^"]*)" (button|label|option|modalDialog) on the page$/, {timeout: process.env.StepTimeoutInMS}, function (elementText, elementName) {
    const texted_elements = this.texted_elements;
    const targetElement = eval('texted_elements.texted_' + elementName).replace('__TEXT__', elementText);
    browser.waitForVisible(targetElement, 500);
    expect(browser.isVisible(targetElement)).toBe(true);
  });
};
