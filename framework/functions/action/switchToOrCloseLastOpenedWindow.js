/**
 * Focus the last opened window
 * @param  {String}   action switch to or close
 */
module.exports = (action) => {
    const lastWindowHandle = browser.getWindowHandles().slice(-1)[0];
    browser.switchToWindow(lastWindowHandle);
    if (action == 'close') browser.closeWindow(); 
};
