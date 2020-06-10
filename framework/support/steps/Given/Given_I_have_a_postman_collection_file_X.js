const { Given } = require('cucumber');
Given(/^I have a postman collection file "([^"]*)"$/, function (filename) {
    this.postman_collection_file = this.fs_session.getTestFileFullPath(filename);
});


