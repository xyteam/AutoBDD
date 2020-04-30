/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName            File name
 * @param  {String}   compareAction       exactly, more than, less than
 * @param  {String}   expectedNumOfLines  The text to validate against
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, compareAction, expectedNumOfLines) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFilePath = globSync(getDownloadDir() + myFileName + '.' + myFileExt)[0]; // we only process the first match
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

    // Check for empty element
    if (typeof parsedExpectedNumOfLines === 'function') {
        parsedExpectedNumOfLines = '';
    }

    if (typeof parsedExpectedNumOfLines === 'undefined' && typeof falseCase === 'undefined') {
        parsedExpectedNumOfLines = '';
    }

    const retrivedValue = countedNumOfLines;
    // console.log(`text : ${retrivedValue}`)

    switch (compareAction.trim()) {
        case 'more than':
            expect(retrivedValue).toBeGreaterThan(
                parsedExpectedNumOfLines,
                `file "${fileName}" should contain more than "${parsedExpectedNumOfLines}" lines`
            );        
            break;
        case 'no more than':
            expect(retrivedValue).not.toBeGreaterThan(
                parsedExpectedNumOfLines,
                `file "${fileName}" should contain no more than "${parsedExpectedNumOfLines}" lines`
            );        
            break;
        case 'less than':
            expect(retrivedValue).toBeLessThan(
                parsedExpectedNumOfLines,
                `file "${fileName}" should contain less than "${parsedExpectedNumOfLines}" lines`
            );        
            break;
        case 'no less than':
            expect(retrivedValue).not.toBeLessThan(
                parsedExpectedNumOfLines,
                `file "${fileName}" should contain no less than "${parsedExpectedNumOfLines}" lines`
            );        
            break;
        case 'exactly':
        default:
            expect(retrivedValue).toBe(
                parsedExpectedNumOfLines,
                `file "${fileName}" should contain exactly "${parsedExpectedNumOfLines}" lines`
            );        
            break;
    }
}
