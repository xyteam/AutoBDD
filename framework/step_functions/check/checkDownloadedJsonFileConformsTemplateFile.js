/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   jsonFileName        Json file name to be checked
 * @param  {String}   templateFileName    Template file name to check against
 */

const Ajv = require('ajv');
const fs_session = require('../../libs/fs_session');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (jsonFileName, templateFileName) => {
    const jsonFile_extSplit = jsonFileName.split('.');
    const jsonFileExt = jsonFile_extSplit.length > 1 ? jsonFile_extSplit.pop() : 'json';
    const myJsonFileName = jsonFile_extSplit.join('.');
    const myJsonFilePath = globSync(getDownloadDir() + myJsonFileName + '.' + jsonFileExt)[0]; // we only process the first match
    const templateFile_extSplit = templateFileName.split('.');
    const myTemplateFileExt = templateFile_extSplit.length > 1 ? templateFile_extSplit.pop() : 'json';
    const myTemplateFileName = templateFile_extSplit.join('.');
    const myTemplateFilePath = fs_session.getTestFileFullPath(myTemplateFileName, myTemplateFileExt);
    const jsonData = JSON.parse(fs_session.readJsonData(myJsonFilePath));
    const jsonSchemaOrigString = fs_session.readJsonData(myTemplateFilePath);
    const jsonSchemaParsedString = parseExpectedText(jsonSchemaOrigString);
    const jsonSchemaEscapedString = jsonSchemaParsedString.replace(/\\/g, "\\\\");
    console.log(jsonSchemaEscapedString);
    const jsonSchema = JSON.parse(jsonSchemaEscapedString);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const checkData = (jsonData.items) ? jsonData.items : jsonData; 
    checkData.forEach(data => {
        let valid = validate(data);
        expect(valid).toBe(true, `Invalid data entry:\ndata:\n${JSON.stringify(data)}\nerror:\n${ajv.errorsText(validate.errors)}`);
    })    
}
