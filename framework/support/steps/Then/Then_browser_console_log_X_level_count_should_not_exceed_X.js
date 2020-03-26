module.exports = function() {
  this.Then(/^the( last)* browser console log (SEVERE) level count should( not)* exceed (\d+)$/,
  function (last, logLevel, falseCase, logCount) {
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.log('browser').value.filter(log => log.level == logLevel);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
    const expectedCount = parseInt(logCount);
    if (falseCase) {
      expect(targetLogArray.length).not.toBeGreaterThan(expectedCount);
    } else {
      expect(targetLogArray.length).toBeGreaterThan(expectedCount);
    }
  });
};
