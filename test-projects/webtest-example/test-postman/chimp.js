require('../global/support/env.js');
const projectFullPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;
// API test is done on Linux platform with Chrome browser only
process.env.PLATFORM = 'Linux';
process.env.BROWSER = 'CH';
module.exports = require(projectFullPath + '/global/support/project_chimp.js');