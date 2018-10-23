// global/support/world.js
const ProjectFullPath = process.env.ProjectFullPath || process.env.HOME + '/Projects/AI-Exercise';
module.exports = {
  World: function() {
    this.URL = require('url-parse');
    this.stringify = require('json-stable-stringify');
    this.tabletojson = require('tabletojson');
    this.accounting = require('accounting');
    this.numeral = require('numeral');
    this.percent = require('percent');
    this.words2num = require('words-to-numbers');
    this.moment = require('moment');
    this.cmd = require('node-cmd');
    this.mssql = require('mssql');
    this.uuidv4 = require('uuid/v4');

    switch (process.env.NODE_ENV) {
        case "Tensorflow":
            this.user_login_config = require(ProjectFullPath + '..');
            this.test_config = require(ProjectFullPath + '.').test_config;
            break;
        default:
            break
    }

    this.wait5 = 5*1000;
    this.wait10 = 10*1000;
    this.wait15 = 15*1000;
    this.wait30 = 30*1000;
    this.wait60 = 60*1000;

    this.test_url = this.test_config.test_url;
    this.api_url = this.test_config.api_url;
    this.portfolio = this.test_config.portfolio;
    this.browser_x_offset = this.test_config.browser_x_offset;
    this.browser_y_offset = this.test_config.browser_y_offset;
    this.stepTimeoutDefault = this.test_config.stepTimeoutDefault;
    this.stepTimeoutMore = this.test_config.stepTimeoutMore;
    this.stepTimeoutLong = this.test_config.stepTimeoutLong;
    this.stepTimeoutMax = this.test_config.stepTimeoutMax;
    this.waitMax = this.test_config.waitMax;
    this.waitDefault = this.test_config.waitDefault;
    this.sp_user = this.test_config.sp_user;
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

    this.xpath_lib = require(ProjectFullPath + '/global/libs/xpath_lib');
    this.regex_lib = require(ProjectFullPath + '/global/libs/regex_lib');
    this.url_lib = require(ProjectFullPath + '/global/libs/url_lib');
    this.api_lib = require(ProjectFullPath + '/global/libs/api_lib');
    this.browser_session = require(ProjectFullPath + '/global/libs/browser_session');
    this.api_session = require(ProjectFullPath + '/global/libs/api_session');
    this.robot_session = require(ProjectFullPath + '/global/libs/robot_session');
    this.file_session = require(ProjectFullPath + '/global/libs/file_session');
    this.mssql_session = require(ProjectFullPath + '/global/libs/mssql_session');
    this.time_lib = require(ProjectFullPath + '/global/libs/time_lib');;
    if (process.env.DISPLAY != ':0') {
      this.test_user = require(ProjectFullPath + '/global/support/testUsers').assignTestUser();
    } else {
      this.test_user = this.test_config.test_user;
    }
    return this;
  }
}
