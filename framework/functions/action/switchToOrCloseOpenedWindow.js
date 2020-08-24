/**
 * Focus the last opened window
 * @param  {String}   action switch to or close
 * @param  {String}   index  The index of the tab
 */
module.exports = (action, index) => {
    if (index && index == 'last') {
        const lastWindowHandle = browser.getWindowHandles().slice(-1)[0];
        browser.switchToWindow(lastWindowHandle);
    } else {
        const optionIndex = parseInt(index, 10) - 1;
        const windowHandle = browser.getWindowHandles()[optionIndex];
        browser.switchToWindow(windowHandle);
    }
    if (action == 'close') browser.closeWindow();
};
