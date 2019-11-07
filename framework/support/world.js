// framework_world
const FrameworkPath = process.env.FrameworkPath;

const frameworkWorld = {
    World: function() {
        var self = this;

        self.test_config = require(FrameworkPath + '/framework/configs/default_test_config').test_config;
        self.framework_libs = require(FrameworkPath + '/framework/libs/framework_libs');
        self.browser_session = require(FrameworkPath + '/framework/libs/browser_session');
        self.cmdline_session = require(FrameworkPath + '/framework/libs/cmdline_session');
        self.fs_session = require(FrameworkPath + '/framework/libs/fs_session');
        self.javacucumber_session = require(FrameworkPath + '/framework/libs/javacucumber_session');
        self.screen_session = require(FrameworkPath + '/framework/libs/screen_session');
        return self;
    }
}

module.exports = frameworkWorld;
