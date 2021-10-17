const checkIfElementExists = require('../check/checkIfElementExists');

/**
 * Check if the given element exists
 * @param  {String}   isExisting Whether the element should be existing or not
 *                               (an or no)
 * @param  {String}   elem       Element selector
 */
module.exports = async (isExisting, elem) => {
    /**
     * Falsecase assertion
     * @type {Boolean}
     */
    let falseCase = true;

    if (isExisting === 'an') {
        falseCase = false;
    }

    checkIfElementExists(elem, falseCase);
};
