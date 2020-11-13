/**
 * Check the given property of the given selector
 * @param  {String}   isCSS         Whether to check for a CSS property or an
 *                                  attribute
 * @param  {String}   attrName      The name of the attribute to check
 * @param  {String}   selector      Element selector
 * @param  {String}   action        is, contains or matches
 * @param  {String}   falseCase     Whether to check if the value of the
 *                                  attribute matches or not
 * @param  {String}   expectedValue The value to match against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (isCSS, attrName, selector, action, falseCase, expectedValue) => {
    const  mySelector = parseExpectedText(selector);
    var  myExpectedValue = parseExpectedText(expectedValue);
    /**
     * The command to use for fetching the expected value
     * @type {String}
     */
    const command = isCSS ? 'getCSSProperty' : 'getAttribute';

    /**
     * Te label to identify the attribute by
     * @type {String}
     */
    const attrType = (isCSS ? 'CSS attribute' : 'Attribute');

    /**
     * The actual attribute value
     * @type {Mixed}
     */
    let attributeValue = $(mySelector)[command](attrName);

    // eslint-disable-next-line
    myExpectedValue = isFinite(myExpectedValue) ?
        parseFloat(myExpectedValue)
        : myExpectedValue;


    /**
     * when getting something with a color or font-weight WebdriverIO returns a
     * object but we want to assert against a string
     */
    if (attrName.match(/(color|font-weight)/)) {
        attributeValue = attributeValue.value;
    }

    if (falseCase) {
        switch (action) {
            case 'be':
            case 'is':
                expect(attributeValue).not.toEqual(
                    myExpectedValue,
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should not be ` +
                    `"${myExpectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).not.toContain(
                    myExpectedValue,
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should not contain ` +
                    `"${myExpectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).not.toMatch(
                    RegExp(myExpectedValue),
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should not match ` +
                    `"${myExpectedValue}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'be':
            case 'is':
                expect(attributeValue).toEqual(
                    myExpectedValue,
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should be ` +
                    `"${myExpectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).toContain(
                    myExpectedValue,
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should contain ` +
                    `"${myExpectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).toMatch(
                    RegExp(myExpectedValue),
                    `${attrType}: ${attrName} of mySelector "${mySelector}" should match ` +
                    `"${myExpectedValue}"`
                );        
                break;
        }
    }
};
