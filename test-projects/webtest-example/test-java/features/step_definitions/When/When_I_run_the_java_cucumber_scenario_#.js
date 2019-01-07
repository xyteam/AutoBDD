module.exports = function() {
       this.When(/^I run the java cucumber scenario "([^"]*)"$/, function (javacucumberScenario) {
        var result = this.javacucumber_session.runJavaCucumberScenario(this.javacucumber_project, this.javacucumber_featureFile,javacucumberScenario);
        console.log(result.output);
        this.javacucumber_result = result.output;
        this.javacucumber_runcode = result.exitcode;
    });
};
