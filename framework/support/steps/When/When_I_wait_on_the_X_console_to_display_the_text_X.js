const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const stripAnsi = require('strip-ansi');

module.exports = function() {
  this.When(
    /^I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the "([^"]*)?" console to( not)* display the (text|regex) "(.*)?"$/,
    {timeout: 15*60*1000},
    function (waitIntvSec, waitTimeoutMnt, firstOrLast, lineCount, consoleName, falseState, expectType, expectedText) {
      // parse input
      const parsedConsoleName = parseExpectedText(consoleName);
      const parsedExpectedText = parseExpectedText(expectedText);
      const parsedWaitTimeoutMnt = parseInt(waitTimeoutMnt) || 1;
      const parsedWaitIntvSec = parseInt(waitIntvSec) || 15;

      // get consoleData object set up by previous step
      const myConsoleData = this.myConsoleData;

      // prepare wait and timeout condition
      var boolFalseState = !!falseState;
      var keepWaiting = true;
      var timeOut = false;
      var handle = setInterval(() => {
        console.log(`wait timeout: ${consoleName}, ${parsedWaitTimeoutMnt} minute(s)`);
        timeOut = true;
      }, parsedWaitTimeoutMnt*60*1000);

      // wait and check loop
      do {
        // wait
        browser.pause(parsedWaitIntvSec*1000)
        // check
        const lineArray = stripAnsi(myConsoleData[parsedConsoleName].stdout).split(/[\r\n]+/);
        browser_session.displayMessage(browser, lineArray.join('\n'));
        var lineText;
        switch(firstOrLast) {
          case 'first':
              lineText = lineArray.slice(0, lineCount).join('\n');
            break;
          case 'last':
              lineText = lineArray.slice(lineArray.length - lineCount, lineArray.length).join('\n');
            break;
          default:
            lineText = lineArray.join('\n');
            break;
        }
        switch (expectType) {
          case 'regex':
            let myRegex = new RegExp(parsedExpectedText, 'i');
            keepWaiting = !lineText.match(myRegex);
            break;
          case 'text':
          default:
            keepWaiting = !lineText.includes(parsedExpectedText);
            break;
        }
        if (boolFalseState) {
          keepWaiting = !keepWaiting;
        }
        // loop decision
        console.log(`lineArray: ${lineArray.toString()}`);
        console.log(`lineText: ${lineText}`);
        console.log(`expectedText: ${parsedExpectedText}`);
        console.log(`keepWaiting: ${keepWaiting}`);
        console.log(`timeOut: ${timeOut}`);
      } while (keepWaiting && !timeOut)

      // clear timeout
      clearInterval(handle);
    }
  );
}
