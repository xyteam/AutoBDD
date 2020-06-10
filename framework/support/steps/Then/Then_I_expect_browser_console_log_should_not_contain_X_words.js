const { Then } = require('cucumber');
Then(/^I expect the( last)* browser console log should( not)* contain "([^"]*)" words$/,
  function (last, falseCase, regexWords) {
    const myRegexWords = regexWords.toLowerCase();
    const anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    const msgRegex = (myRegexWords.indexOf('any error') >=0) ? RegExp(anyRegexWords) : RegExp(myRegexWords);
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.log('browser').value.filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
    if (falseCase) {
      expect(targetLogArray.length).not.toBeGreaterThan(0);
    } else {
      expect(targetLogArray.length).toBeGreaterThan(0);
    }
  });


