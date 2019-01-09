module.exports = function() {
    this.When(/^I run the postman collection in newman commandline$/, function () {
        var result = this.cmdline_session.runNewman(this.postman_environment_file, this.postman_collection_file);
        console.log(result.output);
        this.browser_session.displayMessage(browser, result.output);
        this.postman_result = result.output;
        this.postman_runcode = result.exitcode;
    });
};
