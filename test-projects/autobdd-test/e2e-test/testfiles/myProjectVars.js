// myProjectVars.js is an example file and test file for defining test varibles within a test project.
// variables defined here can be referenced as VAR:myProjectVars.varName or Var{myProjectVars.varName} in the feature fles within the same test project.
// i.e., logo_xpath content can be referenced as VAR:myProjectVars.logo_xpath or Var{myProjectVars.logo_xpath} within the test project autobdd-test/e2e-test.
const All = {
  logo_fullxpath: '/html/body/div/div'
};

const CH = {
};

const IE = {
};

// Variables have the same name will override the previous variable of the same name up to this point.
// Variables defined in browser specific group (CH, IE) will override the same variable defined in All group.
module.exports = Object.assign(All, eval(process.env.BROWSER));

