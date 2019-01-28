// if the framework is used
if (process.env.FrameworkPath) {
    require(process.env.FrameworkPath + '/framework/support/framework_env.js');
    process.env.ThisProject = 'webtest-example';
    process.env.ProjectPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;
} 
// define project level Env vars here
