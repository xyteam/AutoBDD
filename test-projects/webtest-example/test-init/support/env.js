require('../../project/support/env.js');
// determine module name and path
var moduleName = __dirname.substring(0, __dirname.lastIndexOf('/support'));
moduleName = moduleName.substring(moduleName.lastIndexOf('/') + 1);
process.env.ThisModule = moduleName;
process.env.ModulePath = process.env.ProjectPath + '/' + process.env.ThisModule;
// console.log(process.env.ThisModule);
// console.log(process.env.ModulePath);

// define module level Env vars here
