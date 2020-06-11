const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const { Then } = require('cucumber');
Then(/^the java cucumber test should all pass$/, function () {
    browser_session.displayMessage(browser, this.javacucumber_result);
    expect(this.javacucumber_result).toContain('BUILD SUCCESS');
    expect(this.javacucumber_result).not.toContain('BUILD FAILURE');
    expect(this.javacucumber_result).toContain('Failures: 0, Errors: 0, Skipped: 0');
    expect(this.javacucumber_runcode).toBe(0);
  });


