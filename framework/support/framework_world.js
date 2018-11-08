const frameworkPath = process.env.FrameworkPath;
const frameworkWorld = {
    World: function() {
        var self = this;
        self.frameworkVar = 'defined in framework_world.js';
        self.URL = require('url-parse');
        self.words2num = require('words-to-numbers');
        self.moment = require('moment');
        self.cmd = require('node-cmd');

        self.test_config = require(frameworkPath + '/framework/configs/browser_default_config').test_config;

        self.wait5 = 5*1000;
        self.wait10 = 10*1000;
        self.wait15 = 15*1000;
        self.wait30 = 30*1000;
        self.wait60 = 60*1000;

        self.browser_x_offset = self.test_config.browser_x_offset;
        self.browser_y_offset = self.test_config.browser_y_offset;
        self.stepTimeoutDefault = self.test_config.stepTimeoutDefault;
        self.stepTimeoutMore = self.test_config.stepTimeoutMore;
        self.stepTimeoutLong = self.test_config.stepTimeoutLong;
        self.stepTimeoutMax = self.test_config.stepTimeoutMax;
        self.waitMax = self.test_config.waitMax;
        self.waitDefault = self.test_config.waitDefault;
        self.waitMaxMax = self.test_config.waitMax*2;
        self.stepTimeoutMaxMax = self.test_config.stepTimeoutMax*2;

        self.today = new Date();
        self.current_year = new Date().getFullYear();
        self.end_of_last_month = new Date(self.today.getFullYear(), self.today.getMonth(), 0);
        self.first_saturday_of_the_month = (function() {
          var td=new Date(), y=td.getFullYear(), m=td.getMonth();
          var firstSaturday=1;
          while (new Date(y,m,firstSaturday).getDay()!=6)
            firstSaturday++;
          return new Date(y,m,firstSaturday);
        })();
        self.currentTimeStamp = (new Date()).toISOString();
        self.noRecordFound_message = 'No matching records found.';

        self.browser_session = require(frameworkPath + '/framework/libs/browser_session');
        self.robot_session = require(frameworkPath + '/framework/libs/robot_session');
        return self;
    }
}
module.exports = frameworkWorld;
