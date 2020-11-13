/**
 * Check the content of a cookie against a given value
 * @param  {String}   cookieName     The cookieName of the cookie
 * @param  {String}   falseCase      Whether or not to check if the value matches
 *                                   or not
 * @param  {String}   expectedValue  The value to check against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (cookieName, falseCase, expectedValue) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedCookieName = parseExpectedText(cookieName);

    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedExpectedValue = parseExpectedText(expectedValue);

    /**
     * The cookie retrieved from the browser object
     * @type {Object}
     */
    const cookie = browser.getCookies([parsedCookieName])[0];

    expect(cookie.name).toEqual(
        parsedCookieName,
        `no cookie found with the name "${parsedCookieName}"`
    );

    if (falseCase) {
        expect(cookie.value).not.toEqual(
                parsedExpectedValue,
                `expected cookie "${parsedCookieName}" not to have value "${parsedExpectedValue}"`
            );
    } else {
        expect(cookie.value).toEqual(
                parsedExpectedValue,
                `expected cookie "${parsedCookieName}" to have value "${parsedExpectedValue}"` +
                ` but got "${cookie.value}"`
            );
    }
};
