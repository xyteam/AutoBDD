const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/step_functions/common/parseExpectedText.js');
const path = require('path');

const { When } = require('cucumber');

When(/^(?::vcenter: )?I change the VM with config below:$/,
  { timeout: 15 * 60 * 1000 },
  (table) => {
    const config = table.rowsHash();
    const myVmName = parseExpectedText(config.vmName);
    const myDcName = parseExpectedText(config.dcName);
    const myMemLimit = parseExpectedText(config.memLimit);
    const myMemReservation = parseExpectedText(config.memReservation);
    const myMemShares = parseExpectedText(config.memShares);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const cmdString = `govc vm.change -m ${myMemLimit} -mem.limit=${myMemLimit} -mem.reservation=${myMemReservation} -mem.shares=${myMemShares} -u=${myVCenterURL} -k=true -dc=${myDcName} -vm=${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    browser_session.displayMessage(browser, resultString);
    const exitCode = JSON.parse(resultString).exitcode;
    if (exitCode == 0) {
      console.log('change memory size action succeed.');
    } else {
      console.log('change memory size action failed. maybe power-off fist?');
    }
    expect(exitCode).toBe(0);
  }
);

When(/^(?::vcenter: )?I connect the "(.*)" to "(.*)" for the VM "(.*)" inside esxi dc "(.*)"$/,
  (nicName, netName, vmName, dcName) => {
    const myNicName = parseExpectedText(nicName);
    const myNetName = parseExpectedText(netName);
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const govcCmd = 'vm.network.change';
    const cmdString = `govc ${govcCmd} -u=${myVCenterURL} -k=true -dc=${myDcName} -vm=${myVmName} -net "${myNetName}" ${myNicName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    browser_session.displayMessage(browser, resultString);
    const exitCode = JSON.parse(resultString).exitcode;
    if (exitCode == 0) {
      console.log('network changed');
    } else {
      console.log('network change failed');
    }
  }
);

When(/^(?::vcenter: )?I (power on|power off|destroy) the VM "(.*)" inside esxi dc "(.*)" esxi host "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  (esxiCmd, vmName, dcName, esxiHost) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myEsxiHost = parseExpectedText(esxiHost);
    var govcCmd;
    switch (esxiCmd) {
      case 'power on':
        govcCmd = 'vm.power -on';
        break;
      case 'power off':
        govcCmd = 'vm.power -off -force=true';
        break;
      case 'destroy':
        govcCmd = 'vm.destroy';
        break;
    }
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const cmdString = `govc ${govcCmd} -u=${myVCenterURL} -k=true -dc=${myDcName} /${myDcName}/host/${myEsxiHost}/${myEsxiHost}/${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    browser_session.displayMessage(browser, resultString);
    const exitCode = JSON.parse(resultString).exitcode;
    if (exitCode == 0) {
      console.log('action accepted, waiting 90 seconds...');
      browser.pause(9000);
    } else {
      console.log('action not needed');
    }
  }
);

When(/^(?::vcenter: )?I (?:(re-))?open the HTML5 console to the VM "(.*)" inside esxi dc "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  (reopen, vmName, dcName) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    var myReopen = reopen || false;
    const govcCmd = 'vm.console';
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const myVCenterHost = myVCenterURL.substring(myVCenterURL.lastIndexOf('@') + 1);
    const myVCenterPassPhase = myVCenterURL.substring(myVCenterURL.indexOf('://') + 3, myVCenterURL.lastIndexOf('@')).split(':');
    const myVCenterUser = myVCenterPassPhase[0].replace(/["]/g, '');
    const myVCenterPass = myVCenterPassPhase[1].replace(/["]/g, '');
    // define bypass chrome warning function
    const bypassChromeWarning = () => {
      if (browser.$('button=Advanced').waitForExist(3000)) {
        browser.$('button=Advanced').click();
        browser.$('a*=Proceed to').click();
      }
    }
    // define login function
    const loginVcenter = () => {
      if (browser.$('#username').waitForExist(3000)) {
        browser.$('#username').setValue(myVCenterUser);
        browser.$('#password').setValue(myVCenterPass);
        browser.$('#submit').click();
      }
      browser.$('.settings').waitForDisplayed(30 * 1000);
    }
    // define logout function
    const logoutVcenter = () => {
      if (browser.$('.nav-icon.user-menu-large').waitForExist(3000)) {
        browser.$('.nav-icon.user-menu-large').click();
        browser.$('a=Logout').click();
      }
      browser.$('#password').waitForDisplayed(30 * 1000);
    }

    // get VM console URL
    const cmdString = `govc ${govcCmd} -u=${myVCenterURL} -k=true -h5=true -dc=${myDcName} ${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    const resultObject = JSON.parse(resultString);
    const myConsoleUrl = resultObject.output.replace('\n', '');
    // open console
    browser.url(myConsoleUrl);
    browser.pause(500);
    // deal with chrome warning
    try {
      bypassChromeWarning();
    } catch(e) {}
    browser.refresh();
    // take a peek and re-login if the console is disconnected
    var consoleScreenText = JSON.parse(screen_session.screenFindImage('Screen-60'))[0].text;
    while (myReopen || browser.$('a=Back to login screen').isExisting() || consoleScreenText.join(' ').includes('The console has been disconnected')) {
      myReopen = false;
      // open vSphere HTML5 ui, logout and re-login, in order to get a new session
      browser.url(`https://${myVCenterHost}/ui/`);
      try {
        loginVcenter();
      } catch(e) {
        logoutVcenter();
        loginVcenter();
      }
      browser.url(myConsoleUrl);
      browser.refresh();
      consoleScreenText = JSON.parse(screen_session.screenFindImage('Screen-60'))[0].text;
    }
  }
);

When(/^(?::vcenter: )?I (?:(re-))?open the SSH console to the VM "(.*)" inside esxi dc "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  function (reopen, vmName, dcName, userName, passWord, consoleName) {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myUserName = parseExpectedText(userName);
    const myPassWord = parseExpectedText(passWord);
    const myConsoleName = parseExpectedText(consoleName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    // retrieve ssh IP address
    const govcCmd = 'vm.ip';
    const cmdString = `govc ${govcCmd} -u=${myVCenterURL} -k=true -dc=${myDcName} ${myVmName}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    const resultObject = JSON.parse(resultString);
    const mySshHost = resultObject.output.replace('\n', '');
    console.log(`ssh: ${myUserName}@${mySshHost}`);
    if (this.myConsoleData && this.myConsoleData[myConsoleName] && reopen) this.myConsoleData[myConsoleName].kill('SIGHUP');
    var [myConsole, myConsoleData] = cmdline_session.remoteConsole(`${myUserName}@${mySshHost}`, 22, myPassWord);
    this.myConsoles = {};
    this.myConsoles[myConsoleName] = myConsole;
    this.myConsoleData = {};
    this.myConsoleData[myConsoleName] = myConsoleData;
  }
);

When(/^(?::vcenter: )?I use the OVA URL to deploy an VM with config below:$/,
  { timeout: 60 * 60 * 1000 },
  (table) => {
    const config = table.rowsHash();
    const myDataCenter = parseExpectedText(config.dcName);
    const myHostIP = parseExpectedText(config.esxiHost);
    const myDataStore = parseExpectedText(config.dataStore);
    const myVmName = parseExpectedText(config.vmName);
    const myOptionFile = parseExpectedText(config.optionFile);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    let myEsxiHost = process.env.myClusterIP ? process.env.myClusterIP : myHostIP;
    const myPool = `/${myDataCenter}/host/${myEsxiHost}/Resources`;
    const myTargetOvaUrl = process.env.myTargetOvaUrl;

    const cmdString = `time govc import.ova -options=${process.env.PROJECTRUNPATH}/e2e-test/testfiles/${myOptionFile} -u=${myVCenterURL} -k=true -dc=${myDataCenter} -ds=${myDataStore} -pool=${myPool} -name=${myVmName} ${myTargetOvaUrl}`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    try {
      browser_session.displayMessage(browser, resultString);
    } catch(e) {
      /* no-op */
    }
    expect(JSON.parse(resultString).exitcode).toBe(0);
  }
);
