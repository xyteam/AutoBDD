const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const textedElements = require(FrameworkPath + '/framework/testfiles/textedElements');
module.exports = function() {
  this.Then(/^I should see the "([^"]*)" (button|label|option|modalDialog) on the page$/,
  {timeout: process.env.StepTimeoutInMS},
  function (elementText, elementName) {
    const targetElement = eval('textedElements.texted_' + elementName).replace('__TEXT__', elementText);
    browser.waitForVisible(targetElement, 500);
    expect(browser.isVisible(targetElement)).toBe(true);
  });
};
