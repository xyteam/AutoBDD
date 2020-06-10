const { Given } = require('cucumber');
Given(/^I have a java cucumber project "([^"]*)"$/, function (projectName) {
    this.javacucumber_project = projectName;
    var result = this.javacucumber_session.runMvnCleanProject(this.javacucumber_project);
    // console.log(result.output);
    this.browser_session.displayMessage(browser, result.output);
    expect(result.output).toContain('BUILD SUCCESS');
    expect(result.output).not.toContain('BUILD FAILURE');
    expect(result.exitcode).toBe(0);
    this.javacucumber_result = result.output;
    this.javacucumber_runcode = result.exitcode;
  });


