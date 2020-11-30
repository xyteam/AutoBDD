const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/step_functions/common/parseExpectedText.js');

const { Then } = require('cucumber');

Then(/^(?::vcenter: )?The VM "(.*)" (?:should|does)( not)* exist in esxi host "(.*)" inside esxi dc "(.*)"$/,
  (vmName, falseCase, hostIP, dcName) => {
    let boolFalseCase = !!falseCase;
    const myVmName = parseExpectedText(vmName);
    const myEsxiHost = parseExpectedText(hostIP);
    const myClusterIP = process.env.myClusterIP || myEsxiHost;
    const myDcName = parseExpectedText(dcName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const cmdString = `govc ls -u=${myVCenterURL} -k=true -dc=${myDcName} host/${myClusterIP}/${myEsxiHost}/${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    browser_session.displayMessage(browser, resultString);
    const resultObject = JSON.parse(resultString);
    if (boolFalseCase) {
      expect(resultObject.output).not.toContain(`host/${myClusterIP}/${myEsxiHost}/${myVmName}`);
      expect(resultObject.exitcode).toBe(0);
    }
    else {
      expect(resultObject.output).toContain(`host/${myClusterIP}/${myEsxiHost}/${myVmName}`);
      expect(resultObject.exitcode).toBe(0);
    }
  }
);

Then(/^(?::vcenter: )?The VM "(.*)" information inside esxi dc "(.*)" (?:should|does)( not)* (contain|equal|match) the (text|regex) "(.*)?"$/,
  (vmName, dcName, falseCase, compareAction, expectType, expectedText) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myExpectedText = parseExpectedText(expectedText);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const cmdString = `govc vm.info -u=${myVCenterURL} -k=true -dc=${myDcName} ${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    browser_session.displayMessage(browser, resultString);
    const resultObject = JSON.parse(resultString);
    var lineText = resultObject.output;
    let boolFalseCase = !!falseCase;
    if (boolFalseCase) {
      switch (compareAction) {
        case 'contain':
          expect(lineText).not.toContain(
            myExpectedText,
            `console should not contain the ${expectType} ` +
            `"${myExpectedText}"`
          );        
          break;
        case 'equal':
          expect(lineText).not.toEqual(
            myExpectedText,
            `console should not equal the ${expectType} ` +
            `"${myExpectedText}"`
          );        
          break;
        case 'match':
            expect(lineText.toLowerCase()).not.toMatch(
              RegExp(myExpectedText.toLowerCase()),
              `console should match the ${expectType} ` +
              `"${myExpectedText}"`
            );        
          break;
        default:
          expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
      }
    } else {
      switch (compareAction) {
          case 'contain':
            expect(lineText).toContain(
              myExpectedText,
              `console should contain the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
        case 'equal':
            expect(lineText).toEqual(
              myExpectedText,
              `console should equal the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
          case 'match':
            expect(lineText.toLowerCase()).toMatch(
              RegExp(myExpectedText.toLowerCase()),
              `console should match the ${expectType} ` +
              `"${myExpectedText}"`
            );        
            break;
          default:
            expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
      }
    }
  }
);
