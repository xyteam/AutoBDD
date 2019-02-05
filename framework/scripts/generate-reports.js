#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const reporter = require('cucumber-html-reporter');

var report_on = process.argv[2]; 
var report_name = process.argv[3] || 'Project';
var report_brandTitle = process.argv[4] || 'Automation Report';
var report_platform = process.argv[5] || 'Linux';
var report_browser = process.argv[6] || 'CH';
var report_threads = process.argv[7] || '';
var report_startTime = process.argv[8] || '';
var report_runDuration = process.argv[9] || '';
var report_rerunPath = process.argv[10] || '';
var report_args = process.argv[11] || '';

var options = {
        launchReport: false,
        ignoreBadJsonFile: true,
        reportSuiteAsScenarios: false,
        metadata: {
            "Project": report_name,
            "Platform": report_platform,
            "Browser": report_browser,
            "Run Threads": report_threads,
            "Start Time": report_startTime,
            "Run Duration": report_runDuration,
            "Rerun Path": report_rerunPath,
            "Run Args": report_args
        }
    };

if (fs.lstatSync(report_on).isDirectory()) {
    options.jsonDir = report_on;
    options.theme = 'bootstrap';
    options.output = report_on + '/cucumber-report.html'
} else if (fs.lstatSync(report_on).isFile()) {
    options.jsonFile = report_on;
    options.theme = 'foundation';
    options.output = report_on + '.html';
} else {
    console.log('Reporter Error: 1st parameter need to be a jsonDir or jsonFile.');
    process.exit(1);
}

options.name = report_name;
options.brandTitle = report_brandTitle;
reporter.generate(options);
