/**
 * Check the given property of the given element
 * @param  {String}   isCSS         Whether to check for a CSS property or an
 *                                  attribute
 * @param  {String}   attrName      The name of the attribute to check
 * @param  {String}   element          Element selector
 * @param  {String}   action        is, contains or matches
 * @param  {String}   falseCase     Whether to check if the value of the
 *                                  attribute matches or not
 * @param  {String}   expectedValue The value to match against
 */
module.exports = (isCSS, attrName, element, action, falseCase, expectedValue) => {
    /**
     * The command to use for fetching the expected value
     * @type {String}
     */
    const command = isCSS ? 'getCssProperty' : 'getAttribute';

    /**
     * Te label to identify the attribute by
     * @type {String}
     */
    const attrType = (isCSS ? 'CSS attribute' : 'Attribute');

    /**
     * The actual attribute value
     * @type {Mixed}
     */
    let attributeValue = browser[command](element, attrName);

    /**
     * when getting something with a color or font-weight WebdriverIO returns a
     * object but we want to assert against a string
     */
    if (attrName.match(/(color|font-weight)/)) {
        attributeValue = attributeValue.value.toString();
    }

    if (falseCase) {
        switch (action) {
            case 'be':
            case 'is':
                expect(attributeValue).not.toEqual(
                    expectedValue,
                    `${attrType}: ${attrName} of element "${element}" should not be ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).not.toContain(
                    expectedValue,
                    `${attrType}: ${attrName} of element "${element}" should not contain ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).not.toMatch(
                    expectedValue,
                    `${attrType}: ${attrName} of element "${element}" should not match ` +
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
                    `${attrType}: ${attrName} of element "${element}" should be ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(attributeValue).toContain(
                    expectedValue,
                    `${attrType}: ${attrName} of element "${element}" should contain ` +
                    `"${expectedValue}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(attributeValue).toMatch(
                    expectedValue,
                    `${attrType}: ${attrName} of element "${element}" should match ` +
                    `"${expectedValue}"`
                );        
                break;
        }
    }
};
