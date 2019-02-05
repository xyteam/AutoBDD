import checkContainsAnyText from '../functions/check/checkContainsAnyText';
import checkIsEmpty from '../functions/check/checkIsEmpty';
import checkContainsText from '../functions/check/checkContainsText';
import checkCookieContent from '../functions/check/checkCookieContent';
import checkCookieExists from '../functions/check/checkCookieExists';
import checkDimension from '../functions/check/checkDimension';
import checkElementExists from '../functions/check/checkElementExists';
import checkEqualsText from '../functions/check/checkEqualsText';
import checkModal from '../functions/check/checkModal';
import checkOffset from '../functions/check/checkOffset';
import checkProperty from '../functions/check/checkProperty';
import checkSelected from '../functions/check/checkSelected';
import checkTitle from '../functions/check/checkTitle';
import checkUrl from '../functions/check/checkURL';
import closeAllButFirstTab from '../functions/action/closeAllButFirstTab';
import compareText from '../functions/check/compareText';
import isEnabled from '../functions/check/isEnabled';
import isVisible from '../functions/check/isVisible';
import openWebsite from '../functions/action/openWebsite';
import resizeScreenSize from '../functions/action/resizeScreenSize';

module.exports = function() {
    this.Given(
        /^I open the (url|site) "([^"]*)?"$/,
        openWebsite
    );

    this.Given(
        /^the element "([^"]*)?" is( not)* visible$/,
        isVisible
    );

    this.Given(
        /^the element "([^"]*)?" is( not)* enabled$/,
        isEnabled
    );

    this.Given(
        /^the element "([^"]*)?" is( not)* selected$/,
        checkSelected
    );

    this.Given(
        /^the checkbox "([^"]*)?" is( not)* checked$/,
        checkSelected
    );

    this.Given(
        /^there is (an|no) element "([^"]*)?" on the page$/,
        checkElementExists
    );

    this.Given(
        /^the title is( not)* "([^"]*)?"$/,
        checkTitle
    );

    this.Given(
        /^the element "([^"]*)?" contains( not)* the same text as element "([^"]*)?"$/,
        compareText
    );

    this.Given(
        /^the (button|element) "([^"]*)?"( not)* matches the text "([^"]*)?"$/,
        checkEqualsText
    );

    this.Given(
        /^the (button|element) "([^"]*)?"( not)* contains the text "([^"]*)?"$/,
        checkContainsText
    );

    this.Given(
        /^the (button|element) "([^"]*)?"( not)* contains any text$/,
        checkContainsAnyText
    );

    this.Given(
        /^the (button|element) "([^"]*)?" is( not)* empty$/,
        checkIsEmpty
    );

    this.Given(
        /^the page url is( not)* "([^"]*)?"$/,
        checkUrl
    );

    this.Given(
        /^the( css)* attribute "([^"]*)?" from element "([^"]*)?" is( not)* "([^"]*)?"$/,
        checkProperty
    );

    this.Given(
        /^the cookie "([^"]*)?" contains( not)* the value "([^"]*)?"$/,
        checkCookieContent
    );

    this.Given(
        /^the cookie "([^"]*)?" does( not)* exist$/,
        checkCookieExists
    );

    this.Given(
        /^the element "([^"]*)?" is( not)* ([\d]+)px (broad|tall)$/,
        checkDimension
    );

    this.Given(
        /^the element "([^"]*)?" is( not)* positioned at ([\d]+)px on the (x|y) axis$/,
        checkOffset
    );

    this.Given(
        /^I have a screen that is ([\d]+) by ([\d]+) pixels$/,
        resizeScreenSize
    );

    this.Given(
        /^I have closed all but the first (window|tab)$/,
        closeAllButFirstTab
    );

    this.Given(
        /^a (alertbox|confirmbox|prompt) is( not)* opened$/,
        checkModal
    );
}