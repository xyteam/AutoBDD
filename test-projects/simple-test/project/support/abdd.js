var projectAbdd;
// if the framework is used
if (process.env.FrameworkPath) {
    projectAbdd = require(process.env.FrameworkPath + '/framework/support/abdd.js');
}
// modify or add myAbdd attributes as necessary
module.exports = projectAbdd; 