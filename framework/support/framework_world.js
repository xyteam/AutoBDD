// global/support/world.js
const myFrameworkPath = process.env.FrameworkPath;
module.exports = {
  World: function() {
    this.URL = require('url-parse');
    this.words2num = require('words-to-numbers');
    this.moment = require('moment');
    this.cmd = require('node-cmd');

    this.test_config = require(myFrameworkPath + '/global/configs/browser_default_config').test_config;

    this.wait5 = 5*1000;
    this.wait10 = 10*1000;
    this.wait15 = 15*1000;
    this.wait30 = 30*1000;
    this.wait60 = 60*1000;

    this.browser_x_offset = this.test_config.browser_x_offset;
    this.browser_y_offset = this.test_config.browser_y_offset;
    this.stepTimeoutDefault = this.test_config.stepTimeoutDefault;
    this.stepTimeoutMore = this.test_config.stepTimeoutMore;
    this.stepTimeoutLong = this.test_config.stepTimeoutLong;
    this.stepTimeoutMax = this.test_config.stepTimeoutMax;
    this.waitMax = this.test_config.waitMax;
    this.waitDefault = this.test_config.waitDefault;
    this.waitMaxMax = this.test_config.waitMax*2;
    this.stepTimeoutMaxMax = this.test_config.stepTimeoutMax*2;

    this.today = new Date();
    this.current_year = new Date().getFullYear();
    this.end_of_last_month = new Date(this.today.getFullYear(), this.today.getMonth(), 0);
    this.first_saturday_of_the_month = (function() {
      var td=new Date(), y=td.getFullYear(), m=td.getMonth();
      var firstSaturday=1;
      while (new Date(y,m,firstSaturday).getDay()!=6)
        firstSaturday++;
      return new Date(y,m,firstSaturday);
    })();
    this.currentTimeStamp = (new Date()).toISOString();
    this.noRecordFound_message = 'No matching records found.';

    this.browser_session = require(myFrameworkPath + '/global/libs/browser_session');
    this.robot_session = require(myFrameworkPath + '/global/libs/robot_session');

    return this;
  }
}
