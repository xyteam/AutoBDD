const { Given } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');

Given(/^(?::maven: )?I have a java cucumber feature file "([^"]*)"$/, function (featureFile) {
    this.javacucumber_featureFile = featureFile;
});

Given(/^(?::maven: )?I have a java cucumber project module "([^"]*)"$/, function (projectModule) {
    this.javacucumber_projectModule = projectModule;
  });

Given(/^(?::maven: )?I have a java cucumber project "([^"]*)"$/, function (projectName) {
    this.javacucumber_project = projectName;
    var result = javacucumber_session.runMvnCleanProject(this.javacucumber_project);
    // console.log(result.output);
    browser_session.displayMessage(browser, result.output);
    expect(result.output).toContain('BUILD SUCCESS');
    expect(result.output).not.toContain('BUILD FAILURE');
    expect(result.exitcode).toBe(0);
    this.javacucumber_result = result.output;
    this.javacucumber_runcode = result.exitcode;
  });
