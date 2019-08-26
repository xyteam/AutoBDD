module.exports = function() {
  this.Given(/^I have a java cucumber feature file "([^"]*)"$/, function (featureFile) {
    this.javacucumber_featureFile = featureFile;
  });
};
