const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/step_functions/common/parseExpectedText.js');

const { Given } = require('@cucumber/cucumber');

Given(/^(?::vcenter: )?I have the "(.*)" command installed locally$/,
  async (cmdName) => {
    // check govc
    switch (cmdName) {
      case 'govc':
        var cmdString = `which ${cmdName}`;
        var resultString = cmdline_session.runCmd(cmdString);
        var resultObject = JSON.parse(resultString);
        await browser_session.displayMessage(browser, resultString);  
        await expect(resultObject.exitcode).toBe(0);    
        break;
    }
  }
);

Given(/^(?::vcenter: )?I have govc access to my vcenter with the URL "(.*)"$/,
  async (vCenterURL) => {
    const myVCenterURL = parseExpectedText(vCenterURL);
    // push myVCenterURL to be runtime global variable
    process.env.myVCenterURL = myVCenterURL;
    const cmdString = `govc about.cert -u="${myVCenterURL}" -k=true`;
    const resultString = cmdline_session.runCmd(cmdString);
    await browser_session.displayMessage(browser, resultString);
    const resultObject = JSON.parse(resultString);
    await expect(resultObject.exitcode).toBe(0);
  }
);
