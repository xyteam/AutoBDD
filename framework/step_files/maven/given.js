const { Given } = require('@cucumber/cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');

Given(/^(?::maven: )?I have a java cucumber feature file "([^"]*)"$/, function (featureFile) {
    this.javacucumber_featureFile = featureFile;
});

Given(/^(?::maven: )?I have a java cucumber project module "([^"]*)"$/, function (projectModule) {
    this.javacucumber_projectModule = projectModule;
  });

Given(/^(?::maven: )?I have a java cucumber project "([^"]*)"$/, async function (projectName) {
    this.javacucumber_project = projectName;
    var result = javacucumber_session.runMvnCleanProject(this.javacucumber_project);
    // console.log(result.output);
    await browser_session.displayMessage(browser, result.output);
    await expect(result.output).toContain('BUILD SUCCESS');
    await expect(result.output).not.toContain('BUILD FAILURE');
    await expect(result.exitcode).toBe(0);
    this.javacucumber_result = result.output;
    this.javacucumber_runcode = result.exitcode;
  });
