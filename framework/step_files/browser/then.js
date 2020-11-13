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

Then(
    /^I expect (?:that )?the page title does( not)* (contain|equal|match) the (text|value|regex) "(.*)?"$/,
    checkTitle
);

Then(
    /^I expect (?:that )?the element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|at least|no less than) ([^\s]+) time(?:s)?)?$/,
    checkIfElementExistsInsideParentElement
);

Then(
    /^I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?( not)* (contains|equals|matches) the (text|regex|value) "(.*)?"$/,
    checkIfElementInsideParentElementEqualsMatchesTextOrValue
);

Then(
    /^I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? (?:element|checkbox) "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? (?:is|does)( not)* (existing|displayed|visible|enabled|clickable|focused|selected|checked|contain|equal|match)(?: the (text|regex|value) "(.*)?")*$/,
    checkIfElementInsideParentElementEqualsMatchesTextOrValue2
);

Then(
    /^I expect (?:that )?(?:(some|all) of )?the (?:element|checkbox) "([^"]*)?" (become(?:s)?)( not)* (existing|displayed|visible|enabled|clickable|focused|selected|checked)$/,
    checkCondition
);

Then(
    /^I expect (?:that )?the element "([^"]*)?" is( not)* within the viewport$/,
    checkWithinViewport
);

Then(
    /^I expect (?:that )?the element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
    compareText
);

Then(
    /^I expect (?:that )?the element "([^"]*)?"( not)* contains (?:any|some) (text|value)$/,
    checkContainsAnyTextOrValue
);

Then(
    /^I expect (?:that )?the element "([^"]*)?" (text|value) is( not)* empty$/,
    checkElementTextValueIsEmpty
);

Then(
    /^I expect the (full URL|URL protocol|URL host|URL host port|URL path) to( not)* (be|contain|match) "(.*)?"$/,
    checkURL
);

Then(
    /^I expect (?:that )?the( css)* attribute "([^"]*)?" from element "([^"]*)?" (is|contains|matches)( not)* "(.*)?"$/,
    checkProperty
);

Then(
    /^I expect (?:that )?all data entries in the downloaded json file "([^"]*)?" conform to the template file "([^"]*)?"$/,
    checkDownloadedJsonFileConformsTemplateFile
);

Then(
    /^I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) line(?:s)?$/,
    checkDownloadedFileContainsNumOfLines
);

Then(
    /^I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (row|data row)(?:s)?(?: and((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (column|data column)(?:s)?)?$/,
    checkDownloadedFileContainsRowsAndColumns
);

Then(
    /^I expect (?:that )?the downloaded file "([^"]*)?"(?: at (?:line|row) (\d+)(?: and column (\d+))?)? does( not)* (contain|equal|match) the (?:text|value|regex) "(.*)?"$/,
    checkDownloadedFileContainsEqualsMatchesText
);

Then(
    /^I expect (?:that )?the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
    checkFontProperty
);

Then(
    /^I expect (?:that )?the cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
    checkCookieContent
);

Then(
    /^I expect (?:that )?the cookie "([^"]*)?"( not)* exists$/,
    checkCookieExists
);

Then(
    /^I expect (?:that )?the element "([^"]*)?" is( not)* ([\d.]+)px (broad|tall)$/,
    checkDimension
);

Then(
    /^I expect (?:that )?the element "([^"]*)?" is( not)* positioned at ([\d.]+)px on the (x|y) axis$/,
    checkOffset
);

Then(
    /^I expect (?:that )?the element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
    checkClass
);

Then(
    /^I expect (?:that )?a new (window|tab) has( not)* been opened$/,
    checkNewWindow
);

Then(
    /^I expect (?:that )?the url "([^"]*)?" is opened in a new (tab|window)$/,
    checkIsOpenedInNewWindow
);

Then(
    /^I expect (?:that )?a (alertbox|confirmbox|prompt) is( not)* opened$/,
    checkModal
);

Then(
    /^I expect (?:that )?a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
    checkModalText
);
