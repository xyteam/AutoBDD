const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);
const parseExpectedText = require(`${process.env.FrameworkPath}/framework/step_functions/common/parseExpectedText.js`);

const { Given } = require('cucumber');

Given(/^(?::nodejs: )?I call (?:(framework|project|module) )?function "([^"]*)?" with parameters "([^"]*)?"(?: and assign ouput as "([^"]*)?")?(?: in order to .*)?$/,
    (funcType, funcName, funcParms, varName) => {
            const myParsedParms = parseExpectedText(funcParms)
            let runFunc;
            switch (funcType) {
                case "framework":
                    runFunc = require(`${process.env.PROJECTRUNPATH}/step_functions/${funcName}`);
                    break;
                default:
                case "project":
                    runFunc = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/functions/${funcName}`);
                    break;
                case "module":
                    runFunc = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/${process.env.TestModule}/functions/${funcName}`);
                    break;
            }
            const [parm1, parm2, parm3, parm4, parm5, parm6, parm7, parm8, parm9, parm10] = myParsedParms.split(',').map(s => s.trim());
            new Promise((resolve, reject) => {
                const result = runFunc(parm1, parm2, parm3, parm4, parm5, parm6, parm7, parm8, parm9, parm10);
                resolve(result);
            }).then(output => {
                if (varName) {
                process.env[varName] = output;
                console.log(`assigned "${process.env[varName]}" to ENV:${varName}`);    
            }    
            });
        }
);


