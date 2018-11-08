const frameworkPath = process.env.FrameworkPath;
const frameworkWorld = {
    World: function() {
        var self = this;
        self.frameworkVar = 'defined in framework_world.js';
        self.test_config = require(frameworkPath + '/framework/configs/default_test_config').test_config;

        self.browser_session = require(frameworkPath + '/framework/libs/browser_session');
        self.screen_session = require(frameworkPath + '/framework/libs/screen_session');
        self.fs_session = require(frameworkPath + '/framework/libs/fs_session');
        return self;
    }
}
module.exports = frameworkWorld;
