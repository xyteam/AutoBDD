const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const stripAnsi = require('strip-ansi');
const { When } = require('cucumber');
When(
    /^I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" console to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 60*60*1000},
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
      }, myWaitTimeoutMnt*60*1000);

      // wait and check loop
      do {
        // wait
        browser.pause(myWaitIntvSec*1000)
        // check
        // only keep 10k text
        const myReadIndex = ((Buffer.byteLength(myConsoleData[myConsoleName].stdout) - 10240) > 0) ? Buffer.byteLength(myConsoleData[myConsoleName].stdout) - 10240 : 0;
        const lineArray = stripAnsi(myConsoleData[myConsoleName].stdout.slice(myReadIndex)).split(/[\r\n]+/);
        browser_session.displayMessage(browser, lineArray.join('\n'));
        var lineText;
        switch(firstOrLast) {
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
    }
  );

