const checkClass = require('../../functions/check/checkClass');
const checkContainsAnyTextOrValue = require('../../functions/check/checkContainsAnyTextOrValue');
const checkElementTextValueIsEmpty = require('../../functions/check/checkElementTextValueIsEmpty');
const checkCookieContent = require('../../functions/check/checkCookieContent');
const checkCookieExists = require('../../functions/check/checkCookieExists');
const checkDimension = require('../../functions/check/checkDimension');
const checkContainsEqualsMatchesTextOrValue = require('../../functions/check/checkContainsEqualsMatchesTextOrValue');
const checkDownloadedFileContainsEqualsMatchesText = require('../../functions/check/checkDownloadedFileContainsEqualsMatchesText');
const checkFocus = require('../../functions/check/checkFocus');
const checkInURLPath = require('../../functions/check/checkInURLPath');
const checkIsOpenedInNewWindow = require('../../functions/check/checkIsOpenedInNewWindow');
const checkModal = require('../../functions/check/checkModal');
const checkModalText = require('../../functions/check/checkModalText');
const checkNewWindow = require('../../functions/check/checkNewWindow');
const checkOffset = require('../../functions/check/checkOffset');
const checkProperty = require('../../functions/check/checkProperty');
const checkFontProperty = require('../../functions/check/checkFontProperty');
const checkSelected = require('../../functions/check/checkSelected');
const checkTitle = require('../../functions/check/checkTitle');
const checkTitleContains = require('../../functions/check/checkTitleContains');
const checkURL = require('../../functions/check/checkURL');
const checkURLPath = require('../../functions/check/checkURLPath');
const checkWithinViewport = require('../../functions/check/checkWithinViewport');
const compareText = require('../../functions/check/compareText');
const isEnabled = require('../../functions/check/isEnabled');
const isExisting = require('../../functions/check/isExisting');
const isVisible = require('../../functions/check/isVisible');
const waitForVisible = require('../../functions/action/waitForVisible');
const checkIfElementExistsInsideParentElement = require('../../functions/check/checkIfElementExistsInsideParentElement');
const checkIfElementInsideParentElementEqualsMatchesTextOrValue = require('../../functions/check/checkIfElementInsideParentElementEqualsMatchesTextOrValue');

module.exports = function() {
    this.Then(
        /^I expect (?:that )?the title is( not)* "([^"]*)?"$/,
        checkTitle
    );

    this.Then(
        /^I expect (?:that )?the title( not)* contains "([^"]*)?"$/,
        checkTitleContains
    );

    this.Then(
        /^I expect the element "([^"]*)?"(?: inside the(?: (\d*1st|\d*2nd|\d*3rd|\d*[^123]th))? parent element "([^"]*)?")? does( not)* appear(?: (more than|less than|exactly) "([^"]*)?" time(?:s)?)?$/,
        checkIfElementExistsInsideParentElement
    );

    this.Then(
        /^I expect the(?: (\d*1st|\d*2nd|\d*3rd|\d*[^123]th))? element "([^"]*)?" inside the(?: (\d*1st|\d*2nd|\d*3rd|\d*[^123]th))? parent element "([^"]*)?"( not)* (contains|equals|matches) the (text|value) "(.*)?"$/,
        checkIfElementInsideParentElementEqualsMatchesTextOrValue
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* visible$/,
        isVisible
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" becomes( not)* visible$/,
        waitForVisible
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* within the viewport$/,
        checkWithinViewport
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" does( not)* exist$/,
        isExisting
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
        compareText
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?"( not)* (contains|equals|matches) the (text|value) "(.*)?"$/,
        checkContainsEqualsMatchesTextOrValue
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?"( not)* contains (?:any|some) (text|value)$/,
        checkContainsAnyTextOrValue
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" (text|value) is( not)* empty$/,
        checkElementTextValueIsEmpty
    );

    this.Then(
        /^I expect (?:that )?the url is( not)* "([^"]*)?"$/,
        checkURL
    );

    this.Then(
        /^I expect (?:that )?the path is( not)* "([^"]*)?"$/,
        checkURLPath
    );

    this.Then(
        /^I expect (?:that )?the url to( not)* contain "([^"]*)?"$/,
        checkInURLPath
    );

    this.Then(
        /^I expect (?:that )?the( css)* attribute "([^"]*)?" from element "([^"]*)?" (is|contains|matches)( not)* "(.*)?"$/,
        checkProperty
    );

    this.Then(
        /^I expect (?:that )?the downloaded file "([^"]*)?"( not)* (contains|equals|matches) the text "(.*)?"$/,
        checkDownloadedFileContainsEqualsMatchesText
    );

    this.Then(
        /^I expect (?:that )?the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkFontProperty
    );

    this.Then(
        /^I expect (?:that )?checkbox "([^"]*)?" is( not)* checked$/,
        checkSelected
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* selected$/,
        checkSelected
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* enabled$/,
        isEnabled
    );

    this.Then(
        /^I expect (?:that )?cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
        checkCookieContent
    );

    this.Then(
        /^I expect (?:that )?cookie "([^"]*)?"( not)* exists$/,
        checkCookieExists
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* ([\d.]+)px (broad|tall)$/,
        checkDimension
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* positioned at ([\d.]+)px on the (x|y) axis$/,
        checkOffset
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
        checkClass
    );

    this.Then(
        /^I expect a new (window|tab) has( not)* been opened$/,
        checkNewWindow
    );

    this.Then(
        /^I expect the url "([^"]*)?" is opened in a new (tab|window)$/,
        checkIsOpenedInNewWindow
    );

    this.Then(
        /^I expect (?:that )?element "([^"]*)?" is( not)* focused$/,
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