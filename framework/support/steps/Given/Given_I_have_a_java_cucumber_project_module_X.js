const { Given } = require('cucumber');
Given(/^I have a java cucumber project module "([^"]*)"$/, function (projectModule) {
    this.javacucumber_projectModule = projectModule;
  });


