const { When } = require('cucumber');
When(/^I run the postman collection in newman commandline$/, function () {
        const newman_command = `newman run -e ${this.postman_environment_file} ${this.postman_collection_file}`;
        console.log(newman_command);
        const newman_result = this.cmdline_session.runCmd(newman_command);
        let result = JSON.parse(newman_result);
        console.log(result.output);
        this.browser_session.displayMessage(browser, result.output);
        this.postman_result = result.output;
        this.postman_runcode = result.exitcode;
});


