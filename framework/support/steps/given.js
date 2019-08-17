const checkContainsAnyText = require('../../functions/check/checkContainsAnyText');
const checkIsEmpty = require('../../functions/check/checkIsEmpty');
const checkContainsText = require('../../functions/check/checkContainsText');
const checkCookieContent = require('../../functions/check/checkCookieContent');
const checkCookieExists = require('../../functions/check/checkCookieExists');
const checkDimension = require('../../functions/check/checkDimension');
const checkElementExists = require('../../functions/check/checkElementExists');
const checkEqualsText = require('../../functions/check/checkEqualsText');
const checkModal = require('../../functions/check/checkModal');
const checkOffset = require('../../functions/check/checkOffset');
const checkProperty = require('../../functions/check/checkProperty');
const checkSelected = require('../../functions/check/checkSelected');
const checkTitle = require('../../functions/check/checkTitle');
const checkUrl = require('../../functions/check/checkURL');
const closeAllButFirstTab = require('../../functions/action/closeAllButFirstTab');
const compareText = require('../../functions/check/compareText');
const deleteDownload = require('../../functions/action/deleteDownload');
const isEnabled = require('../../functions/check/isEnabled');
const isVisible = require('../../functions/check/isVisible');
const openTarget = require('../../functions/action/openTarget');
const resizeScreenSize = require('../../functions/action/resizeScreenSize');

module.exports = function() {
    this.Given(
        /^I open (?:the )?(url|file|site|download file) "([^"]*)?"$/,
        openTarget
    );

    this.Given(
        /^I delete (the only|all) download file(?:s)? with the name "([^"]*)?"$/,
        deleteDownload
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" is( not)* visible$/,
        isVisible
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" is( not)* enabled$/,
        isEnabled
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" is( not)* selected$/,
        checkSelected
    );

    this.Given(
        /^(?:the )?checkbox "([^"]*)?" is( not)* checked$/,
        checkSelected
    );

    this.Given(
        /^there is (an|no) element "([^"]*)?" on (?:the )?page$/,
        checkElementExists
    );

    this.Given(
        /^(?:the )?title is( not)* "([^"]*)?"$/,
        checkTitle
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" contains( not)* (?:the )?same text as element "([^"]*)?"$/,
        compareText
    );

    this.Given(
        /^(?:the )?(button|element) "([^"]*)?"( not)* matches (?:the )?text "([^"]*)?"$/,
        checkEqualsText
    );

    this.Given(
        /^(?:the )?(button|element) "([^"]*)?"( not)* contains (?:the )?text "([^"]*)?"$/,
        checkContainsText
    );

    this.Given(
        /^(?:the )?(button|element) "([^"]*)?"( not)* contains any text$/,
        checkContainsAnyText
    );

    this.Given(
        /^(?:the )?(button|element) "([^"]*)?" is( not)* empty$/,
        checkIsEmpty
    );

    this.Given(
        /^(?:the )?page url is( not)* "([^"]*)?"$/,
        checkUrl
    );

    this.Given(
        /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkProperty
    );

    this.Given(
        /^(?:the )?cookie "([^"]*)?" contains( not)* (?:the )?value "([^"]*)?"$/,
        checkCookieContent
    );

    this.Given(
        /^(?:the )?cookie "([^"]*)?" does( not)* exist$/,
        checkCookieExists
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
        checkDimension
    );

    this.Given(
        /^(?:the )?element "([^"]*)?" is( not)* positioned at ([\d]+)px on (?:the )?(x|y) axis$/,
        checkOffset
    );

    this.Given(
        /^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
        resizeScreenSize
    );

    this.Given(
        /^I have closed all but (?:the )?first (window|tab)$/,
        closeAllButFirstTab
    );

    this.Given(
        /^a (alertbox|confirmbox|prompt) is( not)* opened$/,
        checkModal
    );
}