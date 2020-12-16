const { Then } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const checkClass = require(FrameworkPath + '/framework/step_functions/check/checkClass');
const checkContainsAnyTextOrValue = require(FrameworkPath + '/framework/step_functions/check/checkContainsAnyTextOrValue');
const checkElementTextValueIsEmpty = require(FrameworkPath + '/framework/step_functions/check/checkElementTextValueIsEmpty');
const checkCondition = require(FrameworkPath + '/framework/step_functions/check/checkCondition');
const checkCookieContent = require(FrameworkPath + '/framework/step_functions/check/checkCookieContent');
const checkCookieExists = require(FrameworkPath + '/framework/step_functions/check/checkCookieExists');
const checkDimension = require(FrameworkPath + '/framework/step_functions/check/checkDimension');
const checkDownloadedJsonFileConformsTemplateFile = require(FrameworkPath + '/framework/step_functions/check/checkDownloadedJsonFileConformsTemplateFile');
const checkDownloadedFileContainsNumOfLines = require(FrameworkPath + '/framework/step_functions/check/checkDownloadedFileContainsNumOfLines');
const checkDownloadedFileContainsRowsAndColumns = require(FrameworkPath + '/framework/step_functions/check/checkDownloadedFileContainsRowsAndColumns');
const checkDownloadedFileContainsEqualsMatchesText = require(FrameworkPath + '/framework/step_functions/check/checkDownloadedFileContainsEqualsMatchesText');
const checkIsOpenedInNewWindow = require(FrameworkPath + '/framework/step_functions/check/checkIsOpenedInNewWindow');
const checkModal = require(FrameworkPath + '/framework/step_functions/check/checkModal');
const checkModalText = require(FrameworkPath + '/framework/step_functions/check/checkModalText');
const checkNewWindow = require(FrameworkPath + '/framework/step_functions/check/checkNewWindow');
const checkOffset = require(FrameworkPath + '/framework/step_functions/check/checkOffset');
const checkProperty = require(FrameworkPath + '/framework/step_functions/check/checkProperty');
const checkFontProperty = require(FrameworkPath + '/framework/step_functions/check/checkFontProperty');
const checkTitle = require(FrameworkPath + '/framework/step_functions/check/checkTitle');
const checkURL = require(FrameworkPath + '/framework/step_functions/check/checkURL');
const checkWithinViewport = require(FrameworkPath + '/framework/step_functions/check/checkWithinViewport');
const compareText = require(FrameworkPath + '/framework/step_functions/check/compareText');
const checkIfElementExistsInsideParentElement = require(FrameworkPath + '/framework/step_functions/check/checkIfElementExistsInsideParentElement');
const checkIfElementInsideParentElementEqualsMatchesTextOrValue = require(FrameworkPath + '/framework/step_functions/check/checkIfElementInsideParentElementEqualsMatchesTextOrValue');
const checkIfElementInsideParentElementEqualsMatchesTextOrValue2 = require(FrameworkPath + '/framework/step_functions/check/checkIfElementInsideParentElementEqualsMatchesTextOrValue2');
const checkIfParentElementEqualsMatchesTextOrValue = require(FrameworkPath + '/framework/step_functions/check/checkIfParentElementEqualsMatchesTextOrValue');

Then(/^(?::browser: )?I expect the( last)* browser console log should( not)* contain "([^"]*)" words$/,
function (last, falseCase, regexWords) {
    const myRegexWords = regexWords.toLowerCase();
    const anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    const msgRegex = (myRegexWords.indexOf('any error') >= 0) ? RegExp(anyRegexWords) : RegExp(myRegexWords);
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.getLogs('browser').filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
    if (falseCase) {
        expect(targetLogArray.length).not.toBeGreaterThan(0);
    } else {
        expect(targetLogArray.length).toBeGreaterThan(0);
    }
});

Then(/^(?::browser: )?I expect the( last)* browser console (SEVERE) level log does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|at least|no less than) (\d+) time(?:s)?)?$/,
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

Then(/^(?::browser: )?I should see the "([^"]*)" (button|label|option|modalDialog) on the page$/,
    { timeout: 60 * 1000 },
    function (elementText, elementName) {
        const textedElements = require(FrameworkPath + '/framework/testfiles/textedElements');
        const targetElement = eval('textedElements.texted_' + elementName).replace('__TEXT__', elementText);
        browser.$(targetElement).waitForDisplayed(500);
        expect(browser.$(targetElement).isDisplayed()).toBe(true);
    });

