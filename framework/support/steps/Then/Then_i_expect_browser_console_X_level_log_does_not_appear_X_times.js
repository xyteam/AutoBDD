const { Then } = require('cucumber');
Then(/^I expect the( last)* browser console (SEVERE) level log does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|at least|no less than) (\d+) time(?:s)?)?$/,
  function (last, logLevel, falseCase, compareAction, expectedNumber) {
    const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.getLogs('browser').filter(log => log.level == logLevel);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);

    if (!!false) {
        expect(compareAction).not.toContain('no', 'do not support double negative statement');
        expect(compareAction).not.toContain('at least', 'do not support no at least statement');
        switch (compareAction) {
            case 'exactly':
                expect(targetLogArray.length).not.toEqual(parseInt(myExpectedNumber));
                break;
            case 'more than':
                expect(targetLogArray.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'less than':
                expect(targetLogArray.length).not.toBeLessThan(parseInt(myExpectedNumber));
                break;
          }      
    } else {
        switch (compareAction) {
            case 'exactly':
                expect(targetLogArray.length).toEqual(parseInt(myExpectedNumber));
                break;
            case 'not exactly':
                expect(targetLogArray.length).not.toEqual(parseInt(myExpectedNumber));
                break;
            case 'more than':
                expect(targetLogArray.length).toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'no more than':
                expect(targetLogArray.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'less than':
                expect(targetLogArray.length).toBeLessThan(parseInt(myExpectedNumber));
                break;
            case 'at least':
            case 'no less than':
                expect(targetLogArray.length).not.toBeLessThan(parseInt(myExpectedNumber));
                break;
        }      
    }
  });


