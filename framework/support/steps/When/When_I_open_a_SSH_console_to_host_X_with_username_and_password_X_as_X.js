const parseExpectedText = require(process.env.FrameworkPath + '/framework/functions/common/parseExpectedText.js');
const { When } = require('cucumber');
When(
    /^I open a SSH console to the host "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
    { timeout: 15 * 60 * 1000 },
    function (hostName, userName, passWord, consoleName) {
      const myHostName = parseExpectedText(hostName);
      const myUserName = parseExpectedText(userName);
      const myPassWord = parseExpectedText(passWord);
      var [myConsole, myConsoleData] = this.cmdline_session.remoteConsole(`${myUserName}@${myHostName}`, 22, myPassWord);
      this.myConsoles = {};
      this.myConsoles[consoleName] = myConsole;
      this.myConsoleData = {};
      this.myConsoleData[consoleName] = myConsoleData;
    }
  );

When(
    /^I run the following command set to the SSH console "(.*)":$/,
    { timeout: 15 * 60 * 1000 },
    function (consoleName, table) {
      const myConsole = this.myConsoles[consoleName];
      const commandList = table.rowsHash();
      for (cmd of commandList) {
        this.myConsoleData[consoleName] = '';
        const myCmd = parseExpectedText(cmd);
        myConsole.stdin.write(`${myCmd}\n`);
        console.log(this.myConsoleData[consoleName]);
      }
    }
  );

When(
    /^I run the following remote command set:$/,
    { timeout: 15 * 60 * 1000 },
    function (table) {
      const commandList = table.rowsHash();
      for (cmd of commandList) {
        const myHostName = parseExpectedText(cmd.hostName);
        const myUserName = parseExpectedText(cmd.userName);
        const myPassWord = parseExpectedText(cmd.passWord);
        const myCommand = parseExpectedText(cmd.command);
        const myResult = JSON.parse(this.cmdline_session.remoteRunCmd(myCommand, `${myUserName}@${myHostName}`, 22, myPassWord));
        console.log(myResult);
      }
    }
  );
