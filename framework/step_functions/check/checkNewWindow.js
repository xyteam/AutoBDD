/**
 * Check if a new window or tab is opened
 * @param  {String}   obsolete  The type of opened object (window or tab)
 * @param  {String}   falseCase Whether to check if a new window/tab was opened
 *                              or not
 */
module.exports = async (obsolete, falseCase) => {
    /**
     * The handles of all open windows/tabs
     * @type {Object}
     */
    const windowHandles = await browser.getWindowHandles();

    if (falseCase) {
        await expect(windowHandles.length).toEqual(1, 'A new window should not have been opened');
    } else {
        await expect(windowHandles.length).not.toEqual(1, 'A new window has been opened');
    }
};
