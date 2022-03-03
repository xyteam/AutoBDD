const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/step_functions/common/parseExpectedText.js');

const { Then } = require('cucumber');

Then(/^(?::vcenter: )?The VM "(.*)" (?:should|does)( not)* exist inside esxi dc "(.*)"$/,
  (vmName, falseCase, dcName) => {
    let boolFalseCase = !!falseCase;
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const myFindVmCmd = `govc find -u="${myVCenterURL}" -k=true -dc="${myDcName}" -name "${myVmName}"`;
    console.log(myFindVmCmd);
    const myFindVmResult = cmdline_session.runCmd(myFindVmCmd);
    browser_session.displayMessage(browser, myFindVmResult);
    const myResultList = JSON.parse(myFindVmResult).output.split('\n').filter(e => e);
    if (boolFalseCase) {
      expect(myResultList.length).toBe(0);
    }
    else {
      expect(myResultList.length).toBe(1);
    }
  }
);

Then(/^(?::vcenter: )?The VM "(.*)" information inside esxi dc "(.*)" (?:should|does)( not)* (contain|equal|match) the (text|regex) "(.*)?"$/,
  (vmName, dcName, falseCase, compareAction, expectType, expectedText) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myExpectedText = parseExpectedText(expectedText);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const cmdString = `govc vm.info -u="${myVCenterURL}" -k=true -dc="${myDcName}" "${myVmName}"`;
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
