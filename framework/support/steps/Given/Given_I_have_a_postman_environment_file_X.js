const { Given } = require('cucumber');
Given(/^I have a postman environment file "([^"]*)"$/, function (filename) {
    this.postman_environment_file = this.fs_session.getTestFileFullPath(filename);
});


