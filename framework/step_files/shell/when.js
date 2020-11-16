const { When } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/step_functions/common/parseExpectedText');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const cmdline_session = require(FrameworkPath + '/framework/libs/cmdline_session');
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const stripAnsi = require('strip-ansi');
const keycode = require('keycode');

When(/^(?::shell: )?I assign "([^"]*)?" value to(?: the)? "([^"]*)?" ENV if necessary$/,
  (envValue, envTarget) => {
    process.env[envTarget] = (process.env[envTarget]) ? process.env[envTarget] : envValue;
  }
);

When(/^(?::shell: )?I open a SSH console to the host "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
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
});

When(/^(?::shell: )?I copy (test file|downloaded file|folder) "(.*)" to scp target "(.*)" with password "(.*)"$/,
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
});

When(/^(?::shell: )?I run the following command set to the SSH console "(.*)":$/,
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
});

When(/^(?::shell: )?I run the following remote command set:$/,
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
});

When(/^(?::shell: )?I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" console to( not)* display the (text|regex) "(.*)?"$/,
{ timeout: 60 * 60 * 1000 },
function (waitIntvSec, waitTimeoutMnt, firstOrLast, lineCount, consoleName, falseState, expectType, expectedText) {
    // parse input
    const myConsoleName = parseExpectedText(consoleName);
    const myExpectedText = parseExpectedText(expectedText);
    const myWaitTimeoutMnt = parseInt(waitTimeoutMnt) || 1;
    const myWaitIntvSec = parseInt(waitIntvSec) || 15;

    // get consoleData object set up by previous step
    const myConsoleData = this.myConsoleData;
    // prepare wait and timeout condition
    var boolFalseState = !!falseState;
    var keepWaiting = true;
    var timeOut = false;
    var handle = setInterval(() => {
        console.log(`wait timeout: ${consoleName}, ${myWaitTimeoutMnt} minute(s)`);
        timeOut = true;
    }, myWaitTimeoutMnt * 60 * 1000);

    // wait and check loop
    do {
        // wait
        browser.pause(myWaitIntvSec * 1000)
        // check
        // only keep 10k text
        const myReadIndex = ((Buffer.byteLength(myConsoleData[myConsoleName].stdout) - 10240) > 0) ? Buffer.byteLength(myConsoleData[myConsoleName].stdout) - 10240 : 0;
        const lineArray = stripAnsi(myConsoleData[myConsoleName].stdout.slice(myReadIndex)).split(/[\r\n]+/);
        browser_session.displayMessage(browser, lineArray.join('\n'));
        var lineText;
        switch (firstOrLast) {
            case 'first':
                lineText = lineArray.slice(0, lineCount).join('\n');
                break;
            case 'last':
                lineText = lineArray.slice(-lineCount).join('\n');
                break;
            default:
                lineText = lineArray.join('\n');
                break;
        }
        switch (expectType) {
            case 'regex':
                let myRegex = new RegExp(myExpectedText, 'i');
                keepWaiting = !lineText.match(myRegex);
                break;
            case 'text':
            default:
                keepWaiting = !lineText.includes(myExpectedText);
                break;
        }
        if (boolFalseState) {
            keepWaiting = !keepWaiting;
        }
        // loop decision
        console.log(`lineArray: ${lineArray.toString()}`);
        console.log(`lineText: ${lineText}`);
        console.log(`expectedText: ${myExpectedText}`);
        console.log(`keepWaiting: ${keepWaiting}`);
        console.log(`timeOut: ${timeOut}`);
    } while (keepWaiting && !timeOut)

    // clear timeout
    clearInterval(handle);
});

When(/^(?::shell: )?I flush the "(.*)" console output$/,
{ timeout: 60 * 1000 },
function (consoleName) {
    // parse input
    const myConsoleName = parseExpectedText(consoleName);
    // flush
    this.myConsoleData[myConsoleName].stdout = '';
});

When(/^(?::shell: )?I (?:type|press) (?:the )?"(.*)" (key|string) (?:(\d+) time(?:s)? )?to the console "(.*)"$/,
{ timeout: 60 * 1000 },
function (inputContent, inputType, repeatTimes, consoleName) {
    // parse input
    const myInputContent = parseExpectedText(inputContent);
    const myRepeatTimes = repeatTimes || 1;
    const myConsoleName = parseExpectedText(consoleName);

    // get consoleData object set up by previous step
    const myConsole = this.myConsoles[myConsoleName];
    myConsole.stdin.setEncoding = 'utf-8';
    switch (inputType) {
        case 'key':
            const myKeyCode = String.fromCharCode((myInputContent.toLowerCase() == 'cancel') ? 3 : keycode(myInputContent));
            for (i = 0; i < myRepeatTimes; i++) {
                myConsole.stdin.write(myKeyCode);
            }
            break;
        case 'string':
            for (i = 0; i < myRepeatTimes; i++) {
                myConsole.stdin.write(myInputContent);
            }
            break;
    }
});
