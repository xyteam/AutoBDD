module.exports = function() {
	this.Then(/^browser console log (SEVERE) level count should not exceed (\d+)$/, function (logLevel, logCount) {
    var targetLog = browser.log('browser').value.filter(log => log.level == logLevel);
    console.log(targetLog);
    var expectedCount = parseInt(logCount);
    expect(targetLog.length).not.toBeGreaterThan(expectedCount)
  });
};
