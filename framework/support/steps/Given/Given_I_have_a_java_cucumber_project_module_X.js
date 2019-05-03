module.exports = function() {
  this.Given(/^I have a java cucumber project module "([^"]*)"$/, function (projectModule) {
    this.javacucumber_projectModule = projectModule;
  });
};
