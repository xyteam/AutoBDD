/**
 * Pause execution for a given number of milliseconds
 * @param  {String}   ms   Number of milliseconds to pause
 */
module.exports = async (ms) => {
    /**
     * Number of milliseconds
     * @type {Int}
     */
    const intMs = parseInt(ms, 10);

    await browser.pause(intMs);
};
