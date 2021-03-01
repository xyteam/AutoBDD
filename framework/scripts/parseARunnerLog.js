#!/usr/bin/env node

const stripAnsi = require('strip-ansi');
const fs = require('fs');
const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);

// parse log file into feature file array
const logArray = fs.readFileSync('arunner.log', 'utf8').split('\n');
var runLogArray = [];
var runLogIndex = 0;
runLogArray[runLogIndex] = [];
var specReportArray = [];
var specReportIndex = 0;
specReportArray[specReportIndex] = [];
var arraySwitch;
logArray.forEach(line => {
    // [0-0] RUNNING in
    if (line.includes('[0-0] RUNNING in')) {
        arraySwitch = 'runLogArray';
    }
    // RUNNING in chrome - test-autobdd-lib/features/test_envs.feature
    if (arraySwitch == 'runLogArray' && line.includes('RUNNING in') && line.endsWith('.feature')) {
        runLogIndex ++;
        runLogArray[runLogIndex] = [];
    }
    // "spec" Reporter:
    if (line.includes('"spec" Reporter:')) {
        arraySwitch = 'specReportArray';
    }
    if (arraySwitch == 'specReportArray' && line.includes('------------------------------------------------------------------')) {
        specReportIndex ++;
        specReportArray[specReportIndex] = [];
    }
    switch(arraySwitch) {
        case 'runLogArray':
            runLogArray[runLogIndex].push(line);
            break;
        case 'specReportArray':
            specReportArray[specReportIndex].push(line);
            break;
    }
})

// print feature file array
var featurePath, testModulePath, testFeaturePath;
for (index = 1; index <= runLogIndex; index++) {
    featurePath = runLogArray[index][0].split(' - ')[1];
    [testModulePath, testFeaturePath] = featurePath.split('/features/');
    if (testModulePath == '') testModulePath = './';
    testFeaturePath = testFeaturePath.replace('/', '_');
    if (!fs.existsSync(testModulePath)) fs.mkdirSync(testModulePath);
    fs.writeFileSync(`${testModulePath}/${testFeaturePath}.log`, stripAnsi(runLogArray[index].concat(specReportArray[index]).join('\n')));
    cmdline_session.runCmd(`cat ${testModulePath}/${testFeaturePath}.log | ansi2html > ${testModulePath}/${testFeaturePath}.log.html`);
}
