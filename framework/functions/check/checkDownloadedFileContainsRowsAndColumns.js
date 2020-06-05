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
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (fileName, rowCompareAction, expectedNumOfRows, rowType, colCompareAction, expectedNumOfColumns, columnType) => {
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
            if (rowType.includes('data')) countedNumOfRows -= 1; // reduce by 1 for data row (without header row)
            countedNumOfColumns = (countedNumOfRows > 0) ? xlsData[0].length : 0;
            if (columnType.includes('data')) countedNumOfColumns -= 1; // reduce by 1 for data column (without lead column)
            break;
        case 'json':
        case 'JSON':
            const jsonString = fs_session.readJsonData(myFilePath);
            const jsonData = JSON.parse(jsonString);
            countedNumOfRows = (jsonData.items) ? jsonData.items.length : Object.keys(jsonData).length;
            countedNumOfColumns = (countedNumOfRows > 0) ? (jsonData.header) ? jsonData.header.length : Object.keys(jsonData[0]).length : 0;
            break;
        default:
            countedNumOfRows = fs.readFileSync(myFilePath).toString().split('\n').length;
    }

    if (expectedNumOfRows) {
        const parsedExpectedNumOfRows = (expectedNumOfRows) ? parseInt(parseExpectedText(expectedNumOfRows)) : 0;
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
        let parsedExpectedNumOfColumns = (expectedNumOfColumns) ? parseInt(parseExpectedText(expectedNumOfColumns)) : 0;
        switch (colCompareAction.trim()) {
            case 'more than':
                expect(countedNumOfColumns).toBeGreaterThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain more than ${parsedExpectedNumOfColumns} columns`
                );    
                break;
            case 'no more than':
                expect(countedNumOfColumns).not.toBeGreaterThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain no more than ${parsedExpectedNumOfColumns} columns`
                );    
                break;    
            case 'less than':
                expect(countedNumOfColumns).toBeLessThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain less than ${parsedExpectedNumOfColumns} columns`
                );
            case 'no less than':
                expect(countedNumOfColumns).not.toBeLessThan(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain no less than ${parsedExpectedNumOfColumns} columns`
                );
                break;
            case 'exactly':
            default:
                expect(countedNumOfColumns).toBe(
                    parsedExpectedNumOfColumns,
                    `file ${fileName} should contain ${parsedExpectedNumOfColumns} columns`
                );
                break;
        }
    }
}
