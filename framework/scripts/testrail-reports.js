#!/usr/bin/env node

const buildOptions = require('minimist-options');
const minimist = require('minimist');
const Testrail = require('testrail-api');
const testrail_lib = require('../libs/testrail_libs');
const jsonfile = require('jsonfile');
const trUser = process.env.cbReportUser;
const trKey = process.env.cbReportKey;

const options = buildOptions({
	trUrl: {
		type: 'string',
		alias: ['trUrl', 'U'],
		default: 'http://testrail.cadreon.com/testrail'
    },
    trUser: {
		type: 'string',
		alias: ['trUser', 'u'],
		default: trUser
    },
	trPassword: {
		type: 'string',
		alias: ['trPassword', 'p'],
		default: trKey
	},
	trCmd: {
		type: 'string',
		alias: ['trCmd', 'C'],
		default: 'getProjects'
	},
	trProjectId: {
		type: 'number',
		alias: ['trProjectId', 'P'],
		default: 63
    },
    trSectionId: {
		type: 'number',
        alias: ['trSectionId', 'S'],
    },
    trSuiteId: {
		type: 'number',
		alias: ['trSuiteId', 's'],
    },
    trSuiteName: {
		type: 'string',
    },
    trRunId: {
		type: 'number',
		alias: ['trRunId', 'R'],
    },
    trUserId: {
		type: 'number',
		alias: ['trUserId', 'uid'],
		default: 1
    },
    trUserEmail: {
		type: 'string',
		alias: ['trUserEmail', 'E'],
		default: ''
    },
    trCaseId: {
		type: 'number',
    },
    trFilter: {
		type: 'string',
		alias: ['trFilter', 'f'],
		default: ''
    },
    cbJsonPath: {
        type: 'string'
    },
	// Special option for positional arguments (`_` in minimist)
	arguments: 'string'
});

const args = minimist(process.argv.slice(2), options);

var testrail = new Testrail({
    host: args.trUrl,
    user: args.trUser,
    password: args.trPassword,
});

switch (args.trCmd) {
    case 'getCaseById':
        testrail.getCase(/*CASE_ID=*/args.trCaseId, function (err, response, testcase) {
            console.log(testcase);
        });
        break;
    case 'getProjects':
        testrail.getProjects(/*FILTERS=*/{}, function (err, response, projects) {
            if (args.trFilter) {
                console.log(args.trFilter)
                console.log(projects.filter(project => eval(args.trFilter)));    
            } else {
                console.log(projects);    
            }
            // console.log(args.trUser);
            // console.log(args.trPassword);
            // console.log(err);
            // console.log(response);
        });
        break;
    case 'getProject':
        testrail.getProject(/*PROJECT_ID=*/args.trProjectId, function (err, response, project) {
            console.log(project);
            // console.log(err);
            // console.log(response);
        });
        break;
    case 'getRuns':
        testrail.getRuns(/*PROJECT_ID=*/args.trProjectId, /*FILTERS=*/{}, function (err, response, runs) {
            if (args.trFilter) {
                console.log(args.trFilter)
                console.log(runs.filter(run => eval(args.trFilter)));    
            } else {
                console.log(runs);    
            }
        });
        break;
    case 'getRun':
        testrail.getRun(/*RUN_ID=*/args.trRunId, function (err, response, run) {
            console.log(run);
        });
        break;
    case 'getSections':
        testrail.getSections(/*PROJECT_ID=*/args.trProjectId, /*SUITE_ID=*/args.trSuiteId, function (err, response, sections) {
            if (args.trFilter) {
                console.log(args.trFilter)
                console.log(sections.filter(section => eval(args.trFilter)));    
            } else {
                console.log(sections);    
            }
        });
        break;
    case 'getSection':
        testrail.getSection(/*SECTION_ID=*/args.trSectionId, function (err, response, section) {
            console.log(section);
        });
        break;
    case 'getSuites':
        testrail.getSuites(/*PROJECT_ID=*/args.trProjectId, function (err, response, suites) {
            if (args.trFilter) {
                console.log(args.trFilter)
                console.log(suites.filter(suite => eval(args.trFilter)));    
            } else {
                console.log(suites);    
            }
        });
        break;
    case 'getSuite':
        testrail.getSuite(/*SUITE_ID=*/args.trSuiteId, function (err, response, suite) {
            console.log(suite);
        });
        break;
    case 'getUsers':
        testrail.getUsers(/*FILTERS=*/{}, function (err, response, users) {
            console.log(users);
        });
        break;
    case 'getUser':
        testrail.getUser(/*USER_ID=*/args.trUserId, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'getUserByEmail':
        testrail.getUserByEmail(/*EMAIL=*/args.trUserEmail, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'addSuiteByName':
        var mySuite = {
            name: args.trSuiteName,
            description: args.trSuiteDesc
        };
        testrail_lib.getProjectName_byId(args.trProjectId).then(projectName => {
            mySuite.description = 'For ' + projectName + ' project'; 
            testrail.addSuite(/*PROJECT_ID=*/args.trProjectId, /*CONTENT=*/mySuite).then(response => {
                console.log(response.body);
            });
        });
        break;
    case 'addFeature':
        testrail_lib.getSuiteId_byName(args.trProjectId, args.trSuiteName).then(suiteId => {
            var myFeature = {
                name: args.featureName,
                suite_id: suiteId
            };    
            testrail.addSection(/*PROJECT_ID=*/args.trProjectId, /*CONTENT=*/myFeature).then(response => {
                console.log(response.body);
            });
        });
        break;
    
}
