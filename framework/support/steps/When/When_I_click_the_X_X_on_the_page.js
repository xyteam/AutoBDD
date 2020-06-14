const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const textedElements = require(FrameworkPath + '/framework/testfiles/textedElements');
const { When } = require('cucumber');
When(/^I click the "([^"]*)" (button|label|option|modalDialog) on the page$/,
  { timeout: 60*1000 },
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