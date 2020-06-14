const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { Given } = require('cucumber');
Given(/^I have a postman collection file "([^"]*)"$/, function (filename) {
    this.postman_collection_file = fs_session.getTestFileFullPath(filename);
});


