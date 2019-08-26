module.exports = function() {
	this.Then(/^browser console log should not contain "([^"]*)" message$/, function (msg) {
    var targetLog = browser.log('browser').value.filter(log => log.level == logLevel);
    console.log(targetLog);
    var targetLogCount = targetLog.length;
    var expectedCount = parseInt(logCount);
    expect(targetLogCount).not.toBeGreaterThan(expectedCount)
  });
};
