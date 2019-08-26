// common place to define test config vars that can be used through out the framework
// example:
// in World.js
// this.test_config = require('<path_to_this_file>')
// through out the code the below variables can be access as this.test_config.xyz
exports.test_config = {
  browser_x_offset: 0,
  browser_y_offset: 70,
  stepTimeoutDefault: 60*1000,
  stepTimeoutMore: 120*1000,
  stepTimeoutLong: 300*1000,
  stepTimeoutMax: 600*1000,
  waitMax: 120*1000,
  waitDefault: 15*1000
};
