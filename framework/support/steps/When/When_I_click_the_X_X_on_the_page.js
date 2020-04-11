const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const textedElements = require(FrameworkPath + '/framework/testfiles/textedElements');
module.exports = function() {
  this.When(/^I click the "([^"]*)" (button|label|option|modalDialog) on the page$/,
  {timeout: process.env.StepTimeoutInMS},
  function (elementText, elementName) {
    const targetElement = eval('textedElements.texted_' + elementName).replace('__TEXT__', elementText);
    switch (elementName) {
      case 'option':
        browser.$(targetElement).$('..').click();
        break;
      default:
        browser.$(targetElement).click();
    }
  });
}