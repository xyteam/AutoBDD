const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { Given } = require('cucumber');
Given(/^I have a postman environment file "([^"]*)"$/, function (filename) {
    this.postman_environment_file = fs_session.getTestFileFullPath(filename);
});


