const parseExpectedText = require(process.env.FrameworkPath + '/framework/functions/common/parseExpectedText.js');
const keycode = require('keycode');

const { When } = require('cucumber');
When(/^I flush the "(.*)" console output$/,
  { timeout: 60*1000 },
  function (consoleName) {
    // parse input
    const myConsoleName = parseExpectedText(consoleName);
    // flush
    this.myConsoleData[myConsoleName].stdout = '';
  });

When(/^I (?:type|press) (?:the )?"(.*)" (key|string) (?:(\d+) time(?:s)? )?to the console "(.*)"$/,
  { timeout: 60*1000 },
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
        for (i=0; i<myRepeatTimes; i++) {
          myConsole.stdin.write(myKeyCode);
        }
        break;
      case 'string':
        for (i=0; i<myRepeatTimes; i++) {
          myConsole.stdin.write(myInputContent);
        }
        break;
    }
  });
