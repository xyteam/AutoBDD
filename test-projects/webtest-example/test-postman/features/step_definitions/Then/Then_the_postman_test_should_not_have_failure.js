module.exports = function() {
  this.Then(/^the postman test should not have failure$/, function () {
    expect(this.postman_result).not.toMatch('#.*failure.*detail');
    expect(this.postman_runcode).toBe(0);
  });
};
