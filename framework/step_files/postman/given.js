const { Given } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');

Given(/^(?::postman: )?I have a postman collection file "([^"]*)"$/, function (filename) {
    this.postman_collection_file = fs_session.getTestFileFullPath(filename);
});

Given(/^(?::postman: )?I have a postman environment file "([^"]*)"$/, function (filename) {
    this.postman_environment_file = fs_session.getTestFileFullPath(filename);
});


