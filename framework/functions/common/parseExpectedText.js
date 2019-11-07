/**
 * Return variables in VAR:varName form by look up varFile.json in the order of Module, Project and Framework
 */
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkSupportPath = FrameworkPath + '/framework/support';
const ProjectPath = process.env.PROJECTRUNPATH;
const ProjectSupportPath = ProjectPath + '/project/support';
const ModulePath = ProjectPath + '/' + process.env.ThisModule;
const ModuleSupportPath = ModulePath + '/support';
const glob = require("glob");

module.exports = (expectedText) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedExpectedText;
    if (expectedText && expectedText != '') {
        parsedExpectedText = expectedText.startsWith('ENV:') ? eval('process.env.' + expectedText.split(':')[1]) : expectedText;
    } else {
        parsedExpectedText = '';
    }
    
    if (parsedExpectedText.startsWith('VAR:')) {
        let lookupText = parsedExpectedText.split(':')[1];
        var lookupFile, lookupVar;
        var lookupFileList = [];
        if (lookupText.split('.').length > 1) {
            let lookupVarArray = lookupText.split('.');
            lookupFile = lookupVarArray[0] + '.js';
            lookupVarArray.shift();
            lookupVar = lookupVarArray.join('.');
        } else {
            lookupFile = '*.js';
            lookupVar = lookupText;
        }
        lookupFileList = glob.sync(ModuleSupportPath + '/testfiles/' + lookupFile);    
        lookupFileList = lookupFileList.concat(glob.sync(ProjectSupportPath + '/testfiles/' + lookupFile));
        lookupFileList = lookupFileList.concat(glob.sync(FrameworkSupportPath + '/testfiles/' + lookupFile));
        for (let targetFile of lookupFileList) {
            let varData = require(targetFile);
            let targetVar = eval('varData.' + lookupVar);
            if (targetVar) {
                parsedExpectedText = targetVar;
                break;
            }
        }
    }
    return parsedExpectedText;
};
