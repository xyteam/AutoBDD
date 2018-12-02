require('../global/support/env.js');
const projectFullPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;
module.exports = require(projectFullPath + '/global/support/project_chimp.js');