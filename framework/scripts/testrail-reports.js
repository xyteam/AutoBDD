#!/usr/bin/env node

const buildOptions = require('minimist-options');
const JSON5 = require('json5');
const minimist = require('minimist');
const Testrail = require('testrail-api');
const testrail_lib = require('../libs/testrail_libs');
const jsonfile = require('jsonfile');
const _ = require ('underscore');

const options = buildOptions({
    // Special Parameters
    apiUrl: {
		type: 'string',
		default: process.env.trApiUrl
    },
    apiUser: {
		type: 'string',
		default: process.env.trApiUser
    },
    apiPassword: {
		type: 'string',
		default: process.env.trApiKey
    },
    // Cucumber Parameters
    cbJsonPath: {
        type: 'string'
    },
    // API parameters
    trCaseId: {
		type: 'number'
    },
	trCmd: {
		type: 'string',
		default: 'getProjects'
    },
    trFilter: {
        type: 'string',
        default: ''
    },
    trMilestoneId: {
		type: 'number'
    },
	trProjectId: {
		type: 'number',
		default: 63 // QA Playground
    },
    trRunId: {
		type: 'number'
    },
    trSectionId: {
		type: 'number'
    },
    trSuiteId: {
		type: 'number'
    },
    trSuiteName: {
		type: 'string'
    },
    trUserEmail: {
		type: 'string'
    },
    trUserId: {
		type: 'number'
    },
    trForceAdd: {
        type: 'boolean',
        default: true
    },
	// Special option for positional arguments (`_` in minimist)
	arguments: 'string'
});

const args = minimist(process.argv.slice(2), options);
const trFilter = JSON5.parse('{' + args.trFilter + '}');

var testrail = new Testrail({
    host: args.apiUrl,
    user: args.apiUser,
    password: args.apiPassword,
});

