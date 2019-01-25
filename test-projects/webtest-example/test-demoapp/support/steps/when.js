import clearInputField from '../../global/action/clearInputField';
import clickElement from '../../global/action/clickElement';
import closeLastOpenedWindow from '../../global/action/closeLastOpenedWindow';
import deleteCookie from '../../global/action/deleteCookie';
import dragElement from '../../global/action/dragElement';
import focusLastOpenedWindow from '../../global/action/focusLastOpenedWindow';
import handleModal from '../../global/action/handleModal';
import moveToElement from '../../global/action/moveToElement';
import pause from '../../global/action/pause';
import pressButton from '../../global/action/pressButton';
import scroll from '../../global/action/scroll';
import selectOption from '../../global/action/selectOption';
import selectOptionByIndex from '../../global/action/selectOptionByIndex';
import setCookie from '../../global/action/setCookie';
import setInputField from '../../global/action/setInputField';
import setPromptText from '../../global/action/setPromptText';
import submitForm from '../../global/action/submitForm';

module.exports = function() {
    this.When(
        /^I (click|doubleclick) on the (link|button|element) "([^"]*)?"$/,
        clickElement
    );

    this.When(
        /^I (add|set) "([^"]*)?" to the inputfield "([^"]*)?"$/,
        setInputField
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