/**
 * Select an option of a select element
 * @param  {String}   selectionType  Type of method to select by (name, value or
 *                                   text)
 * @param  {String}   selectionValue Value to select by
 * @param  {String}   selectElem     Element selector
 */
module.exports = (selectionType, selectionValue, selectElem) => {
    /**
     * The method to use for selecting the option
     * @type {String}
     */
    var command, arg1, arg2;

    switch (selectionType) {
        case 'name': {
            command = 'selectByAttribute';
            arg1 = 'name';
            arg2 = selectionValue;
            break;
        }

        case 'value': {
            command = 'selectByAttribute';
            arg1 = 'value';
            arg2 = selectionValue;
            break;
        }

        case 'text': {
            command = 'selectByVisibleText';
            arg1 = selectionValue;
            break;
        }

        default: {
            throw new Error(`Unknown selection type "${selectionType}"`);
        }
    }

    browser.$(selectElem)[command](arg1, arg2);
};
