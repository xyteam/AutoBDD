require('../project/support/env.js');
const projectFullPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;

var moduleChimp = require(projectFullPath + '/project/support/chimp.js');
// modify or add myChimp attributes as necessary
module.exports = moduleChimp; 