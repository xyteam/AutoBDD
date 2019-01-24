require('../project/support/project_env.js');
const projectFullPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;

var moduleChimp = require(projectFullPath + '/project/support/project_chimp.js');
// modify or add myChimp attributes as necessary
module.exports = moduleChimp; 