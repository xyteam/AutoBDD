const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/functions/common/parseExpectedText.js');
const keycode = require('keycode');
module.exports = function() {
    this.When(
        /^I open a SSH console to the host "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
        { timeout: 15 * 60 * 1000 },
        function (hostName, userName, passWord, consoleName) {
          const myHostName = parseExpectedText(hostName);
          const myUserName = parseExpectedText(userName);
          const myPassWord = parseExpectedText(passWord);
          const myConsole = cmdline_session.remoteConsole(`${myUserName}@${myHostName}`, 22, myPassWord);
          var myConsoleData = {stdout: '', stderr: ''}
          myConsole.stdout.on('data', function (data) {
            myConsoleData.stdout += data;
            // console.log('stdout: ' + myConsoleData.stdout);
          });
          myConsole.stderr.on('data', function (data) {
            myConsoleData.stderr += data;
            // console.log('stderr: ' + myConsoleData.stdout);
          });
          myConsole.on('close', function (code) {
            // console.log('child process exited with code ' + code);
          });
          this.myConsoles = {};
          this.myConsoles[consoleName] = myConsole;
          this.myConsoleData = {};
          this.myConsoleData[consoleName] = myConsoleData;
          myConsole.stdin.write(keycode('enter'));
        }
    );
}

