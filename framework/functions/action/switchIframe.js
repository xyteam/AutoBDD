/**
 * Select a option from a select element by it's index
 * @param  {String}   index      The index of the iframe
 * @param  {String}   name       The name of the iframe 
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (index, name) => {
    /**
     * The index of the option to select
     * @type {Int}
     */
    if (index && index == 'parent') {
        browser.frameParent();
    } else {
        const iFrameIndex = (index) ? parseInt(index, 10) - 1 : 0;
        const iFrameName = (name) ? parseExpectedText(name) : '';
        var iFrameElement;
        if (iFrameName.length > 0) {
            iFrameElement = browser.$$(`iframe[name="${iFrameName}"]`).value[iFrameIndex].value;
        } else {
            iFrameElement = browser.$$('iframe').value[iFrameIndex].value;
        }
        browser.frame(iFrameElement);    
    }
};
