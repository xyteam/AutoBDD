module.exports = function() {
  this.When(/^I click the "([^"]*)" (button|label|option|modalDialog) on the page$/, {timeout: process.env.StepTimeoutInMS}, function (elementText, elementName) {
    const texted_elements = this.texted_elements;
    const targetElement = eval('texted_elements.texted_' + elementName).replace('__TEXT__', elementText);
    switch (elementName) {
      case 'option':
        browser.$(targetElement).$('..').click();
        break;
      default:
        browser.$(targetElement).click();
    }
  });
}