/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName      File name
 * @param  {String}   falseCase     Whether to check if the content equals the
 *                                  given text or not
 * @param  {String}   action        equals, contains or matches
 * @param  {String}   expectedText  The text to validate against
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, falseCase, action, expectedText) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const downloadFilePath = globSync(getDownloadDir() + '/' + myFileName + '.' + myFileExt)[0]; // we only process the first match
    var downloadFileContent;
    switch (myFileExt) {
        case 'pdf':
        case 'PDF':
            downloadFileContent = fs_session.readPdfData(downloadFilePath).text;
            break;
        case 'xls':
        case 'XLS':
        case 'xlsx':
        case 'XLSX':
        case 'csv':
        case 'CSV':
            downloadFileContent = fs_session.readXlsData(downloadFilePath).toString();
            break;
        default:
            downloadFileContent = fs.readFileSync(downloadFilePath).toString();
    }
    /**
     * The expected text to validate against
     * @type {String}
     */
    let parsedExpectedText = expectedText;

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

    const retrivedValue = downloadFileContent;
    // console.log(`text : ${retrivedValue}`)

    if (boolFalseCase) {
        switch (action) {
            case 'contains':
                expect(retrivedValue).not.toContain(
                    parsedExpectedText,
                    `file "${fileName}" should not contain text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    parsedExpectedText,
                    `file "${fileName}" should not equal text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    parsedExpectedText,
                    `file "${fileName}" should not match text ` +
                    `"${parsedExpectedText}"`
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
                    `file "${fileName}" should contain text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).toEqual(
                    parsedExpectedText,
                    `file "${fileName}" should equal text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).toMatch(
                    parsedExpectedText,
                    `file "${fileName}" should match text ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}
