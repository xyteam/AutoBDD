const { When } = require('cucumber');

const changeBrowserBackground = require('../../functions/action/changeBrowserBackground');
const changeBrowserZoom = require('../../functions/action/changeBrowserZoom');
const clearInputField = require('../../functions/action/clearInputField');
const clickElementInsideParentElement = require('../../functions/action/clickElementInsideParentElement');
const clickToCondition = require('../../functions/action/clickToCondition');
const closeLastOpenedWindow = require('../../functions/action/closeLastOpenedWindow');
const deleteCookie = require('../../functions/action/deleteCookie');
const browserAction = require('../../functions/action/browserAction');
const dragElement = require('../../functions/action/dragElement');
const focusLastOpenedWindow = require('../../functions/action/focusLastOpenedWindow');
const handleModal = require('../../functions/action/handleModal');
const moveToElement = require('../../functions/action/moveToElement');
const pause = require('../../functions/action/pause');
const pressKeyTimes = require('../../functions/action/pressKeyTimes');
const scroll = require('../../functions/action/scroll');
const selectOption = require('../../functions/action/selectOption');
const selectOptionByIndex = require('../../functions/action/selectOptionByIndex');
const selectFileFromDownloadFolder = require('../../functions/action/selectFileFromDownloadFolder');
const setCookie = require('../../functions/action/setCookie');
const setInputField = require('../../functions/action/setInputField');
const setInputFieldWithEnvVars = require('../../functions/action/setInputFieldWithEnvVars');
const setPromptText = require('../../functions/action/setPromptText');
const submitForm = require('../../functions/action/submitForm');
const switchIframe = require('../../functions/action/switchIframe');
const typeText = require('../../functions/action/typeText');
const waitAndActOnElement = require('../../functions/action/waitAndActOnElement');
const waitFor = require('../../functions/action/waitFor');
const waitForDownload = require('../../functions/action/waitForDownload');

When(
    /^I (back|close|debug|forward|refresh|reload|reset) browser$/, {timeout: 3600*1000},
    browserAction
);

When(
    /^I (?:wait (?:(\d+)ms )?and )?((?:left |middle |right |double )?click|hover) on the (\S*) "([^"]*)?"$/,
    waitAndActOnElement
);

When(
    /^I (clear|click|tryClick|deepClick|moveTo) the(?: (\d+(?:st|nd|rd|th)))? element "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?$/,
    clickElementInsideParentElement
);

When(
    /^I click the element "([^"]*)?"(?: up to (\d+) time(?:s)?)? until the element "([^"]*)?" becomes(?: (not))? (enabled|existing|selected|visible)$/,
    clickToCondition
);

When(
    /^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/,
    setInputField
);

When(
    /^I (add|set) env var "([^"]*)?" to the inputfield "([^"]*)?"$/,
    setInputFieldWithEnvVars
);

When(
    /^I clear the inputfield "([^"]*)?"$/,
    clearInputField
);

When(
    /^I drag element "([^"]*)?" to element "([^"]*)?"$/,
    dragElement
);

When(
    /^I submit the form "([^"]*)?"$/,
    submitForm
);

When(
    /^I pause for (\d+)ms$/, {timeout: 3600*1000},
    pause
);

When(
    /^I set a cookie "([^"]*)?" with the content "([^"]*)?"$/,
    setCookie
);

When(
    /^I select the "([^"]*)?" file from the download folder$/, {timeout: 30*1000},
    selectFileFromDownloadFolder
);

When(
    /^I delete the cookie "([^"]*)?"$/,
    deleteCookie
);

When(
    /^I press the "([^"]*)?" key(?: (\d+) time(?:s)?)? to the screen$/,
    pressKeyTimes
);

When(
    /^I type the "(.*)?" string to the screen$/,
    typeText
);

When(
    /^I (accept|dismiss) the (alertbox|confirmbox|prompt)$/,
    handleModal
);

When(
    /^I enter "([^"]*)?" into the prompt$/,
    setPromptText
);

When(
    /^I scroll to the element "([^"]*)?"$/,
    scroll
);

When(
    /^I close the last opened (window|tab)$/,
    closeLastOpenedWindow
);

When(
    /^I focus the last opened (window|tab)$/,
    focusLastOpenedWindow
);

When(
    /^I move to element "([^"]*)?"(?: with an offset of (\d+),(\d+))*$/,
    moveToElement
);

When(
    /^I select the (\d+)(st|nd|rd|th) option for element "([^"]*)?"$/,
    selectOptionByIndex
);

When(
    /^I select the option with the (name|value|text) "([^"]*)?" for element "([^"]*)?"$/,
    selectOption
);

When(
    /^I switch to the(?: (parent|\d+(?:st|nd|rd|th)))? iframe(?: with the name "([^"]*)?")?$/,
    switchIframe
);

When(
    /^I set browser background color to "([^"]*)?"$/,
    changeBrowserBackground
);

When(
    /^I wait on download file "([^"]*)?"(?: for (\d+)ms)* to( not)* exist$/,
    {
        wrapperOptions: {
            retry: 3,
        },
    },
    waitForDownload
);

When(
    /^I wait on element "([^"]*)?"(?: for (\d+)ms)*(?: to( not)* (be checked|be enabled|be selected|be visible|contain a text|contain a value|exist))*$/,
    {
        timeout: 3600*1000,
        wrapperOptions: {
            retry: 3,
        },
    },
    waitFor
);

When(
    /^I zoom browser to "([^"]*)?"$/,
    changeBrowserZoom
);
