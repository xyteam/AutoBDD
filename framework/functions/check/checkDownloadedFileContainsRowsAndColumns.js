/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName             File name
 * @param  {String}   expectedNumOfRows    Expected number of rows
 * @param  {String}   expectedNumOfColumns Expected number of columns
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, expectedNumOfRows, expectedNumOfColumns) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFilePath = globSync(getDownloadDir() + '/' + myFileName + '.' + myFileExt)[0]; // we only process the first match
    
    var countedNumOfRows, countedNumOfColumns;
    switch (myFileExt) {
        case 'pdf':
        case 'PDF':
            countedNumOfRows = fs_session.readPdfData(myFilePath).text.split('\n').length;
            break;
        case 'xls':
        case 'XLS':
        case 'xlsx':
        case 'XLSX':
        case 'csv':
        case 'CSV':
            const xlsData = fs_session.readXlsData(myFilePath).filter(row => row.length > 0);
            countedNumOfRows = xlsData.length;
            countedNumOfColumns = xlsData[0].length;
            break;
        default:
            countedNumOfRows = fs.readFileSync(myFilePath).toString().split('\n').length;
    }

    if (expectedNumOfRows) {
        let parsedExpectedNumOfRows = parseInt(expectedNumOfRows);
        expect(countedNumOfRows).toEqual(
            parsedExpectedNumOfRows,
            `file "${fileName}" should contain text ` +
            `"${parsedExpectedNumOfRows}"`
        );    
    }

    if (expectedNumOfColumns) {
        let parsedExpectedNumOfColumns = parseInt(expectedNumOfColumns);
        expect(countedNumOfColumns).toEqual(
            parsedExpectedNumOfColumns,
            `file "${fileName}" should contain text ` +
            `"${parsedExpectedNumOfColumns}"`
        );    
    }
}