// myModuleVars.js is an example file and test file for defining test varibles within a test module.
// variables defined here can be referenced as VAR:myModuleVars.varName or Var{myModuleVars.varName} in the feature fles within the same test module.
// i.e., logo_xpath content can be referenced as VAR:myModuleVars.logo_xpath or Var{myModuleVars.logo_xpath} within the test moduletest-autobdd-lib.
const All = {
  logo_xpath: '//*[@id="logo"]/picture/img'
};

const CH = {
};

const IE = {
};

// Variables have the same name will override the previous variable of the same name up to this point.
// Variables defined in browser specific group (CH, IE) will override the same variable defined in All group.
module.exports = Object.assign(All, eval(process.env.BROWSER));

