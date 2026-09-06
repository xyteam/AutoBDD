/**
 * Focus the last opened window
 * @param  {String}   action switch to or close
 * @param  {String}   index  The index of the tab
 */
module.exports = async (action, index) => {
    if (index && index == 'last') {
        const lastWindowHandle = (await browser.getWindowHandles()).slice(-1)[0];
        await browser.switchToWindow(lastWindowHandle);
    } else {
        const optionIndex = parseInt(index, 10) - 1;
        const windowHandle = (await browser.getWindowHandles())[optionIndex];
        await browser.switchToWindow(windowHandle);
    }
    if (action == 'close') await browser.closeWindow();
};
