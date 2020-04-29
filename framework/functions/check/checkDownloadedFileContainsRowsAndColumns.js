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
            // need the filter statement to filter empty lines
            const xlsData = fs_session.readXlsData(myFilePath).filter(row => row.length > 0);
            countedNumOfRows = xlsData.length;
            countedNumOfColumns = (countedNumOfRows > 0) ? xlsData[0].length : 0;
            break;
        case 'json':
        case 'JSON':
            const jsonData = fs_session.readJsonData(myFilePath);
            countedNumOfRows = Object.keys(jsonData).length;
            countedNumOfColumns = (countedNumOfRows > 0) ? Object.keys(jsonData[0]).length : 0;
            break;
        default:
            countedNumOfRows = fs.readFileSync(myFilePath).toString().split('\n').length;
    }

    if (expectedNumOfRows) {
        let parsedExpectedNumOfRows = parseInt(expectedNumOfRows);
        expect(countedNumOfRows).toBe(
            parsedExpectedNumOfRows,
            `file ${fileName} should contain ${parsedExpectedNumOfRows} rows`
        );    
    }

    if (expectedNumOfColumns) {
        let parsedExpectedNumOfColumns = parseInt(expectedNumOfColumns);
        expect(countedNumOfColumns).toBe(
            parsedExpectedNumOfColumns,
            `file ${fileName} should contain ${parsedExpectedNumOfColumns} columns`
        );    
    }
}
