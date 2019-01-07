module.exports = function() {
  this.Then(/^the java cucumber test should all pass$/, function () {
    expect(this.javacucumber_result).toContain('Failures: 0, Errors: 0, Skipped: 0');
    expect(this.javacucumber_runcode).toBe(0);
  });
};
