// if the framework is used
if (process.env.FrameworkPath) {
    require(process.env.FrameworkPath + '/framework/support/framework_env.js');  
} 
// define global Env vars here
process.env.ThisProject = 'webtest-example';
process.env.ProjectEnv = 'defined in project_env.js';
