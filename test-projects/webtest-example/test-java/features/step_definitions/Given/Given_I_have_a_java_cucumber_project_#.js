module.exports = function() {
  this.Given(/^I have a java cucumber project "([^"]*)"$/, function (projectName) {
    this.javacucumber_project = projectName;
  });
};
