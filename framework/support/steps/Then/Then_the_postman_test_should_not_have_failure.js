const { Then } = require('cucumber');
Then(/^the postman test should not have failure$/, function () {
    this.browser_session.displayMessage(browser, this.postman_result);
    expect(this.postman_result).not.toMatch('#.*failure.*detail');
    expect(this.postman_runcode).toBe(0);
  });


