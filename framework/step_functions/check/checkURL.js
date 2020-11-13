/**
 * Check the URL of the given browser window
 * @param  {String}   action        is, contains or matches
 * @param  {String}   falseCase     Whether to check if the value of the
 *                                  attribute matches or not
 * @param  {String}   expectedText The value to match against
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (target, falseCase, action, expectedText) => {
    const myExpectedText = parseExpectedText(expectedText);
    /**
     * The URL of the current browser window
     * @type {String}
     */
    const currentUrl = browser.getUrl();
    const currentUrlProtocol = (currentUrl.includes('://')) ? currentUrl.split('://')[0] : '';
    const currentUrlHost = (currentUrl.includes('://')) ? currentUrl.split('://')[1].split('/')[0].split(':')[0] : '';
    const currentUrlHostPort = (currentUrl.includes('://')) ? currentUrl.split('://')[1].split('/')[0].split(':')[1] : '';
    const currentUrlPath = (currentUrl.includes('://')) ? '/' + currentUrl.split('://')[1].split('/').slice(1).join('') : '';

    var myTestTarget;
    switch (target) {
        case 'full URL':
            myTestTarget = currentUrl;
            break;
        case 'URL protocol':
            myTestTarget = currentUrlProtocol;
            break;
        case 'URL host':
            myTestTarget = currentUrlHost;
            break;
        case 'URL host port':
            myTestTarget = currentUrlHostPort;
            break;    
        case 'URL path':
            myTestTarget = currentUrlPath;
            break;
    }
    if (falseCase) {
        switch (action) {
            case 'be':
            case 'is':
                expect(myTestTarget).not.toEqual(
                    myExpectedText,
                    `The current ${target} should not be ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(myTestTarget).not.toContain(
                    myExpectedText,
                    `The current ${target} should not contain ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(myTestTarget).not.toMatch(
                    RegExp(myExpectedText),
                    `The current ${target} should not match ` +
                    `"${myExpectedText}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'be':
            case 'is':
                expect(myTestTarget).toEqual(
                    myExpectedText,
                    `The current ${target} should be ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(myTestTarget).toContain(
                    myExpectedText,
                    `The current ${target} should contain ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(myTestTarget).toMatch(
                    RegExp(myExpectedText),
                    `The current ${target} should match ` +
                    `"${myExpectedText}"`
                );        
                break;
        }
    }
};
