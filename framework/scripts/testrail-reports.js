#!/usr/bin/env node

// framework/scripts/testrail-reports.js \
// --trUser=user_email --trPassword=user_password \
// --trCmd=getProjects\
// --trFilter="project.suite_mode==1 && project.name=='QA Playground'"

// framework/scripts/testrail-reports.js \
// --trUser=user_email --trPassword=user_password \
// --trCmd=getProject --trProjectId=63

var argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const Testrail = require('testrail-api');

const trUrl = argv.trUrl || 'http://testrail.cadreon.com/testrail';
const trUser = argv.trUser;
const trPassword = argv.trPassword;
const trCmd = argv.trCmd || 'getProjects';
const trProjectId = argv.trProjectId || 63;
const trSectionId = argv.trSectionId || 1916442;
const trSuiteId = argv.trSuiteId || 20657;
const trRunId = argv.trRunId || 26073;
const trUserId = argv.trRunId || 1;
const trUserEmail = argv.trRunId || '';
const trFilter = argv.trFilter || {};

var testrail = new Testrail({
    host: trUrl,
    user: trUser,
    password: trPassword,
});

switch (trCmd) {
    case 'getProjects':
        testrail.getProjects(/*FILTERS=*/{}, function (err, response, projects) {
            console.log(trFilter)
            console.log(projects.filter(project => eval(trFilter)));
            // console.log(err);
            // console.log(response);
        });
        break;
    case 'getProject':
        testrail.getProject(/*PROJECT_ID=*/trProjectId, function (err, response, project) {
            console.log(project);
            // console.log(err);
            // console.log(response);
        });
        break;
    case 'getRuns':
        testrail.getRuns(/*PROJECT_ID=*/trProjectId, /*FILTERS=*/{}, function (err, response, runs) {
            console.log(runs.filter(run => eval(trFilter)));
        });
        break;
    case 'getRun':
        testrail.getRun(/*RUN_ID=*/trRunId, function (err, response, run) {
            console.log(run);
        });
        break;
    case 'getSections':
        testrail.getSections(/*PROJECT_ID=*/trProjectId, /*FILTERS=*/{}, function (err, response, sections) {
            console.log(sections.filter(section => eval(trFilter)));
        });
        break;
    case 'getSection':
        testrail.getSection(/*SECTION_ID=*/trSectionId, function (err, response, section) {
            console.log(section);
        });
        break;
    case 'getSuites':
        testrail.getSuites(/*PROJECT_ID=*/trProjectId, function (err, response, suites) {
            console.log(suites.filter(suite => eval(trFilter)));
        });
        break;
    case 'getSuite':
        testrail.getSuite(/*SUITE_ID=*/trSuiteId, function (err, response, suite) {
            console.log(suite);
        });
        break;
    case 'getUsers':
        testrail.getUsers(/*FILTERS=*/{}, function (err, response, users) {
            console.log(users);
        });
        break;
    case 'getUser':
        testrail.getUser(/*USER_ID=*/trUserId, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'getUserByEmail':
        testrail.getUserByEmail(/*EMAIL=*/trUserEmail, function (err, response, user) {
            console.log(user);
        });
        break;
}
