#!/usr/bin/env node

const meow = require('meow');
const fs = require('fs');
const bootStrapHtmlReporter = require('cucumber-html-reporter');
const searchableHtmlReporter = require('multiple-cucumber-html-reporter');

optionHelp = `
    Usage
        $ generate-reports.js --optionName1=optionValue1, --optionName2=optionValue2 ...
    Options
        --reportType, there are 2 basic types: cucumber and searchable which can be combined.
            cucumber has 4 sub-types: cucumber-bootstrap, cucumber-hierarchy, cucumber-foundation and cucumber-simple.
        --reportJson, thejsonFile that contains the test result.
        --reportName, master name of the report, such as the name of the product or project.
        --reportTitle, purpose of the test, such as E2E Test, Demo Test.
        --testPlatform, the test platform
        --testPlatformVer, the test platform version
        --testDevice, the device this reported test is run on
        --testBrowser, the browser this reported test is run on
        --testBrowserVer, the browser version this reported test is run on
        --testThreads, the parallel test threads
        --testStartTime, the start timestamp
        --testRunDuration, how long it took to run the entire test
        --testRunnerArgs, the run arguments used for running the test, i.e., --modulelist moduleA module B, --tags @SmokeTest, etc. 
`;
optionFlags = {
    reportType: {
        type: 'string',
        default: 'searchable'
    },
    reportJson: {
        type: 'string',
        default: './cucumber-report.json'
    },
    reportName: {
        type: 'string',
        default: 'AutoBDD'
    },
    reportTitle: {
        type: 'string',
        default: 'AutoBDD Test Report'
    },
    testPlatform: {
        type: 'string',
        default: 'Linux'
    },
    testPlatformVer: {
        type: 'string',
        default: 'Ubuntu 20.04'
    },
    testDevice: {
        type: 'string',
        default: 'NA'
    },
    testBrowser: {
        type: 'string',
        default: 'Chrome'
    },
    testBrowserVer: {
        type: 'string'
    },
    testThreads: {
        type: 'string'
    },
    testStartTime: {
        type: 'string'
    },
    testRunDuration: {
        type: 'string'
    },
    testRerunPath: {
        type: 'string'
    },
    testRunnerArgs: {
        type: 'string'
    }
}

const cli = meow(optionHelp, {flags: optionFlags});
var reportType = cli.flags.reportType;
var reportJson = cli.flags.reportJson;
var reportName = cli.flags.reportName;
var reportTitle = cli.flags.reportTitle;
var testPlatform = cli.flags.testPlatform;
var testPlatformVer = cli.flags.testPlatformVer;
var testDevice = cli.flags.testDevice;
var testBrowser = cli.flags.testBrowser;
var testBrowserVer = cli.flags.testBrowserVer;
var testThreads = cli.flags.testThreads;
var testStartTime = cli.flags.testStartTime;
var testRunDuration = cli.flags.testRunDuration;
var testRunnerArgs = cli.flags.testRunnerArgs;

var bootStrapHtmlReporter_options = {
    launchReport: false,
    ignoreBadJsonFile: false,
    reportSuiteAsScenarios: false,
    metadata: {
        "Project": reportName,
        "Title": reportTitle,
        "Platform": testPlatform,
        "Device": testDevice,
        "Browser": testBrowser,
        "browserVersion": testBrowserVer,
        "Run Threads": testThreads,
        "Start Time": testStartTime,
        "Run Duration": testRunDuration,
        "Run Args": testRunnerArgs
    }
};

var searchableHtmlReporter_options = {
    metadata: {
        browser: {
            name: testBrowser,
            version: testBrowserVer
        },
        device: testDevice,
        platform: {
            name: testPlatform,
            version: testPlatformVer
        },
    },
    customData: {
        title: reportTitle,
        data: [
            {label: 'Run Threads', value: testThreads},
            {label: 'Start Time', value: testStartTime},
            {label: 'Run Duration', value: testRunDuration},
            {label: 'Run Args', value: testRunnerArgs}
        ]
    }    
};

if (fs.lstatSync(reportJson).isFile()) {
    if (reportType.includes('cucumber')) {
        //generate report preparation
        bootStrapHtmlReporter_options.jsonFile = reportJson;
        switch (true) {
            case reportType.includes('bootstrap'):
                bootStrapHtmlReporter_options.theme = 'bootstrap';
                break;
            case reportType.includes('hierarchy'):
                bootStrapHtmlReporter_options.theme = 'hierarchy';
                break;
            case reportType.includes('foundation'):
                bootStrapHtmlReporter_options.theme = 'foundation';
                break;
            case reportType.includes('simple'):
                bootStrapHtmlReporter_options.theme = 'simple';
                break;
            default:
                bootStrapHtmlReporter_options.theme = 'bootstrap';
                break;
        }
        bootStrapHtmlReporter_options.output = reportJson.substring(0, reportJson.lastIndexOf('.json')) + '.html';
        bootStrapHtmlReporter_options.name = reportName;
        bootStrapHtmlReporter_options.brandTitle = reportTitle;
        // generate report action
        bootStrapHtmlReporter.generate(bootStrapHtmlReporter_options);
    }
    if (reportType.includes('searchable')) {
        // generate searchable theme report
        searchableHtmlReporter_options.jsonDir = reportJson.match(/.*\//)[0];
        searchableHtmlReporter_options.reportPath = searchableHtmlReporter_options.jsonDir;
        searchableHtmlReporter_options.displayDuration = true;

        searchableHtmlReporter.generate(searchableHtmlReporter_options);
        // create symbolic link to screenshot and movie
        var itemList = fs.readdirSync(searchableHtmlReporter_options.jsonDir);
        var dirList = itemList.filter(n => n != 'assets' && n!= 'features' && fs.lstatSync(searchableHtmlReporter_options.jsonDir + '/' + n).isDirectory())
        dirList.forEach(dirName => {
            try {
                fs.symlinkSync('../' + dirName, searchableHtmlReporter_options.jsonDir + '/features/' + dirName)
            } catch (e) {
                console.log('cannot create symlink for feature reports: ' + dirName)
            }
        })
    }
} else {
    console.log('Reporter Error: jsonFile need to a cucumber jsonFile.');
    process.exit(1);
}