switch (args.trCmd) {
    case 'getCase':
    case 'getCaseById':
        testrail.getCase(/*CASE_ID=*/args.trCaseId, function (err, response, testcase) {
            console.log(testcase);
        });
        break;
    case 'getCases':
        testrail.getCases(/*PROJECT_ID=*/args.trProjectId, /*FILTERS=*/trFilter, function (err, response, cases) {
            console.log(cases);
        });
        break;
    case 'getProjects':
        testrail.getProjects(/*FILTERS=*/trFilter, function (err, response, projects) {
            console.log(projects);
        });
        break;
    case 'getProject':
        testrail.getProject(/*PROJECT_ID=*/args.trProjectId, function (err, response, project) {
            console.log(project);
        });
        break;
    case 'getMilestones':
        testrail.getMilestones(/*PROJECT_ID=*/args.trProjectId, /*FILTERS=*/trFilter, function (err, response, milestones) {
            console.log(milestones);
        });      
        break;
    case 'getMilestone':
        testrail.getMilestone(/*MILESTONE_ID=*/args.trMilestoneId, function (err, response, milestone) {
            console.log(milestone);
        });
        break;
    case 'deleteMilestone':
        testrail.deleteMilestone(/*MILESTONE_ID=*/args.trMilestoneId, function (err, response, body) {
            console.log(body);
        });
        break;    
    case 'getRuns':
        testrail.getRuns(/*PROJECT_ID=*/args.trProjectId, /*FILTERS=*/trFilter, function (err, response, runs) {
            console.log(runs)
        });
        break;
    case 'getRun':
        testrail.getRun(/*RUN_ID=*/args.trRunId, function (err, response, run) {
            console.log(run);
        });
        break;
    case 'getSections':
    case 'getFeatures':
        testrail.getSections(/*PROJECT_ID=*/args.trProjectId, /*SUITE_ID=*/args.trSuiteId, function (err, response, sections) {
            console.log(sections)
        });
        break;
    case 'getSection':
    case 'getFeature':
        testrail.getSection(/*SECTION_ID=*/args.trSectionId, function (err, response, section) {
            console.log(section);
        });
        break;
    case 'getSuites':
    case 'getModules':
        testrail.getSuites(/*PROJECT_ID=*/args.trProjectId, function (err, response, suites) {
            console.log(suites);    
        });
        break;
    case 'getSuite':
    case 'getModule':
        testrail.getSuite(/*SUITE_ID=*/args.trSuiteId, function (err, response, suite) {
            console.log(suite);
        });
        break;
    case 'getSuiteByName':
    case 'getModuleByName':
        testrail_lib.getSuiteId_byName(args.trProjectId, args.trSuiteName).then(suiteId => {
            testrail.getSuite(/*SUITE_ID=*/suiteId, function (err, response, suite) {
                console.log(suite);
            });
        });
        break;
    case 'getUsers':
        testrail.getUsers(/*FILTERS=*/trFilter, function (err, response, users) {
            console.log(users);
        });
        break;
    case 'getUserById':
        testrail.getUser(/*USER_ID=*/args.trUserId, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'getUserByEmail':
        testrail.getUserByEmail(/*EMAIL=*/args.trUserEmail, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'addSuite':
    case 'addModule':
        testrail_lib.addSuite_byName(args.trProjectId, args.trSuiteName).then(addedSuite => {
            console.log(addedSuite);
        })
        break;
    case 'addSection':
    case 'addFeature':
        if (!args.trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!args.trSuiteName) {
            console.log('trSuiteName is required');
            break;
        }
        testrail_lib.addSection_byName(args.trProjectId, args.trSuiteName, args.trSuiteName).then(mySection => {
            console.log(mySection.name);
        });
        break;
    case 'cbAddCases':
        if (!args.trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!args.cbJsonPath) {
            console.log('cbJsonPath is required');
            break;
        }
        const cbJson = jsonfile.readFileSync(args.cbJsonPath);
        const mySuiteName = args.cbJsonPath.substring(args.cbJsonPath.lastIndexOf('/')+1, args.cbJsonPath.lastIndexOf('.'));
        testrail_lib.getSuiteId_byName(args.trProjectId, mySuiteName, /*forceAdd*/args.trForceAdd).then(suiteId => {
            cbJson.forEach(feature => {
                var myFeature = {
                    name: feature.keyword + ': ' + feature.name,
                    suite_id: suiteId,
                    description: feature.description
                };
                testrail_lib.getSectionId_byName(/*PROJECT_ID=*/args.trProjectId, mySuiteName, myFeature.name, /*forceAdd*/args.trForceAdd).then(sectionId => {  
                    feature.elements.forEach(scenario => {
                        testrail_lib.getCaseId_byScenarios(args.trProjectId, mySuiteName, myFeature.name, feature, scenario, /*forceAdd*/args.trForceAdd).then(myCaseId => {
                            console.log(myCaseId);
                        });
                    });                    
                });
            })
        });
        break;
    case 'DeleteSections':
        //use for testing only
        testrail_lib.getSuiteId_byName ( 63, args.trSuiteName ).then ( suiteid => {
            console.log ( "FOUND SUITE : " + suiteid)
            testrail.getSections(/*PROJECT_ID=*/ 63, /*suite-id*/ suiteid , function (err, response, sections) {
                sections.forEach ( sec => {
                    console.log ( "Deleting section => " + sec.name )
                    testrail.deleteSection ( sec.id );
                })
            });            
        })
        break;

    case 'updateTestCase':
        if (!args.trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!args.cbJsonPath) {
            console.log('JSON Path is required');
            break;
        }
        
        var testInJson = [];
        const cbJsonUpdate = jsonfile.readFileSync (args.cbJsonPath);
        cbJsonUpdate.forEach(feature => {
            feature.elements.filter ( s => (s.type === 'scenario')).forEach ( s => {
                testInJson.push ( s.name );
            })
        })

        testrail.getCases(/*PROJECT_ID=*/args.trProjectId, /*FILTERS=*/trFilter, function (err, response, cases) {
            cases.forEach (trCase => {
                //if testcase in TR found in cbJsonUpdate
                if ( _.contains(testInJson, trCase.title)){
                    console.log ( "\n >> Updating test case : " + trCase.id + '-' + trCase.title)
                    var targetFeature = testrail_lib.getFeature_ByScenario ( trCase.title , cbJsonUpdate );
                    var bgSteps = testrail_lib.extractSteps ( targetFeature , "background" );
                    var testSteps = testrail_lib.extractSteps (targetFeature , "scenario" , trCase.title );
                    var updatedContent = {
                        custom_preconds:  bgSteps,
                        custom_bdd_scenario: testSteps
                    }
                    console.log ( updatedContent );
                    // testrail.updateCase(/*CASE_ID=*/trCase.id, /*CONTENT=*/updatedContent, function (err, response, testcase) {
                    //     console.log(testcase);
                    // });
                }
            })
        });
        break;
}
