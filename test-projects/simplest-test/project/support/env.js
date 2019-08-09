// if the framework is used
if (process.env.FrameworkPath) {
    require(process.env.FrameworkPath + '/framework/support/env.js');

    // determine project name and path
    var projectName = __dirname.substring(0, __dirname.lastIndexOf('/project/support'));
    projectName = projectName.substring(projectName.lastIndexOf('/') + 1);
    process.env.ThisProject = projectName;
    process.env.ProjectPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject;
    // console.log(process.env.ThisProject);
} 
// define project level Env vars here
