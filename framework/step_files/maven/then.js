const { Then } = require('@cucumber/cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');

Then(/^(?::maven: )?the java cucumber test should all pass$/, async function () {
    await browser_session.displayMessage(browser, this.javacucumber_result);
    await expect(this.javacucumber_result).toContain('BUILD SUCCESS');
    await expect(this.javacucumber_result).not.toContain('BUILD FAILURE');
    await expect(this.javacucumber_result).toContain('Failures: 0, Errors: 0, Skipped: 0');
    await expect(this.javacucumber_runcode).toBe(0);
  });


