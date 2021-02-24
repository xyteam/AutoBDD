#!/usr/bin/env node

const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);
const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
 
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
// create symbolic link to screenshot and movie
var itemList = fs.readdirSync('.');
// if there are folders create sym-links for folders
var dirList = itemList.filter(d => d != 'assets' && d != 'features' && fs.lstatSync('.' + '/' + d).isDirectory());
dirList.forEach(dirName => {
    try {
        fs.symlinkSync('../' + dirName, '.' + '/features/' + dirName)
    } catch (e) {
        console.log('cannot create symlink for feature reports: ' + dirName)
    }
})
// if there are logs, pictures and movies move them to features folder
var fileList = itemList.filter(f => f.endsWith('.log.html') || f.endsWith('.png') || f.endsWith('.mp4'));
fileList.forEach(fileName => {
    try {
        fs.renameSync(fileName, `features/${fileName}`)
    } catch (e) {
        console.log('cannot mv file to features/ folder: ' + fileName)
    }
})
