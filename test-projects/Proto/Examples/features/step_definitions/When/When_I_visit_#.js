module.exports = function() {
  this.When(/^I visit "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (url) {
    // debug messages
    if (process.env.DebugTestProject == 1) {
      console.log(process.env.FrameworkEnv);
      console.log(process.env.GlobalEnv);
      console.log(this.frameworkVar);
      console.log(this.globalVar);     
    }
    // code starts here
    browser.url(url);
  });
};
