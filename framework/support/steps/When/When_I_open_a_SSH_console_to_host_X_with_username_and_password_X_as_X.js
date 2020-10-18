const parseExpectedText = require(process.env.FrameworkPath + '/framework/functions/common/parseExpectedText.js');
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const cmdline_session = require(FrameworkPath + '/framework/libs/cmdline_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { When } = require('cucumber');

When(
  /^I open a SSH console to the host "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  function (hostName, userName, passWord, consoleName) {
    const myHostName = parseExpectedText(hostName);
    const myUserName = parseExpectedText(userName);
    const myPassWord = parseExpectedText(passWord);
    var [myConsole, myConsoleData] = cmdline_session.remoteConsole(`${myUserName}@${myHostName}`, 22, myPassWord);
    this.myConsoles = {};
    this.myConsoles[consoleName] = myConsole;
    this.myConsoleData = {};
    this.myConsoleData[consoleName] = myConsoleData;
  }
);

When(
  /^I copy (test file|downloaded file|folder) "(.*)" to scp target "(.*)" with password "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  function (sourceType, sourceName, scpTarget, scpPassword) {
    var myFileName, myFileExt;
    if (sourceType.includes('file')) {
      const fileName = parseExpectedText(sourceName);
      const fileName_extSplit = fileName.split('.');
      myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
      myFileName = fileName_extSplit.join('.');  
    }
    var sourceFullPath;
    switch (sourceType) {
      case 'test file':
        sourceFullPath = fs_session.getTestFileFullPath(myFileName, myFileExt);
        break;
      case 'downloaded file':
        sourceFullPath = fs_session.checkDownloadFile(myFileName, myFileExt);
        break;
      case 'folder':
        sourceFullPath = sourceName;
        break;    
    }
    cmdline_session.remoteCopy(sourceFullPath, scpTarget, 22, scpPassword);  
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
      const myResult = JSON.parse(cmdline_session.remoteRunCmd(myCommand, `${myUserName}@${myHostName}`, 22, myPassWord));
      console.log(myResult);
    }
  }
);
