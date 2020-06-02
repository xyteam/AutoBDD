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
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (fileName, compareAction, expectedNumOfLines) => {
    const myExpectedNumber = (expectedNumOfLines) ? parseInt(parseExpectedText(expectedNumOfLines)) : 0;
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
            countedNumOfLines = fs_session.readXlsData(myFilePath).filter(row => row.length > 0).length;
            break;
        default:
            countedNumOfLines = fs.readFileSync(myFilePath).toString().split('\n').length;
    }
    const retrivedValue = countedNumOfLines;
    // console.log(`text : ${retrivedValue}`)

    switch (compareAction.trim()) {
        case 'more than':
            expect(retrivedValue).toBeGreaterThan(
                myExpectedNumber,
                `file "${fileName}" should contain more than "${myExpectedNumber}" lines`
            );        
            break;
        case 'no more than':
            expect(retrivedValue).not.toBeGreaterThan(
                myExpectedNumber,
                `file "${fileName}" should contain no more than "${myExpectedNumber}" lines`
            );        
            break;
        case 'less than':
            expect(retrivedValue).toBeLessThan(
                myExpectedNumber,
                `file "${fileName}" should contain less than "${myExpectedNumber}" lines`
            );        
            break;
        case 'no less than':
            expect(retrivedValue).not.toBeLessThan(
                myExpectedNumber,
                `file "${fileName}" should contain no less than "${myExpectedNumber}" lines`
            );        
            break;
        case 'exactly':
        default:
            expect(retrivedValue).toBe(
                myExpectedNumber,
                `file "${fileName}" should contain exactly "${myExpectedNumber}" lines`
            );        
            break;
    }
}
