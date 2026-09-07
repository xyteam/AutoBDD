/**
 * Select a option from a select element by it's index
 * @param  {String}   index      The index of the iframe
 * @param  {String}   name       The name of the iframe 
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = async (index, name) => {
    /**
     * The index of the option to select
     * @type {Int}
     */
    let iFrameElement, iFrameIndex;
    let iFrameName = (name) ? parseExpectedText(name) : '';

    if (iFrameName.length > 0) {
        iFrameElement = `iframe[name="${iFrameName}"]`;
    } else {
        iFrameElement = 'iframe';
    }

    if (index && index == 'parent') {
        await browser.switchToParentFrame();
    } else if (index && index == 'last') {
        iFrameIndex = (await $$(iFrameElement)).length -1;
    } else {
        iFrameIndex = (index) ? parseInt(index, 10) - 1 : 0;
        await (await $(iFrameElement)).waitForExist();
        await browser.switchToFrame((await $$(iFrameElement))[iFrameIndex]);
    }
};
