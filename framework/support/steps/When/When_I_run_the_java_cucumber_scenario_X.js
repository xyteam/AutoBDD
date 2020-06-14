const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const javacucumber_session = require(FrameworkPath + '/framework/libs/javacucumber_session');
const { When } = require('cucumber');
When(/^I run the java cucumber scenario "([^"]*)"$/, {timeout: 60*1000 * 4}, function (javacucumberScenario) {
        var result = javacucumber_session.runMvnTestScenario(this.javacucumber_project,
                                                                    this.javacucumber_projectModule,
                                                                    this.javacucumber_featureFile,
                                                                    javacucumberScenario);
    console.log(result.output);
    browser_session.displayMessage(browser, result.output);
    this.javacucumber_result = result.output;
    this.javacucumber_runcode = result.exitcode;
});


