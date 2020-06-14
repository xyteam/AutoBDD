const { Given } = require('cucumber');

const announceMessage = require('../../functions/action/announceMessage');
const assignValueOfElementInsideParentElementAs = require('../../functions/action/assignValueOfElementInsideParentElementAs');
const bypassChromeSafetyWarning = require('../../functions/action/bypassChromeSafetyWarning');
const checkContainsAnyTextOrValue = require('../../functions/check/checkContainsAnyTextOrValue');
const checkElementTextValueIsEmpty = require('../../functions/check/checkElementTextValueIsEmpty');
const checkCookieContent = require('../../functions/check/checkCookieContent');
const checkCookieExists = require('../../functions/check/checkCookieExists');
const checkDimension = require('../../functions/check/checkDimension');
const checkElementExists = require('../../functions/check/checkElementExists');
const checkContainsEqualsMatchesTextOrValue = require('../../functions/check/checkContainsEqualsMatchesTextOrValue');
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

Given(
    /^I announce message(?: at (console|browser))?: "([^"]*)?"$/,
    announceMessage
);

Given(
    /^I assign the (text|number) from the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")? as "(.*)?"$/,
    assignValueOfElementInsideParentElementAs
);

Given(
    /^I (wait and )*bypass chrome safety warning(| if presented)$/,
    bypassChromeSafetyWarning
    );

Given(
    /^I open the (file|download file|path|url) "([^"]*)?"$/,
    openTarget
);

Given(
    /^I delete (the only|all) download file(?:s)? with the name "([^"]*)?"$/,
    deleteDownload
);

Given(
    /^(?:(some|all) of )?the element "([^"]*)?" (is|becomes)( not)* visible$/,
    isVisible
);

Given(
    /^(?:(some|all) of )?the element "([^"]*)?" (is|becomes)( not)* enabled$/,
    isEnabled
);

Given(
    /^the (?:element|checkbox) "([^"]*)?" is( not)* (?:checked|selected)$/,
    checkSelected
);

Given(
    /^there is (an|no) element "([^"]*)?" on the page$/,
    checkElementExists
);

Given(
    /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
    compareText
);

Given(
    /^the element "([^"]*)?"( not)* (contains|equals|matches) the (text|value|regex) "(.*)?"$/,
    checkContainsEqualsMatchesTextOrValue
);

Given(
    /^the element "([^"]*)?"( not)* contains any (text|value)$/,
    checkContainsAnyTextOrValue
);

Given(
    /^the element "([^"]*)?" (text|value) is( not)* empty$/,
    checkElementTextValueIsEmpty
);

Given(
    /^the page url is( not)* "([^"]*)?"$/,
    (falseCase, value) => {
        checkUrl('full URL', falseCase, 'is', value);
    }
);

Given(
    /^the page title does( not)* (contain|equal|match) the (text|value|regex) "(.*)?"$/,
    checkTitle
);

Given(
    /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" (is|contains|matches)( not)* "(.*)?"$/,
    checkProperty
);

Given(
    /^the cookie "([^"]*)?" contains( not)* the value "([^"]*)?"$/,
    checkCookieContent
);

Given(
    /^the cookie "([^"]*)?" does( not)* exist$/,
    checkCookieExists
);

Given(
    /^the element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
    checkDimension
);

Given(
    /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
    checkOffset
);

Given(
    /^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
    resizeScreenSize
);

Given(
    /^I have closed all but the first (window|tab)$/,
    closeAllButFirstTab
);

Given(
    /^a (alertbox|confirmbox|prompt) is( not)* opened$/,
    checkModal
);