const cmdline_session = require(process.env.FrameworkPath + '/framework/libs/cmdline_session.js');
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');
const screen_session = require(process.env.FrameworkPath + '/framework/libs/screen_session.js');
const vcenter_session = require(process.env.FrameworkPath + '/framework/libs/vcenter_session.js');
const parseExpectedText = require(process.env.FrameworkPath + '/framework/step_functions/common/parseExpectedText.js');
const path = require('path');

const { When } = require('cucumber');

When(/^(?::vcenter: )?I change the VM with config below:$/,
  { timeout: 15 * 60 * 1000 },
  (table) => {
    // process config table
    const config = table.rowsHash();
    const myVmName = parseExpectedText(config.vmName);
    const myDcName = parseExpectedText(config.dcName);
    const myCpuCount = parseExpectedText(config.cpuCount);
    const myMemSize = parseExpectedText(config.memSize);
    const myMemLimit = parseExpectedText(config.memLimit);
    const myMemReservation = parseExpectedText(config.memReservation);
    const myMemShares = parseExpectedText(config.memShares);
    // TODO: to add other govc vm.change supported parms

    // construct command paramaters
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const parmVCenterURL = `-u="${myVCenterURL}"`;
    const parmVmName = `-vm="${myVmName}"`;
    const parmDcName = `-dc="${myDcName}"`;
    const parmCpuCount = myCpuCount ? `-c=${myCpuCount}` : '';
    const parmMemSize = myMemSize ? `-m=${myMemSize}` : '';
    const parmMemLimit = myMemLimit ? `-mem.limit=${myMemLimit}` : '';
    const parmMemReservation = myMemReservation ? `-mem.reservation=${myMemReservation}` : '';
    const parmMemShares = myMemShares ? `-mem.shares=${myMemShares}` : '';

    const cmdString = `govc vm.change -cpu-hot-add-enabled -memory-hot-add-enabled -latency=high ${parmCpuCount} ${parmMemSize} ${parmMemLimit} ${parmMemReservation} ${parmMemShares} ${parmVCenterURL} -k=true ${parmDcName} ${parmVmName}`;
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
    const cmdString = `govc ${govcCmd} -u="${myVCenterURL}" -k=true -dc="${myDcName}" -vm="${myVmName}" -net "${myNetName}" "${myNicName}"`;
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

When(/^(?::vcenter: )?I (power on|power off|destroy) the VM "(.*)" inside esxi dc "(.*)"$/,
  (esxiCmd, vmName, dcName) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const myFindVmCmd = `govc find -u="${myVCenterURL}" -k=true -dc="${myDcName}" -name "${myVmName}"`;
    console.log(myFindVmCmd);
    const myFindVmResult = cmdline_session.runCmd(myFindVmCmd);
    browser_session.displayMessage(browser, myFindVmResult);
    const myResultList = JSON.parse(myFindVmResult).output.split('\n').filter(e => e);
    console.log(myResultList);
    if (myResultList.length == 0) {
      console.log('no VM found, action is not needed.');
    } else if (myResultList.length > 1) {
      throw new Error('found multiple targets, action cannot be performed');
    } else {
      // action block
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
      const vmActionCmdString = `govc ${govcCmd} -u="${myVCenterURL}" -k=true -dc="${myDcName}" "${myResultList[0]}"`;
      console.log(vmActionCmdString);
      const vmActionResultString = cmdline_session.runCmd(vmActionCmdString);
      browser_session.displayMessage(browser, vmActionResultString);
      const exitCode = JSON.parse(vmActionResultString).exitcode;
      if (exitCode == 0) {
        console.log('action is accepted, waiting 30 seconds...');
        browser.pause(3000);
      } else {
        console.log('action is not needed');
      }  
    }
  }
);

When(/^(?::vcenter: )?I (?:(re-))?open the HTML5 console to the VM "(.*)" inside esxi dc "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  (reopen, vmName, dcName) => {
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myReopen = reopen || false;
    const govcCmd = 'vm.console';
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;

    // get VM console URL
    const cmdString = `govc ${govcCmd} -u="${myVCenterURL}" -k=true -h5=true -dc="${myDcName}" "${myVmName}"`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    const resultObject = JSON.parse(resultString);
    const myConsoleUrl = resultObject.output.replace('\n', '&numMksConnections=0&locale=en-US');
    console.log(`updated console url: ${myConsoleUrl}`);
    // re-login if re-open
    if (myReopen) {
      vcenter_session.reLoginVcenter(browser, myVCenterURL);
    } else {
      vcenter_session.loginVcenter(browser, myVCenterURL);
    }
    // open VM console
    try {
      browser.url(myConsoleUrl);
    } catch(e) {
      vcenter_session.reLoginVcenter(browser, myVCenterURL);
      browser.url(myConsoleUrl);
    }
    browser.pause(3000);
    var consoleScreenText = JSON.parse(screen_session.screenFindImage('Screen-60'))[0].text;
    let loopCount = 3;
    // take a peek and re-login if the console is disconnected
    while (loopCount > 0 && (browser.$('a=Back to login screen').isExisting() || consoleScreenText.length == 0 || consoleScreenText.join(' ').includes('The console has been disconnected'))) {
      loopCount--;
      // open vSphere HTML5 ui, logout and re-login, in order to get a new session
      vcenter_session.reLoginVcenter(browser, myVCenterURL);
      browser.url(myConsoleUrl);
      browser.pause(3000);
      consoleScreenText = JSON.parse(screen_session.screenFindImage('Screen-60'))[0].text;
    }
  }
);

