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
    const cookie = browser.getCookie(parsedCookieName);

    if (falseCase) {
        expect(cookie).toEqual(
            null,
            `Expected cookie "${parsedCookieName}" not to exists but it does`
        );
    } else {
        expect(cookie).not.toEqual(
            null,
            `Expected cookie "${parsedCookieName}" to exists but it does not`
        );
    }
};
