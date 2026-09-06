/**
 * Check if the given elements contains retrivedValue
 * @param  {String}   element       Element selector
 * @param  {String}   falseCase     Whether to check if the content contains
 *                                  text or not
 * @param  {String}   type          text or value
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = async (element, falseCase, type) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedElement = parseExpectedText(element);
    var retrivedValue;
    if (type == 'value') {
        retrivedValue = await (await browser.$(parsedElement)).getValue();
    } else {
        retrivedValue = await (await browser.$(parsedElement)).getText();
    }

    if (!!falseCase) {
        await expect(retrivedValue).toEqual('');
    } else {
        await expect(retrivedValue).not.toEqual('');
    }
};
