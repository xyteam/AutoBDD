/**
 * Check the content of a cookie against a given value
 * @param  {String}   name          The name of the cookie
 * @param  {String}   falseCase     Whether or not to check if the value matches
 *                                  or not
 * @param  {String}   expectedValue The value to check against
 */
module.exports = (name, falseCase, expectedValue) => {
    /**
     * The cookie retrieved from the browser object
     * @type {Object}
     */
    const cookie = browser.getCookie(name);

    expect(cookie.name).toEqual(
        name,
        `no cookie found with the name "${name}"`
    );

    if (falseCase) {
        expect(cookie.value).not.toEqual(
                expectedValue,
                `expected cookie "${name}" not to have value "${expectedValue}"`
            );
    } else {
        expect(cookie.value).toEqual(
                expectedValue,
                `expected cookie "${name}" to have value "${expectedValue}"` +
                ` but got "${cookie.value}"`
            );
    }
};