When(/^(?::vcenter: )?I (?:(re-))?open the SSH console to the VM "(.*)" inside esxi dc "(.*)" with username "(.*)" and password "(.*)" as "(.*)"$/,
  { timeout: 15 * 60 * 1000 },
  function (reopen, vmName, dcName, userName, passWord, consoleName) {
    const myReopen = reopen || false;
    const myVmName = parseExpectedText(vmName);
    const myDcName = parseExpectedText(dcName);
    const myUserName = parseExpectedText(userName);
    const myPassWord = parseExpectedText(passWord);
    const myConsoleName = parseExpectedText(consoleName);
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    // retrieve ssh IP address
    const govcCmd = 'vm.ip';
    const cmdString = `govc ${govcCmd} -u="${myVCenterURL}" -k=true -dc="${myDcName}" "${myVmName}"`;
    console.log(cmdString);
    const resultString = cmdline_session.runCmd(cmdString);
    const resultObject = JSON.parse(resultString);
    const mySshHost = resultObject.output.replace('\n', '');
    console.log(`ssh: ${myUserName}@${mySshHost}`);
    if (this.myConsoleData && this.myConsoleData[myConsoleName] && myReopen) this.myConsoleData[myConsoleName].kill('SIGHUP');
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
    const myDcName = parseExpectedText(config.dcName);
    const myEsxiHost = parseExpectedText(config.esxiHost);
    const myDataStore = parseExpectedText(config.dataStore);
    const myVmName = parseExpectedText(config.vmName);
    const myOptionFile = parseExpectedText(config.optionFile);
    const myPool = parseExpectedText(config.dcResourcePath).trim().length > 0 ? parseExpectedText(config.dcResourcePath) : `/${myDcName}/host/${myEsxiHost}/Resources`;
    const myVCenterURL = process.env.myVCenterURL || process.env.vCenterURL;
    const myTargetOvaUrl = process.env.myTargetOvaUrl;

    const cmdString = `time govc import.ova -options="${process.env.PROJECTRUNPATH}/${process.env.TestDir}/testfiles/${myOptionFile}" -u="${myVCenterURL}" -k=true -dc="${myDcName}" -ds="${myDataStore}" -pool="${myPool}" -name="${myVmName}" "${myTargetOvaUrl}"`;
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
