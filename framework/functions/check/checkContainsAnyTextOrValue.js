/**
 * Check if the given elements contains text
 * @param  {String}   elementType   Element type (element or button)
 * @param  {String}   element       Element selector
 * @param  {String}   falseCase     Whether to check if the content contains
 *                                  text or not
 * @param  {String}   type          text or value
 */
module.exports = (elementType, element, falseCase, type) => {
    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command = 'getText'
    
    if (type == 'value') {
        command = 'getValue';
    } 

    /**
     * False case
     * @type {Boolean}
     */
    let boolFalseCase;

    /**
     * The text of the element
     * @type {String}
     */
    const text = browser[command](element);

    if (typeof falseCase === 'undefined' || falseCase == null) {
        boolFalseCase = false;
    } else {
        boolFalseCase = !!falseCase;
    }

    if (boolFalseCase) {
        expect(text).toEqual('');
    } else {
        expect(text).not.toEqual('');
    }
};
