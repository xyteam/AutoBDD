#!/usr/bin/env node

const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);
const report = require('multiple-cucumber-html-reporter');
 
report.generate({
    jsonDir: '.',
    reportPath: '.',
    // metadata:{
    //     browser: {
    //         name: 'chrome',
    //         version: '84'
    //     },
    //     device: 'Local test machine',
    //     platform: {
    //         name: 'ubuntu',
    //         version: '20.04'
    //     }
    // },
    // customData: {
    //     title: 'UI e2e test report',
    //     data: [
    //         {label: 'Project', value: 'ui project'},
    //         {label: 'Release', value: '5.5'},
    //         {label: 'Cycle', value: 'sprint 8'},
    //         {label: 'Execution Start Time', value: 'Aug 27, 2020, 11:35 AM PDT'},
    //         {label: 'Execution End Time', value: 'Aug 27, 2020, 11:45 AM PDT'}
    //     ]
    // }
});

cmdline_session.runCmd('mv Passed_*.* Failed_*.* features/ 2>/dev/null');