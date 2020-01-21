const announceMessage = require('../../functions/action/announceMessage');
const changeBrowserBackground = require('../../functions/action/changeBrowserBackground');
const changeBrowserZoom = require('../../functions/action/changeBrowserZoom');
const clearInputField = require('../../functions/action/clearInputField');
const clickElementInsideParentElement = require('../../functions/action/clickElementInsideParentElement');
const closeLastOpenedWindow = require('../../functions/action/closeLastOpenedWindow');
const deleteCookie = require('../../functions/action/deleteCookie');
const browserAction = require('../../functions/action/browserAction');
const dragElement = require('../../functions/action/dragElement');
const focusLastOpenedWindow = require('../../functions/action/focusLastOpenedWindow');
const handleModal = require('../../functions/action/handleModal');
const moveToElement = require('../../functions/action/moveToElement');
const pause = require('../../functions/action/pause');
const pressButton = require('../../functions/action/pressButton');
const scroll = require('../../functions/action/scroll');
const selectOption = require('../../functions/action/selectOption');
const selectOptionByIndex = require('../../functions/action/selectOptionByIndex');
const selectFileFromDownloadFolder = require('../../functions/action/selectFileFromDownloadFolder');
const setCookie = require('../../functions/action/setCookie');
const setInputField = require('../../functions/action/setInputField');
const setInputFieldWithEnvVars = require('../../functions/action/setInputFieldWithEnvVars');
const setPromptText = require('../../functions/action/setPromptText');
const submitForm = require('../../functions/action/submitForm');
const waitAndActOnElement = require('../../functions/action/waitAndActOnElement');
const waitFor = require('../../functions/action/waitFor');
const waitForDownload = require('../../functions/action/waitForDownload');

module.exports = function() {
    this.When(
        /^I (back|close|debug|forward|refresh|reload|reset) browser$/, {timeout: 3600*1000},
        browserAction
    );

    this.When(
        /^I announce message: "([^"]*)?"$/,
        announceMessage
    );

    this.When(
        /^I (?:wait (?:(\d+)ms )?and )?((?:left |middle |right |double )?click|hover) on the (\S*) "([^"]*)?"$/,
        waitAndActOnElement
    );

    this.When(
        /^I (clear|click|tryClick|deepClick|moveTo) the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?$/,
        clickElementInsideParentElement
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
        /^I select the "([^"]*)?" file from the download folder$/, {timeout: process.env.StepTimeoutInMS},
        selectFileFromDownloadFolder
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
        /^I scroll to the element "([^"]*)?"$/,
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
        /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
        moveToElement
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
        /^I set browser background color to "([^"]*)?"$/,
        changeBrowserBackground
    );

    this.When(
        /^I wait on download file "([^"]*)?"(?: for (\d+)ms)* to( not)* exist$/,
        {
            wrapperOptions: {
                retry: 3,
            },
        },
        waitForDownload
    );

    this.When(
        /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be visible|contain a text|contain a value|exist))*$/,
        {
            timeout: 3600*1000,
            wrapperOptions: {
                retry: 3,
            },
        },
        waitFor
    );

    this.When(
        /^I zoom browser to "([^"]*)?"$/,
        changeBrowserZoom
    );

}
