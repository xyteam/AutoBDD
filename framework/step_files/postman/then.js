const { Then } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');

Then(/^(?::postman: )?the postman test should not have failure$/, function () {
    browser_session.displayMessage(browser, this.postman_result);
    expect(this.postman_result).not.toMatch(RegExp('#.*failure.*detail'));
    expect(this.postman_runcode).toBe(0);
  });


