import clearInputField from '../../functions/action/clearInputField';
import clickElement from '../../functions/action/clickElement';
import closeLastOpenedWindow from '../../functions/action/closeLastOpenedWindow';
import deleteCookie from '../../functions/action/deleteCookie';
import debugBrowser from '../../functions/action/debugBrowser';
import dragElement from '../../functions/action/dragElement';
import focusLastOpenedWindow from '../../functions/action/focusLastOpenedWindow';
import handleModal from '../../functions/action/handleModal';
import moveToElement from '../../functions/action/moveToElement';
import pause from '../../functions/action/pause';
import pressButton from '../../functions/action/pressButton';
import scroll from '../../functions/action/scroll';
import selectOption from '../../functions/action/selectOption';
import selectOptionByIndex from '../../functions/action/selectOptionByIndex';
import setCookie from '../../functions/action/setCookie';
import setInputField from '../../functions/action/setInputField';
import setInputFieldWithEnvVars from '../../functions/action/setInputFieldWithEnvVars';
import setPromptText from '../../functions/action/setPromptText';
import submitForm from '../../functions/action/submitForm';

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