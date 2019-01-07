// javacucumber_session.js provides functions to run java cucumber test in command line

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs = require('fs');
const execSync = require('child_process').execSync;
const encodeUrl = require('encodeurl');

module.exports = {
  runCmd: function(command) {
    var result;
    var exitcode;
    try {
        result = execSync(command).toString();
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }
    return {"output": result, "exitcode": exitcode}    
  },

  runJavaCucumberScenario: function(javaProject, feature, scenario) {
    var javaProjectPath = FrameworkPath + '/test-projects/' + javaProject;
    var mvn_command = 'cd ' + javaProjectPath + '; ';
    mvn_command += 'mvn clean test ';
    mvn_command += '-Dbrowser=\"chrome\" ';
    mvn_command += '-Dcucumber.options=\"classpath:features/' + feature + '\" ';
    mvn_command += '-Dcucumber.options=\"--name \'' + scenario + '\'\" ';
    console.log(mvn_command);
    var mvn_result = this.runCmd(mvn_command);
    return mvn_result;
  }
}
