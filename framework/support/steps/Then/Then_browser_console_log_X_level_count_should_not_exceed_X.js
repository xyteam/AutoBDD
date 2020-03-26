module.exports = function() {
	this.Then(/^browser console log (SEVERE) level count should not exceed (\d+)$/, function (logLevel, logCount) {
    var targetLog = browser.log('browser').value.filter(log => log.level == logLevel);
    process.env.LastBrowserLog = targetLog;
    console.log(targetLog);
    browser_session.displayMessage(browser, targetLog);
    var expectedCount = parseInt(logCount);
    expect(targetLog.length).not.toBeGreaterThan(expectedCount)
  });
};
