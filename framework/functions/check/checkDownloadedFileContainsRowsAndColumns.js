/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   fileName             File name
 * @param  {String}   rowCompareAction     exactly, more than, less than
 * @param  {String}   expectedNumOfRows    Expected number of rows
 * @param  {String}   colCompareAction     exactly, more than, less than
 * @param  {String}   expectedNumOfColumns Expected number of columns
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const fs_session = require('../../libs/fs_session');

module.exports = (fileName, rowCompareAction, expectedNumOfRows, colCompareAction, expectedNumOfColumns) => {
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
        switch (rowCompareAction.trim()) {
            case 'more than':
                expect(countedNumOfRows).toBeGreaterThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain more than ${parsedExpectedNumOfRows} rows`
                );    
                break;
            case 'no more than':
                expect(countedNumOfRows).not.toBeGreaterThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain no more than ${parsedExpectedNumOfRows} rows`
                );    
                break;
            case 'less than':
                expect(countedNumOfRows).toBeLessThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain less than ${parsedExpectedNumOfRows} rows`
                );
                break;
            case 'no less than':
                expect(countedNumOfRows).not.toBeLessThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain no less than ${parsedExpectedNumOfRows} rows`
                );
                break;
            case 'exactly':
            default:
                expect(countedNumOfRows).toBe(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain ${parsedExpectedNumOfRows} rows`
                );
                break;
        }
    }

    if (expectedNumOfColumns) {
        let parsedExpectedNumOfColumns = parseInt(expectedNumOfColumns);
        switch (colCompareAction.trim()) {
            case 'more than':
                expect(countedNumOfColumns).toBeGreaterThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain more than ${parsedExpectedNumOfColumns} rows`
                );    
                break;
            case 'no more than':
                expect(countedNumOfColumns).not.toBeGreaterThan(
                    parsedExpectedNumOfRows,
                    `file ${fileName} should contain no more than ${parsedExpectedNumOfColumns} rows`
                );    
                break;    
            case 'less than':
                expect(countedNumOfColumns).toBeLessThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain less than ${parsedExpectedNumOfColumns} rows`
                );
            case 'no less than':
                expect(countedNumOfColumns).not.toBeLessThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain no less than ${parsedExpectedNumOfColumns} rows`
                );
                break;
            case 'exactly':
            default:
                expect(countedNumOfColumns).toBe(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain ${parsedExpectedNumOfColumns} rows`
                );
                break;
        }
    }
}
