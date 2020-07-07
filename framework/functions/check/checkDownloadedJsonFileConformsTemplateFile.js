/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   jsonFileName        Json file name to be checked
 * @param  {String}   templateFileName    Template file name to check against
 */

const glob = require('glob');
const fs = require('fs');
const Ajv = require('ajv');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkTestfilesPath = FrameworkPath + '/framework/testfiles';
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const TestModule = process.env.TestModule;
const ProjectTestfilesPath = `${ProjectPath}/${TestDir}/testfiles`;
const ModuleTestfilesPath = `${ProjectPath}/${TestDir}/${TestModule}/testfiles`;
const fs_session = require('../../libs/fs_session');
const getDownloadDir = require('../common/getDownloadDir');
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (jsonFileName, templateFileName) => {
    const jsonFile_extSplit = jsonFileName.split('.');
    const jsonFileExt = jsonFile_extSplit.length > 1 ? jsonFile_extSplit.pop() : null;
    const myJsonFileName = jsonFile_extSplit.join('.');
    const myJsonFilePath = glob.sync(getDownloadDir() + myJsonFileName + '.' + jsonFileExt)[0]; // we only process the first match
    const templateFilePath = glob.sync(ModuleTestfilesPath + '/' + templateFileName)[0] 
        || glob.sync(ProjectTestfilesPath + '/' + templateFileName)[0]
        || glob.sync(FrameworkTestfilesPath + '/' + templateFileName)[0];
    console.log(templateFilePath);
    const jsonData = JSON.parse(fs_session.readJsonData(myJsonFilePath));
    const jsonSchemaOrigString = fs_session.readJsonData(templateFilePath);
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
