const { When } = require('cucumber');

const changeBrowserBackground = require('../../functions/action/changeBrowserBackground');
const changeBrowserZoom = require('../../functions/action/changeBrowserZoom');
const clearInputField = require('../../functions/action/clearInputField');
const clickElementInsideParentElement = require('../../functions/action/clickElementInsideParentElement');
const clickToCondition = require('../../functions/action/clickToCondition');
const deleteCookie = require('../../functions/action/deleteCookie');
const browserAction = require('../../functions/action/browserAction');
const dragElement = require('../../functions/action/dragElement');
const switchToOrCloseLastOpenedWindow = require('../../functions/action/switchToOrCloseLastOpenedWindow');
const handleModal = require('../../functions/action/handleModal');
const moveToElement = require('../../functions/action/moveToElement');
const pause = require('../../functions/action/pause');
const pressKeyTimes = require('../../functions/action/pressKeyTimes');
const clickMouseKeyTimes = require('../../functions/action/clickMouseKeyTimes');
const scroll = require('../../functions/action/scroll');
const selectOption = require('../../functions/action/selectOption');
const selectOptionByIndex = require('../../functions/action/selectOptionByIndex');
const selectFileFromDownloadFolder = require('../../functions/action/selectFileFromDownloadFolder');
const setCookie = require('../../functions/action/setCookie');
const setInputFieldWithEnvVars = require('../../functions/action/setInputFieldWithEnvVars');
const setPromptText = require('../../functions/action/setPromptText');
const switchIframe = require('../../functions/action/switchIframe');
const typeText = require('../../functions/action/typeText');
const waitAndActOnElement = require('../../functions/action/waitAndActOnElement');
const waitOnElementInsideParentElementToBeConditon = require('../../functions/action/waitOnElementInsideParentElementToBeConditon');
const waitForDownload = require('../../functions/action/waitForDownload');

When(
    /^I (back|close|debug|forward|refresh|reload|reset) browser$/,
    {timeout: 3600*1000},
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
    /^I click the (?:element|checkbox) "([^"]*)?"(?: up to (\d+) time(?:s)?)? until the element "([^"]*)?" is(?: (not))? (existing|displayed|visible|focused|enabled|clickable|selected|checked)$/,
    clickToCondition
);

When(
    /^I (add|set)(?: (env var))? "(.*)?" to the (inputfield|textarea) "([^"]*)?"$/,
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
    /^I pause for (\d+)ms$/, {timeout: 3600*1000},
    pause
);

When(
    /^I set a cookie "([^"]*)?" with the content "(.*)?"$/,
    setCookie
);

When(
    /^I select the "([^"]*)?" file from the download folder$/, {timeout: 30*1000},
    selectFileFromDownloadFolder
);

When(
    /^I delete the cookie "(.*)?"$/,
    deleteCookie
);

When(
    /^I (press|toggle up|toggle down) the "([^"]*)?" key(?: (\d+) time(?:s)?)? to the screen$/,
    pressKeyTimes
);

When(
    /^I (double )?click the (left|middle|right) mouse key(?: (\d+) time(?:s)?)?$/,
    clickMouseKeyTimes
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
    /^I enter "(.*)?" into the prompt$/,
    setPromptText
);

When(
    /^I scroll to the element "([^"]*)?"$/,
    scroll
);

When(
    /^I (switch to|close) the last opened (?:window|tab)$/,
    switchToOrCloseLastOpenedWindow
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
    /^I wait on download file "([^"]*)?"(?: for (\d+)ms)* to be( not)* existing$/,
    {
        timeout: 3600*1000,
        wrapperOptions: {
            retry: 3,
        },
    },
    waitForDownload
);

When(
    /^I wait on the(?: (\d+(?:st|nd|rd|th)))? (?:element|checkbox) "([^"]*)?"(?: inside the(?: (\d+(?:st|nd|rd|th)))? parent element "([^"]*)?")?(?: for (\d+)ms)*(?: to be( not)* (existing|displayed|visible|focused|enabled|clickable|selected|checked|containing a text|containing a value))*$/,
    {
        timeout: 3600*1000,
        // wrapperOptions: {
        //     retry: 3,
        // },
    },
    waitOnElementInsideParentElementToBeConditon
);

When(
    /^I zoom browser to "([^"]*)?"$/,
    changeBrowserZoom
);
