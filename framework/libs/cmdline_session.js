// cmdline_session.js provides functions to run test in command line

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
    var result_displayData = encodeUrl(result);
    browser.url('data: text/plain;charset=utf-8, ' + result_displayData);
    browser.pause(1000);
    return {"output": result, "exitcode": exitcode}    
  },

  runNewman: function(collection, environment) {
    var newman_command = 'newman run -e ' + collection
                         + ' '
                         + environment;
    console.log(newman_command);
    var newman_result = this.runCmd(newman_command);
    return newman_result;
  }
}
