/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName            File name
 * @param  {String}   falseCase           Whether to check if the content equals the given text or not
 * @param  {String}   compareAction       exactly, more than, less than
 * @param  {String}   expectedNumOfLines  The text to validate against
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, falseCase, compareAction, expectedNumOfLines) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFilePath = globSync(getDownloadDir() + '/' + myFileName + '.' + myFileExt)[0]; // we only process the first match
    var countedNumOfLines;
    switch (myFileExt) {
        case 'pdf':
        case 'PDF':
            countedNumOfLines = fs_session.readPdfData(myFilePath).text.split('\n').length;
            break;
        case 'xls':
        case 'XLS':
        case 'xlsx':
        case 'XLSX':
        case 'csv':
        case 'CSV':
            countedNumOfLines = fs_session.readXlsData(myFilePath).toString().split('\n').length;
            break;
        default:
            countedNumOfLines = fs.readFileSync(myFilePath).toString().split('\n').length;
    }
    /**
     * The expected text to validate against
     * @type {String}
     */
    let parsedExpectedNumOfLines = parseInt(expectedNumOfLines);

    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty element
    if (typeof parsedExpectedNumOfLines === 'function') {
        parsedExpectedNumOfLines = '';
        boolFalseCase = !boolFalseCase;
    }

    if (typeof parsedExpectedNumOfLines === 'undefined' && typeof falseCase === 'undefined') {
        parsedExpectedNumOfLines = '';
        boolFalseCase = true;
    }

    const retrivedValue = countedNumOfLines;
    // console.log(`text : ${retrivedValue}`)

    let compareAction_instruction = `compareAction ${compareAction} should be one of exactly, more than or less than`;
    if (boolFalseCase) {
        switch (compareAction) {
            case 'exactly':
                expect(retrivedValue).not.toEqual(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should not contain text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            case 'more than':
                expect(retrivedValue).not.toBeGreaterThan(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should not equal text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            case 'less than':
                expect(retrivedValue).not.toBeLessThan(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should not match text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            default:
                expect(false).toBe(true, compareAction_instruction);
        }
    } else {
        switch (compareAction) {
            case 'exactly':
                expect(retrivedValue).toEqual(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should contain text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            case 'more than':
                expect(retrivedValue).toBeGreaterThan(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should equal text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            case 'less than':
                expect(retrivedValue).toBeLessThan(
                    parsedExpectedNumOfLines,
                    `file "${fileName}" should match text ` +
                    `"${parsedExpectedNumOfLines}"`
                );        
                break;
            default:
                expect(false).toBe(true, compareAction_instruction);
        }
    }
}
