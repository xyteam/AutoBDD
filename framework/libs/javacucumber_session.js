// javacucumber_session.js provides functions to run java cucumber test in command line

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs = require('fs');
const execSync = require('child_process').execSync;
const encodeUrl = require('encodeurl');
const cmdline_session = require('./cmdline_session');

module.exports = {
  runMvnCleanProject: function(javaProject) {
    var javaProjectPath = FrameworkPath + '/test-projects/' + javaProject;
    var mvn_command = 'cd ' + javaProjectPath + '; ';
    mvn_command += 'DISPLAY=' + process.env.DISPLAY + ' mvn clean';
    console.log(mvn_command);
    var mvn_result = cmdline_session.runCmd(mvn_command);
    return mvn_result;
  },

  runMvnCleanModule: function(javaProject, module) {
    var javaProjectPath = FrameworkPath + '/test-projects/' + javaProject;
    var javaProjectModulePath = javaProjectPath + '/' + module;
    var mvn_command = 'cd ' + javaProjectModulePath + '; ';
    mvn_command += 'DISPLAY=' + process.env.DISPLAY + ' mvn clean';
    console.log(mvn_command);
    var mvn_result = cmdline_session.runCmd(mvn_command);
    return mvn_result;
  },

  runMvnTestScenario: function(javaProject, module, feature, scenario) {
    var javaProjectPath = FrameworkPath + '/test-projects/' + javaProject;
    var javaProjectModulePath = javaProjectPath + '/' + module;
    var mvn_command = 'cd ' + FrameworkPath + '; ';
    mvn_command += '. .autoPathrc.sh; ';
    mvn_command += 'cd ' + javaProjectModulePath + '; ';
    mvn_command += 'DISPLAY=' + process.env.DISPLAY + ' mvn test ';
    mvn_command += '-Dbrowser=\"chrome\" ';
    mvn_command += '-Dcucumber.options=\"classpath:features/' + feature + '\" ';
    mvn_command += '-Dcucumber.options=\"--name \'' + scenario + '\'\" ';
    console.log(mvn_command);
    var mvn_result = cmdline_session.runCmd(mvn_command);
    return mvn_result;
  }
}