Then(/^(?::browser: )?the "([^"]*)" modal\-dialoag should contain these select\-option$/, { timeout: 60 * 1000 }, function (modalText, table) {
    const web_selectors = this.web_selectors;
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    const myModalDialog_select = myModalDialog + web_selectors.select;
    var expected_browserList = table.hashes();
    var displayed_browserList = browser.$(myModalDialog_select).getText();
    browser.$(myModalDialog_select).click();
    expected_browserList.forEach(function (row) {
        expect(displayed_browserList).toContain(row['browser_name']);
    });
});

Then(
    /^(?::browser: )?I expect (?:that )?the page title does( not)* (contain|equal|match) the (text|value|regex) "(.*)?"$/,
    checkTitle
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|at least|no less than) ([^\s]+) time(?:s)?)?$/,
    checkIfElementExistsInsideParentElement
);

Then(
    /^(?::browser: )?I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?( not)* (contains|equals|matches) the (text|regex|value) "(.*)?"$/,
    checkIfElementInsideParentElementEqualsMatchesTextOrValue
);

Then(
    /^(?::browser: )?I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? (?:element|checkbox) "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? (?:is|does)( not)* (existing|displayed|visible|enabled|clickable|focused|selected|checked|contain|equal|match)(?: the (text|regex|value) "(.*)?")*$/,
    checkIfElementInsideParentElementEqualsMatchesTextOrValue2
);

Then(
    /^(?::browser: )?I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?" of the child element "([^"]*)?" (?:is|does)( not)* (existing|displayed|visible|enabled|clickable|focused|selected|checked|contain|equal|match)(?: the (text|regex|value) "(.*)?")*$/,
    checkIfParentElementEqualsMatchesTextOrValue
);

Then(
    /^(?::browser: )?I expect (?:that )?(?:(some|all) of )?the (?:element|checkbox) "([^"]*)?" (become(?:s)?)( not)* (existing|displayed|visible|enabled|clickable|focused|selected|checked)$/,
    checkCondition
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?" is( not)* within the viewport$/,
    checkWithinViewport
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
    compareText
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?"( not)* contains (?:any|some) (text|value)$/,
    checkContainsAnyTextOrValue
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?" (text|value) is( not)* empty$/,
    checkElementTextValueIsEmpty
);

Then(
    /^(?::browser: )?I expect the (full URL|URL protocol|URL host|URL host port|URL path) to( not)* (be|contain|match) "(.*)?"$/,
    checkURL
);

Then(
    /^(?::browser: )?I expect (?:that )?the( css)* attribute "([^"]*)?" from element "([^"]*)?" (is|contains|matches)( not)* "(.*)?"$/,
    checkProperty
);

Then(
    /^(?::browser: )?I expect (?:that )?all data entries in the downloaded json file "([^"]*)?" conform to the template file "([^"]*)?"$/,
    checkDownloadedJsonFileConformsTemplateFile
);

Then(
    /^(?::browser: )?I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) line(?:s)?$/,
    checkDownloadedFileContainsNumOfLines
);

Then(
    /^(?::browser: )?I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (row|data row)(?:s)?(?: and((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (column|data column)(?:s)?)?$/,
    checkDownloadedFileContainsRowsAndColumns
);

Then(
    /^(?::browser: )?I expect (?:that )?the downloaded file "([^"]*)?"(?: at (?:line|row) (\d+)(?: and column (\d+))?)? does( not)* (contain|equal|match) the (?:text|value|regex) "(.*)?"$/,
    checkDownloadedFileContainsEqualsMatchesText
);

Then(
    /^(?::browser: )?I expect (?:that )?the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
    checkFontProperty
);

Then(
    /^(?::browser: )?I expect (?:that )?the cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
    checkCookieContent
);

Then(
    /^(?::browser: )?I expect (?:that )?the cookie "([^"]*)?"( not)* exists$/,
    checkCookieExists
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?" is( not)* ([\d.]+)px (broad|tall)$/,
    checkDimension
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?" is( not)* positioned at ([\d.]+)px on the (x|y) axis$/,
    checkOffset
);

Then(
    /^(?::browser: )?I expect (?:that )?the element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
    checkClass
);

Then(
    /^(?::browser: )?I expect (?:that )?a new (window|tab) has( not)* been opened$/,
    checkNewWindow
);

Then(
    /^(?::browser: )?I expect (?:that )?the url "([^"]*)?" is opened in a new (tab|window)$/,
    checkIsOpenedInNewWindow
);

Then(
    /^(?::browser: )?I expect (?:that )?a (alertbox|confirmbox|prompt) is( not)* opened$/,
    checkModal
);

Then(
    /^(?::browser: )?I expect (?:that )?a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
    checkModalText
);
