const checkClass = require('../../functions/check/checkClass');
const checkContainsAnyTextOrValue = require('../../functions/check/checkContainsAnyTextOrValue');
const checkElementTextValueIsEmpty = require('../../functions/check/checkElementTextValueIsEmpty');
const checkCookieContent = require('../../functions/check/checkCookieContent');
const checkCookieExists = require('../../functions/check/checkCookieExists');
const checkDimension = require('../../functions/check/checkDimension');
const checkDownloadedJsonFileConformsTemplateFile = require('../../functions/check/checkDownloadedJsonFileConformsTemplateFile');
const checkDownloadedFileContainsNumOfLines = require('../../functions/check/checkDownloadedFileContainsNumOfLines');
const checkDownloadedFileContainsRowsAndColumns = require('../../functions/check/checkDownloadedFileContainsRowsAndColumns');
const checkDownloadedFileContainsEqualsMatchesText = require('../../functions/check/checkDownloadedFileContainsEqualsMatchesText');
const checkFocus = require('../../functions/check/checkFocus');
const checkIsOpenedInNewWindow = require('../../functions/check/checkIsOpenedInNewWindow');
const checkModal = require('../../functions/check/checkModal');
const checkModalText = require('../../functions/check/checkModalText');
const checkNewWindow = require('../../functions/check/checkNewWindow');
const checkOffset = require('../../functions/check/checkOffset');
const checkProperty = require('../../functions/check/checkProperty');
const checkFontProperty = require('../../functions/check/checkFontProperty');
const checkTitle = require('../../functions/check/checkTitle');
const checkURL = require('../../functions/check/checkURL');
const checkWithinViewport = require('../../functions/check/checkWithinViewport');
const compareText = require('../../functions/check/compareText');
const isEnabled = require('../../functions/check/isEnabled');
const isVisible = require('../../functions/check/isVisible');
const checkIfElementExistsInsideParentElement = require('../../functions/check/checkIfElementExistsInsideParentElement');
const checkIfElementInsideParentElementEqualsMatchesTextOrValue = require('../../functions/check/checkIfElementInsideParentElementEqualsMatchesTextOrValue');
const checkIfElementInsideParentElementEqualsMatchesTextOrValue2 = require('../../functions/check/checkIfElementInsideParentElementEqualsMatchesTextOrValue2');

module.exports = function() {
    this.Then(
        /^I expect (?:that )?the page title does( not)* (contain|equal|match) the (text|value|regex) "(.*)?"$/,
        checkTitle
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|no less than) ([^\s]+) time(?:s)?)?$/,
        checkIfElementExistsInsideParentElement
    );

    // this.Then(
    //     /^I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? (?:element|checkbox) "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? is( not)* (displayed|checked|enabled|selected)$/,
    //     checkElementStatusInsideParentElement
    // );

    this.Then(
        /^I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?( not)* (contains|equals|matches) the (text|regex|value) "(.*)?"$/,
        checkIfElementInsideParentElementEqualsMatchesTextOrValue
    );

    this.Then(
        /^I expect (?:that )?the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? (?:is|does)( not)* (displayed|checked|enabled|selected|contain|equal|match)(?: the (text|regex|value) "(.*)?")*$/,
        checkIfElementInsideParentElementEqualsMatchesTextOrValue2
    );

    this.Then(
        /^I expect (?:that )?(?:(some|all) of )?the element "([^"]*)?" (is|becomes)( not)* visible$/,
        isVisible
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" is( not)* within the viewport$/,
        checkWithinViewport
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
        compareText
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?"( not)* contains (?:any|some) (text|value)$/,
        checkContainsAnyTextOrValue
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" (text|value) is( not)* empty$/,
        checkElementTextValueIsEmpty
    );

    this.Then(
        /^I expect the (full URL|URL protocol|URL host|URL host port|URL path) to( not)* (be|contain|match) "(.*)?"$/,
        checkURL
    );

    this.Then(
        /^I expect (?:that )?the( css)* attribute "([^"]*)?" from element "([^"]*)?" (is|contains|matches)( not)* "(.*)?"$/,
        checkProperty
    );

    this.Then(
        /^I expect (?:that )?all data entries in the downloaded json file "([^"]*)?" conform to the template file "([^"]*)?"$/,
        checkDownloadedJsonFileConformsTemplateFile
    );

    this.Then(
        /^I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) line(?:s)?$/,
        checkDownloadedFileContainsNumOfLines
    );

    this.Then(
        /^I expect (?:that )?the downloaded file "([^"]*)?" contains((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (row|data row)(?:s)?(?: and((?: exactly)?|(?: no)? more than|(?: no)? less than) ([^\s]+) (column|data column)(?:s)?)?$/,
        checkDownloadedFileContainsRowsAndColumns
    );

    this.Then(
        /^I expect (?:that )?the downloaded file "([^"]*)?"(?: at (?:line|row) (\d+)(?: and column (\d+))?)? does( not)* (contain|equal|match) the (?:text|value|regex) "(.*)?"$/,
        checkDownloadedFileContainsEqualsMatchesText
    );

    this.Then(
        /^I expect (?:that )?the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkFontProperty
    );

    this.Then(
        /^I expect (?:that )?(?:(some|all) of )?the element "([^"]*)?" (becomes)( not)* enabled$/,
        isEnabled
    );

    this.Then(
        /^I expect (?:that )?the cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
        checkCookieContent
    );

    this.Then(
        /^I expect (?:that )?the cookie "([^"]*)?"( not)* exists$/,
        checkCookieExists
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" is( not)* ([\d.]+)px (broad|tall)$/,
        checkDimension
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" is( not)* positioned at ([\d.]+)px on the (x|y) axis$/,
        checkOffset
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
        checkClass
    );

    this.Then(
        /^I expect (?:that )?a new (window|tab) has( not)* been opened$/,
        checkNewWindow
    );

    this.Then(
        /^I expect (?:that )?the url "([^"]*)?" is opened in a new (tab|window)$/,
        checkIsOpenedInNewWindow
    );

    this.Then(
        /^I expect (?:that )?the element "([^"]*)?" is( not)* focused$/,
        checkFocus
    );

    this.Then(
        /^I expect (?:that )?a (alertbox|confirmbox|prompt) is( not)* opened$/,
        checkModal
    );

    this.Then(
        /^I expect (?:that )?a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
        checkModalText
    );
}
