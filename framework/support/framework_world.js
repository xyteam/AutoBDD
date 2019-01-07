// global vars and functions for test scripts accessible through this.var_name
const frameworkPath = process.env.FrameworkPath;
const frameworkWorld = {
    World: function() {
        var self = this;
        self.frameworkVar = 'defined in framework_world.js';
        self.test_config = require(frameworkPath + '/framework/configs/default_test_config').test_config;

        self.browser_session = require(frameworkPath + '/framework/libs/browser_session');
        self.cmdline_session = require(frameworkPath + '/framework/libs/cmdline_session');
        self.screen_session = require(frameworkPath + '/framework/libs/screen_session');
        self.fs_session = require(frameworkPath + '/framework/libs/fs_session');
        self.framework_libs = require(frameworkPath + '/framework/libs/framework_libs');
        return self;
    }
}
module.exports = frameworkWorld;
