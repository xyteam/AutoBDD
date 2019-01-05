module.exports = function() {
    this.When(/^I run the postman collection in newman commandline$/, function () {
        const myExecSync = require('child_process').execSync;
        var newman_command = 'newman run -e ' + this.postman_environment_file
                                                 + ' '
                                                 + this.postman_collection_file;
        console.log(newman_command);
        var newman_result;
        var newman_exitcode;
        try {
            newman_result = myExecSync(newman_command).toString();
            newman_exitcode = 0
        } catch(e) {
            newman_result = e.stdout.toString();
            newman_exitcode = e.status;
        }
        console.log(newman_result);
        const encodeUrl = require('encodeurl');
        var newman_result_displayData = encodeUrl(newman_result);
        browser.url('data: text/plain;charset=utf-8, ' + newman_result_displayData);
        browser.pause(1000);
        this.postman_result = newman_result;
        this.postman_runcode = newman_exitcode;
    });
};
