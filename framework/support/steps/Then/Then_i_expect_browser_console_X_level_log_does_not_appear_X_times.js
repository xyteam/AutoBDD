const { Then } = require('cucumber');
Then(/^I expect the( last)* browser console (SEVERE) level log does( not)* appear(?: (exactly|not exactly|more than|no more than|less than|no less than) (\d+) time(?:s)?)?$/,
  function (last, logLevel, falseCase, compareAction, expectedNumber) {
    const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
    const myCompareAction = compareAction || ((typeof falseCase == 'undefined') ? 'more than' : 'exactly');

    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.log('browser').value.filter(log => log.level == logLevel);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);

    switch (myCompareAction) {
      case 'exactly':
          expect(targetLogArray.length).toEqual(parseInt(myExpectedNumber));
          break;
      case 'not exactly':
          expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
          expect(targetLogArray.length).not.toEqual(parseInt(myExpectedNumber));
          break;
      case 'more than':
          expect(targetLogArray.length).toBeGreaterThan(parseInt(myExpectedNumber));
          break;
      case 'no more than':
          expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
          expect(targetLogArray.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
          break;
      case 'less than':
          expect(targetLogArray.length).toBeLessThan(parseInt(myExpectedNumber));
          break;
      case 'no less than':
          expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
          expect(targetLogArray.length).not.toBeLessThan(parseInt(myExpectedNumber));
          break;
    }
  });


