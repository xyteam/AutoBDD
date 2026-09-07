/**
 * Close all but the first tab
 * @param  {String}   obsolete Type of object to close (window or tab)
 */
/* eslint-disable no-unused-vars */
module.exports = async (obsolete) => {
/* eslint-enable no-unused-vars */
    /**
     * Get all the window handles
     * @type {Object}
     */
    const windowHandles = await browser.getWindowHandles();

    // Close all tabs but the first one
    windowHandles.reverse();
    for (let index = 0; index < windowHandles.length; index++) {
        const handle = windowHandles[index];
        await browser.switchToWindow(handle);
        if (index < windowHandles.length - 1) {
            await browser.closeWindow();
        }
    }
};
