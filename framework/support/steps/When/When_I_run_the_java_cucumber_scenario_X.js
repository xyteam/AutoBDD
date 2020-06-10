const { When } = require('cucumber');
When(/^I run the java cucumber scenario "([^"]*)"$/, {timeout: 60*1000 * 4}, function (javacucumberScenario) {
        var result = this.javacucumber_session.runMvnTestScenario(this.javacucumber_project,
                                                                    this.javacucumber_projectModule,
                                                                    this.javacucumber_featureFile,
                                                                    javacucumberScenario);
    console.log(result.output);
    this.browser_session.displayMessage(browser, result.output);
    this.javacucumber_result = result.output;
    this.javacucumber_runcode = result.exitcode;
});


