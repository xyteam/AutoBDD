const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const stripAnsi = require('strip-ansi');

module.exports = function() {
  this.Then(
    /^I expect (?:that )?(?:the (first|last) (\d+) line(?:s)? of )?the "(.*)?" console does( not)* (contain|equal|match) the (text|regex) "(.*)?"$/,
    {timeout: process.env.StepTimeoutInMS},
    function (firstOrLast, lineCount, consoleName, falseCase, compareAction, expectType, expectedText) {
      // parse input
      const parsedConsoleName = parseExpectedText(consoleName);
      const parsedExpectedText = parseExpectedText(expectedText);

      // get consoleData object set up by previous step
      browser.pause(500);
      const myConsoleData = this.myConsoleData;
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
      }

      let boolFalseCase = !!falseCase;
      if (boolFalseCase) {
        switch (compareAction) {
          case 'contain':
            expect(lineText).not.toContain(
              parsedExpectedText,
              `console should not contain the ${expectType} ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'equal':
            expect(lineText).not.toEqual(
              parsedExpectedText,
              `console should not equal the ${expectType} ` +
              `"${parsedExpectedText}"`
            );        
            break;
          case 'match':
              expect(lineText.toLowerCase()).not.toMatch(
                parsedExpectedText.toLowerCase(),
                `console should match the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
            break;
          default:
            expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      } else {
        switch (compareAction) {
            case 'contain':
              expect(lineText).toContain(
                parsedExpectedText,
                `console should contain the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
          case 'equal':
              expect(lineText).toEqual(
                parsedExpectedText,
                `console should equal the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
            case 'match':
              expect(lineText.toLowerCase()).toMatch(
                parsedExpectedText.toLowerCase(),
                `console should match the ${expectType} ` +
                `"${parsedExpectedText}"`
              );        
              break;
            default:
              expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
        }
      }
    }
  );
}
