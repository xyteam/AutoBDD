/**
 * Return variables in VAR:varName form by look up varFile.json in the order of Module, Project and Framework
 */
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const FrameworkTestfilesPath = FrameworkPath + '/framework/testfiles';
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const TestModule = process.env.TestModule;
const ProjectTestfilesPath = `${ProjectPath}/${TestDir}/testfiles`;
const ModuleTestfilesPath = `${ProjectPath}/${TestDir}/${TestModule}/testfiles`;
const glob = require("glob");

module.exports = (expectedText) => {
    // ENV:MYENV
    const parseENV = (text) => {
        let textArray = text.split(' ');
        for (i = 0; i < textArray.length; i++) {
            textArray[i] = textArray[i].startsWith('ENV:') ? eval('process.env.' + textArray[i].split(':')[1]) : textArray[i];
        }
        // console.log(`ENV => ${textArray.join(' ')}`);
        return textArray.join(' ');
    }
    // Env{MyEnv}
    const parseEnv = (text) => {
        let textArray = text.split('Env{');
        for (i = 1; i < textArray.length; i++) {
            textArray[i] = textArray[i].includes('}') ? eval('process.env.' + textArray[i].split('}')[0]) + textArray[i].split('}').slice(1).join('}') : textArray[i];
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
                    lookupFile = 'testVars.js';
                    lookupVar = lookupText;
                }
                lookupFileList = glob.sync(ModuleTestfilesPath + '/' + lookupFile);    
                lookupFileList = lookupFileList.concat(glob.sync(ProjectTestfilesPath + '/' + lookupFile));
                lookupFileList = lookupFileList.concat(glob.sync(FrameworkTestfilesPath + '/' + lookupFile));
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
        // console.log(`VAR => ${textArray.join(' ')}`);
        return textArray.join(' ');
    }
    // Var{MyVar}
    const parseVar = (text) => {
        let textArray = text.split('Var{');
        for (i = 1; i < textArray.length; i++) {
            if (textArray[i].includes('}')) {
                let lookupText = textArray[i].split('}')[0];
                let remainText = textArray[i].split('}').slice(1).join('}');
                let lookupFile, lookupVar;
                let lookupFileList = [];
                if (lookupText.split('.').length > 1) {
                    let lookupVarArray = lookupText.split('.');
                    lookupFile = lookupVarArray[0] + '.js';
                    lookupVarArray.shift();
                    lookupVar = lookupVarArray.join('.');
                } else {
                    lookupFile = 'testVars.js';
                    lookupVar = lookupText;
                }
                lookupFileList = glob.sync(ModuleTestfilesPath + '/' + lookupFile);    
                lookupFileList = lookupFileList.concat(glob.sync(ProjectTestfilesPath + '/' + lookupFile));
                lookupFileList = lookupFileList.concat(glob.sync(FrameworkTestfilesPath + '/' + lookupFile));
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

    var myExpectedText = expectedText || '';
    var loopCount = 2;
    while ((myExpectedText.includes('ENV:') ||
            myExpectedText.includes('VAR:') ||
            myExpectedText.includes('Env{') ||
            myExpectedText.includes('Var{')) &&
           loopCount > 0) {
        loopCount--;
        // console.log(loopCount);
        myExpectedText = myExpectedText.includes('ENV:') ? parseENV(myExpectedText) : myExpectedText;
        myExpectedText = myExpectedText.includes('VAR:') ? parseVAR(myExpectedText) : myExpectedText;
        myExpectedText = myExpectedText.includes('Env{') ? parseEnv(myExpectedText) : myExpectedText;
        myExpectedText = myExpectedText.includes('Var{') ? parseVar(myExpectedText) : myExpectedText;
    }
    return myExpectedText;
};
