var projectChimp;
// if the framework is used
if (process.env.FrameworkPath) {
    projectChimp = require(process.env.FrameworkPath + '/framework/support/chimp.js');
} 
// modify or add myChimp attributes as necessary
module.exports = projectChimp; 