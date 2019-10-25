/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  action             equals, contains or matches
 * @param  {String}  type               text or value
 * @param  {String}  expectedText       The text to validate against
 */
module.exports = (targetElementIndex, targetElement, parentElementIndex, parentElement, falseCase, action, type, expectedText) => {
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    
    var targetElementId;
    if (parentElement) {
        const parentElementId = browser.elements(parentElement).value[parentElementIndexInt].ELEMENT;
        targetElementId = browser.elementIdElements(parentElementId, targetElement).value[targetElementIndexInt].ELEMENT;
    } else {
        targetElementId = browser.elements(targetElement).value[targetElementIndexInt].ELEMENT;
    }

    /**
     * The expected text to validate against
     * @type {String}
     */
    let parsedExpectedText = expectedText.startsWith('ENV:') ? eval('process.env.' + expectedText.split(':')[1]) : expectedText;

    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty element
    if (typeof parsedExpectedText === 'function') {
        parsedExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    if (typeof parsedExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        parsedExpectedText = '';
        boolFalseCase = true;
    }

    var retrivedValue;
    switch (type) {
        case 'value':
            retrivedValue = browser.elementIdAttribute(targetElementId, type).value;
        case 'text':
        default:
            retrivedValue = browser.elementIdText(targetElementId).value;
    }

    // console.log(`${type} : ${retrivedValue}`)

    if (boolFalseCase) {
        switch (action) {
            case 'contains':
                expect(retrivedValue).not.toContain(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should not contain ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should not equal ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should not match ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    } else {
        switch (action) {
            case 'contains':
                expect(retrivedValue).toContain(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should contain ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).toEqual(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should equal ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).toMatch(
                    parsedExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}"should match ${type} ` +
                    `"${retrivedValue}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
};
