import checkClass from '../../functions/check/checkClass';
import checkContainsAnyText from '../../functions/check/checkContainsAnyText';
import checkIsEmpty from '../../functions/check/checkIsEmpty';
import checkContainsText from '../../functions/check/checkContainsText';
import checkCookieContent from '../../functions/check/checkCookieContent';
import checkCookieExists from '../../functions/check/checkCookieExists';
import checkDimension from '../../functions/check/checkDimension';
import checkEqualsText from '../../functions/check/checkEqualsText';
import checkFocus from '../../functions/check/checkFocus';
import checkInURLPath from '../../functions/check/checkInURLPath';
import checkIsOpenedInNewWindow from '../../functions/check/checkIsOpenedInNewWindow';
import checkModal from '../../functions/check/checkModal';
import checkModalText from '../../functions/check/checkModalText';
import checkNewWindow from '../../functions/check/checkNewWindow';
import checkOffset from '../../functions/check/checkOffset';
import checkProperty from '../../functions/check/checkProperty';
import checkFontProperty from '../../functions/check/checkFontProperty';
import checkSelected from '../../functions/check/checkSelected';
import checkTitle from '../../functions/check/checkTitle';
import checkTitleContains from '../../functions/check/checkTitleContains';
import checkURL from '../../functions/check/checkURL';
import checkURLPath from '../../functions/check/checkURLPath';
import checkWithinViewport from '../../functions/check/checkWithinViewport';
import compareText from '../../functions/check/compareText';
import isEnabled from '../../functions/check/isEnabled';
import isExisting from '../../functions/check/isExisting';
import isVisible from '../../functions/check/isVisible';
import waitFor from '../../functions/action/waitFor';
import waitForVisible from '../../functions/action/waitForVisible';
import checkIfElementExists from '../../functions/common/checkIfElementExists';

module.exports = function() {
    this.Then(
        /^I expect that the title is( not)* "([^"]*)?"$/,
        checkTitle
    );

    this.Then(
        /^I expect that the title ( not)* contains "([^"]*)?"$/,
        checkTitleContains
    );

    this.Then(
        /^I expect that element "([^"]*)?" does( not)* appear exactly "([^"]*)?" times$/,
        checkIfElementExists
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* visible$/,
        isVisible
    );

    this.Then(
        /^I expect that element "([^"]*)?" becomes( not)* visible$/,
        waitForVisible
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* within the viewport$/,
        checkWithinViewport
    );

    this.Then(
        /^I expect that element "([^"]*)?" does( not)* exist$/,
        isExisting
    );

    this.Then(
        /^I expect that element "([^"]*)?"( not)* contains the same text as element "([^"]*)?"$/,
        compareText
    );

    this.Then(
        /^I expect that (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
        checkEqualsText
    );

    this.Then(
        /^I expect that (button|element) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
        checkContainsText
    );

    this.Then(
        /^I expect that (button|element) "([^"]*)?"( not)* contains any text$/,
        checkContainsAnyText
    );

    this.Then(
        /^I expect that (button|element) "([^"]*)?" is( not)* empty$/,
        checkIsEmpty
    );

    this.Then(
        /^I expect that the url is( not)* "([^"]*)?"$/,
        checkURL
    );

    this.Then(
        /^I expect that the path is( not)* "([^"]*)?"$/,
        checkURLPath
    );

    this.Then(
        /^I expect the url to( not)* contain "([^"]*)?"$/,
        checkInURLPath
    );

    this.Then(
        /^I expect that the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkProperty
    );

    this.Then(
        /^I expect that the font( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkFontProperty
    );

    this.Then(
        /^I expect that checkbox "([^"]*)?" is( not)* checked$/,
        checkSelected
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* selected$/,
        checkSelected
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* enabled$/,
        isEnabled
    );

    this.Then(
        /^I expect that cookie "([^"]*)?"( not)* contains "([^"]*)?"$/,
        checkCookieContent
    );

    this.Then(
        /^I expect that cookie "([^"]*)?"( not)* exists$/,
        checkCookieExists
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* ([\d.]+)px (broad|tall)$/,
        checkDimension
    );

    this.Then(
        /^I expect that element "([^"]*)?" is( not)* positioned at ([\d.]+)px on the (x|y) axis$/,
        checkOffset
    );

    this.Then(
        /^I expect that element "([^"]*)?" (has|does not have) the class "([^"]*)?"$/,
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
        /^I expect that element "([^"]*)?" is( not)* focused$/,
        checkFocus
    );

    this.Then(
        /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be visible|contain a text|contain a value|exist))*$/,
        {
            wrapperOptions: {
                retry: 3,
            },
        },
        waitFor
    );

    this.Then(
        /^I expect that a (alertbox|confirmbox|prompt) is( not)* opened$/,
        checkModal
    );

    this.Then(
        /^I expect that a (alertbox|confirmbox|prompt)( not)* contains the text "([^"]*)?"$/,
        checkModalText
    );
}