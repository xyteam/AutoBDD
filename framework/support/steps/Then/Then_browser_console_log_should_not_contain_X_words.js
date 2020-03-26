module.exports = function() {
	this.Then(/^browser console log should not contain "([^"]*)" words$/, function (regexWords) {
    var myRegexWords = regexWords.toLowerCase();
    var anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    var msgRegex = (myRegexWords.indexOf('any error') >=0) ? RegExp(anyRegexWords) : RegExp(myRegexWords);
    var targetLog = browser.log('browser').value.filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = targetLog;
    console.log(targetLog);
    browser_session.displayMessage(browser, targetLog);
    var targetLogCount = targetLog.length;
    expect(targetLogCount).not.toBeGreaterThan(0)
  });
};
