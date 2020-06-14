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
module.exports = (isCSS, attrName, selector, action, falseCase, expectedValue) => {
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
    let attributeValue = $(selector)[command](attrName);

    // eslint-disable-next-line
    expectedValue = isFinite(expectedValue) ?
        parseFloat(expectedValue)
        : expectedValue;


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
                    expectedValue,
                    `${attrType}: ${attrName} of selector "${selector}" should not be ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).not.toContain(
                    expectedValue,
                    `${attrType}: ${attrName} of selector "${selector}" should not contain ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).not.toMatch(
                    RegExp(expectedValue),
                    `${attrType}: ${attrName} of selector "${selector}" should not match ` +
                    `"${expectedValue}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'be':
            case 'is':
                expect(attributeValue).toEqual(
                    expectedValue,
                    `${attrType}: ${attrName} of selector "${selector}" should be ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).toContain(
                    expectedValue,
                    `${attrType}: ${attrName} of selector "${selector}" should contain ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).toMatch(
                    RegExp(expectedValue),
                    `${attrType}: ${attrName} of selector "${selector}" should match ` +
                    `"${expectedValue}"`
                );        
                break;
        }
    }
};
