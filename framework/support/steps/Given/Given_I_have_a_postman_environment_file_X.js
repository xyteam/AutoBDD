const { Given } = require('cucumber');
Given(/^I have a postman environment file "([^"]*)"$/, function (filename) {
    this.postman_environment_file = fs_session.getTestFileFullPath(filename);
});


