const clearInputField = require('../../functions/action/clearInputField');
const clickElement = require('../../functions/action/clickElement');
const closeLastOpenedWindow = require('../../functions/action/closeLastOpenedWindow');
const deleteCookie = require('../../functions/action/deleteCookie');
const debugBrowser = require('../../functions/action/debugBrowser');
const dragElement = require('../../functions/action/dragElement');
const focusLastOpenedWindow = require('../../functions/action/focusLastOpenedWindow');
const handleModal = require('../../functions/action/handleModal');
const moveToElement = require('../../functions/action/moveToElement');
const pause = require('../../functions/action/pause');
const pressButton = require('../../functions/action/pressButton');
const scroll = require('../../functions/action/scroll');
const selectOption = require('../../functions/action/selectOption');
const selectOptionByIndex = require('../../functions/action/selectOptionByIndex');
const setCookie = require('../../functions/action/setCookie');
const setInputField = require('../../functions/action/setInputField');
const setInputFieldWithEnvVars = require('../../functions/action/setInputFieldWithEnvVars');
const setPromptText = require('../../functions/action/setPromptText');
const submitForm = require('../../functions/action/submitForm');

module.exports = function() {
    this.When(
        /^I debug browser$/, {timeout: 3600*1000},
        debugBrowser
    );

    this.When(
        /^I (click|doubleclick) on the (link|button|element) "([^"]*)?"$/,
        clickElement
    );

    this.When(
        /^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/,
        setInputField
    );

    this.When(
        /^I (add|set) env var "([^"]*)?" to the inputfield "([^"]*)?"$/,
        setInputFieldWithEnvVars
    );

    this.When(
        /^I clear the inputfield "([^"]*)?"$/,
        clearInputField
    );

    this.When(
        /^I drag element "([^"]*)?" to element "([^"]*)?"$/,
        dragElement
    );

    this.When(
        /^I submit the form "([^"]*)?"$/,
        submitForm
    );

    this.When(
        /^I pause for (\d+)ms$/,
        pause
    );

    this.When(
        /^I set a cookie "([^"]*)?" with the content "([^"]*)?"$/,
        setCookie
    );

    this.When(
        /^I delete the cookie "([^"]*)?"$/,
        deleteCookie
    );

    this.When(
        /^I press "([^"]*)?"$/,
        pressButton
    );

    this.When(
        /^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/,
        handleModal
    );

    this.When(
        /^I enter "([^"]*)?" into the prompt$/,
        setPromptText
    );

    this.When(
        /^I scroll to element "([^"]*)?"$/,
        scroll
    );

    this.When(
        /^I close the last opened (window|tab)$/,
        closeLastOpenedWindow
    );

    this.When(
        /^I focus the last opened (window|tab)$/,
        focusLastOpenedWindow
    );

    this.When(
        /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
        selectOptionByIndex
    );

    this.When(
        /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
        selectOption
    );

    this.When(
        /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
        moveToElement
    );
}