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
    // ENV:MYENV
    const parseENV = (text) => {
        let textArray = text.split(' ');
        for (i = 0; i < textArray.length; i++) {
            textArray[i] = textArray[i].startsWith('ENV:') ? eval('process.env.' + textArray[i].split(':')[1]) : textArray[i];
        }
        // console.log(`ENV => ${textArray.join('')}`);
        return textArray.join('');
    }
    // Env{MyEnv}
    const parseEnv = (text) => {
        let textArray = text.split('Env{');
        for (i = 0; i < textArray.length; i++) {
            textArray[i] = textArray[i].includes('}') ? eval('process.env.' + textArray[i].split('}')[0]) + textArray[i].split('}')[1] : textArray[i];
        }
        // console.log(`Env => ${textArray.join('')}`);
        return textArray.join('');
    }
    // VAR:MYVAR
    const parseVAR = (text) => {
        let textArray = text.split(' ');
        for (i = 0; i < textArray.length; i++) {
            if (textArray[i].startsWith('VAR:')) {
                let lookupText = textArray[i].split(':')[1];
                let lookupFile, lookupVar;
                let lookupFileList = [];
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
                        textArray[i] = targetVar;
                        break;
                    }
                }
            }    
        }
        // console.log(`VAR => ${textArray.join('')}`);
        return textArray.join('');
    }
    // Var{MyVar}
    const parseVar = (text) => {
        let textArray = text.split('Var{');
        for (i = 0; i < textArray.length; i++) {
            if (textArray[i].includes('}')) {
                let lookupText = textArray[i].split('}')[0];
                let remainText = textArray[i].split('}')[1];
                let lookupFile, lookupVar;
                let lookupFileList = [];
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
                        textArray[i] = targetVar + remainText;
                        break;
                    }
                }
            }    
        }
        // console.log(`Var => ${textArray.join('')}`);
        return textArray.join('');
    }

    var parsedExpectedText = expectedText || '';
    var loopCount = 2;
    while ((parsedExpectedText.includes('ENV:') ||
            parsedExpectedText.includes('VAR:') ||
            parsedExpectedText.includes('Env{') ||
            parsedExpectedText.includes('Var{')) &&
           loopCount > 0) {
        loopCount--;
        // console.log(loopCount);
        parsedExpectedText = parsedExpectedText.includes('ENV:') ? parseENV(parsedExpectedText) : parsedExpectedText;
        parsedExpectedText = parsedExpectedText.includes('VAR:') ? parseVAR(parsedExpectedText) : parsedExpectedText;
        parsedExpectedText = parsedExpectedText.includes('Env{') ? parseEnv(parsedExpectedText) : parsedExpectedText;
        parsedExpectedText = parsedExpectedText.includes('Var{') ? parseVar(parsedExpectedText) : parsedExpectedText;
    }
    return parsedExpectedText;
};
