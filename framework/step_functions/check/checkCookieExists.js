/**
 * Check if a cookie with the given name exists
 * @param  {String}   cookieName     The cookieName of the cookie
 * @param  {[type]}   falseCase      Whether or not to check if the cookie exists or
 *                                   not
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (cookieName, falseCase) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedCookieName = parseExpectedText(cookieName);

    /**
     * The cookie as retrieved from the browser
     * @type {Object}
     */
    const cookie = browser.getCookies([parsedCookieName])[0];

    if (falseCase) {
        expect(typeof(cookie)).toEqual(
            'undefined',
            `Expected cookie "${parsedCookieName}" not to exists but it does`
        );
    } else {
        expect(typeof(cookie)).not.toEqual(
            'undefined',
            `Expected cookie "${parsedCookieName}" to exists but it does not`
        );
    }
};
