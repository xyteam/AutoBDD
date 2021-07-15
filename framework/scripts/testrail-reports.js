#!/usr/bin/env node

const JSON5 = require('json5');
const Testrail = require('testrail-api');
const jsonfile = require('jsonfile');
const Bottleneck = require('bottleneck');
const testrail_lib = require('../libs/testrail_libs');
const _ = require ('underscore');
const args = require('args-parser')(process.argv);

//TODO: improve help message
optionHelp = `
    Usage
        $ testrail-reports --optionName=optionValue
    Options
        --trApiUrl, testrail API Url, default = process.env.trApiUrl
        --trApiUrl, testrail API User, default = process.env.trApiUser
        --trApiUrl, testrail API Key, default = process.env.trApiKey
        --trCmd, testrail API Command, http://docs.gurock.com/testrail-api2/start, default = getProjects
`;

// Special Parameters
const trApiUrl = args.trApiUrl;
const trApiUser = args.trApiUser;
const trApiKey = args.trApiKey;
const trCmd = args.trCmd || 'getProjects';
// Cucumber Parameters
const cbJsonPath = args.cbJsonPath;
// API parameters
const trCaseId = args.trCaseId || 0;
const trFilter = args.trFilter || '';
const trMilestoneId = args.trMilestoneId || 0;
const trProjectId = args.trProjectId || 0;
const trRunId = args.trRunId || 0;
const trSectionId = args.trSectionId || 0;
const trSuiteId = args.trSuiteId || 0;
const trSuiteName = args.trSuiteName;
const trUserEmail = args.trUserEmail;
const trUserId = args.trUserId || 0;
const trForceAdd = args.trForceAdd || false;
const trForceUpdate = args.trForceUpdate || false;
const trSprintId = args.trSprintId || 0;
const trTestTarget = args.trTestTarget || 'Stage';
const trTestrunId = args.trTestrunId || 0;
const trJenkinsPath = args.trJenkinsPath || '';
const trUpdateInBulk = args.trUpdateInBulk || true;
const trThrottle = args.trThrottle || 333;
const trFilter = JSON5.parse('{' + trFilter + '}');
const cbJson = (cbJsonPath) ? jsonfile.readFileSync(cbJsonPath) : null;

// prepare to throttle API request
// testrail API limites 180 requeset per minutes
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: parseInt(trThrottle)
});

var testrail = new Testrail({
    host: trApiUrl || process.env.trApiUrl,
    user: trApiUser || process.env.trApiUser,
    password: trApiKey || process.env.trApiKey
});

switch (trCmd) {
    case 'getCase':
    case 'getCaseById':
    console.log ( "get case")
        testrail.getCase(/*CASE_ID=*/trCaseId, function (err, response, testcase) {
            console.log(testcase);
        });
        break;
    case 'getCases':
        testrail.getCases(/*PROJECT_ID=*/trProjectId, /*FILTERS=*/trFilter, function (err, response, cases) {
            console.log(cases);
        });
        break;
    case 'getProjects':
        testrail.getProjects(/*FILTERS=*/trFilter, function (err, response, projects) {
            console.log(projects);
            // console.log(response);
        });
        break;
    case 'getProject':
        testrail.getProject(/*PROJECT_ID=*/trProjectId, function (err, response, project) {
            console.log(project);
        });
        break;
    case 'getMilestones':
        testrail.getMilestones(/*PROJECT_ID=*/trProjectId, /*FILTERS=*/trFilter, function (err, response, milestones) {
            console.log(milestones);
        });      
        break;
    case 'getMilestone':
        testrail.getMilestone(/*MILESTONE_ID=*/trMilestoneId, function (err, response, milestone) {
            console.log(milestone);
        });
        break;
    case 'deleteMilestone':
        testrail.deleteMilestone(/*MILESTONE_ID=*/trMilestoneId, function (err, response, body) {
            console.log(body);
        });
        break;    
    case 'getRuns':
        testrail.getRuns(/*PROJECT_ID=*/trProjectId, /*FILTERS=*/trFilter, function (err, response, runs) {
            console.log(runs)
        });
        break;
    case 'getRun':
        testrail.getRun(/*RUN_ID=*/trRunId, function (err, response, run) {
            console.log(run);
        });
        break;
    case 'getResultsForRun' :
        testrail.getResultsForRun(/*RUN_ID=*/trRunId, /*FILTERS=*/trFilter, function (err, response, results) {
            console.log(results);
        });
        break;
    case "getResultsForCase":
        testrail.getResultsForCase(/*RUN_ID=*/trRunId, /*CASE_ID=*/trCaseId, /*FILTERS=*/trFilter, function (err, response, results) {
            console.log(results);
        });
        break;
    case "getResults_ByTestId" :
        testrail.getResults(/*TEST_ID=*/trTestId, /*FILTERS=*/trFilter, function (err, response, results) {
            console.log(results);
        });
        break;        
    case 'getSections':
    case 'getFeatures':
        testrail.getSections(/*PROJECT_ID=*/trProjectId, /*SUITE_ID=*/trSuiteId, function (err, response, sections) {
            console.log(sections)
        });
        break;
    case 'getSection':
    case 'getFeature':
        testrail.getSection(/*SECTION_ID=*/trSectionId, function (err, response, section) {
            console.log(section);
        });
        break;
    case 'getSuites':
    case 'getModules':
        testrail.getSuites(/*PROJECT_ID=*/trProjectId, function (err, response, suites) {
            console.log(suites);    
        });
        break;
    case 'getSuite':
    case 'getModule':
        testrail.getSuite(/*SUITE_ID=*/trSuiteId, function (err, response, suite) {
            console.log(suite);
        });
        break;
    case 'getSuiteByName':
    case 'getModuleByName':    
        testrail_lib.getSuiteId_byName(trProjectId, trSuiteName).then(suiteId => {
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
        testrail.getUser(/*USER_ID=*/trUserId, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'getUserByEmail':
        testrail.getUserByEmail(/*EMAIL=*/trUserEmail, function (err, response, user) {
            console.log(user);
        });
        break;
    case 'addSuite':
    case 'addModule':
        testrail_lib.addSuite_byName(trProjectId, trSuiteName).then(addedSuite => {
            console.log(addedSuite);
        })
        break;
    case 'addSection':
    case 'addFeature':
        if (!trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!trSuiteName) {
            console.log('trSuiteName is required');
            break;
        }
        testrail_lib.addSection_byName(trProjectId, trSuiteName, trSuiteName).then(mySection => {
            console.log(mySection.name);
        });
        break;
    case 'cbPretestCheck' :
        if (!cbJsonPath) {
            console.log('cbJsonPath is required');
            break;
        }   
        testrail_lib.getPretestStatus(cbJsonPretest)
        .then( result => {
            console.log ("No issue detected in the JSON result. All good!")
        }).catch ( preTestError  => {                
            console.error ( preTestError );
        }); 
        break;
    case 'cbAddCases':
    /*Input: 
    [Required: trProjectId, cbJsonPath]
    [Optional: trForceAdd(false), trForceUpdate(false)]*/
        if (!trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!cbJsonPath) {
            console.log('cbJsonPath is required');
            break;
        }
        // Create suite if not exist
        var suiteNames = Array.from(testrail_lib.getSuiteNames_byResultJson(cbJson));
        suiteNames.forEach(suiteName => {
            testrail_lib.getSuiteId_byName(trProjectId, suiteName, trForceAdd).then(suiteId => {
                // Add case by cbJson result file
                cbJson.forEach(feature => {
                    if (feature.uri.indexOf('/' + suiteName + '/') >= 0) {
                        var myFeature = {
                            name: testrail_lib.getGeneratedSectionName (feature),
                            suite_id: suiteId,
                            description: feature.description           
                        };
                        // throttle per feature API request
                        limiter.schedule(() => testrail_lib.getSectionId_byName(/*PROJECT_ID=*/trProjectId, suiteName, myFeature.name, myFeature, /*forceAdd*/trForceAdd, /*forceUpdate*/trForceUpdate)
                        .then(sectionId => (async () => {
                            for (var index = 0; index < feature.elements.length; index++) {
                                scenario = feature.elements[index];
                                await testrail_lib.getCaseId_byScenario(trProjectId, suiteName, myFeature.name, feature, scenario, /*forceAdd*/trForceAdd, /*forceUpdate*/trForceUpdate)
                                .then(myCaseId => {
                                    if ( myCaseId != 0 ) console.log('   > trCaseId: ' + myCaseId);
                                }).catch (getCaseError => {
                                    console.error (getCaseError);
                                });
                            };
                        })()).catch (getSectionError => {
                            console.error (getSectionError);
                        })); // end throttle per feature API request block
                    }
                });
            })
        })
        break;
    
    case 'cbUpdateResults' :
    /*Input: 
    [Required: trProjectId, cbJsonPath]
    [Optional: trSprintId (auto), trForceAdd(false), trForceUpdate(false), trTestTarget(QA), trJenkinsPath]*/
        if (!trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!cbJsonPath) {
            console.log('cbJsonPath is required');
            break;
        }  
        testrail_lib.getMilestone_byProjectId(trProjectId, trSprintId , trForceAdd).then(milestoneId => {
            testrail_lib.getSuiteNames_byResultJson(cbJson).forEach(mySuiteName => {
                testrail_lib.getCaseDicts_bySuiteName ( trProjectId, mySuiteName, cbJson )
                .then ( caseDicts => {
                    testrail_lib.getTestRuns_byMilestoneId ( trProjectId, milestoneId , trSprintId , mySuiteName , caseDicts , trJenkinsPath, trForceAdd, trForceUpdate)
                    .then ( testRunId => {                
                        console.log ( "> Test Run ID : " + testRunId);
                        if ( trUpdateInBulk ) {
                            // throttle API request
                            limiter.schedule(() => testrail_lib.addTestResultInBulk( testRunId, cbJson, caseDicts, trTestTarget, trJenkinsPath))
                        } else {
                            // throttle API request
                            limiter.schedule(() => testrail_lib.addTestResultIndividually( testRunId, cbJson, caseDicts, trTestTarget, trJenkinsPath))
                        }                                                   
                    }).catch ( testrunError => {
                        console.error ( testrunError );
                    })
                }).catch ( caseDictError => {
                    console.error (caseDictError );
                });   
            });
        }).catch ( milestoneError => {
            console.error ( milestoneError );
        });  
        break;

    //@samplecode
    case 'xUpdateResultIndividually' :
    /*Input: 
    [Required: trProjectId, cbJsonPath]
    [Optional: trSprintId (auto), trForceAdd(false), trForceUpdate(false), trTestTarget(QA)]*/
        if (!trProjectId) {
            console.log('trProjectId is required');
            break;
        }
        if (!cbJsonPath) {
            console.log('cbJsonPath is required');
            break;
        }          
        testrail_lib.getSuiteNames_byResultJson(cbJson).forEach(mySuiteName => {
            testrail_lib.getCaseDicts_bySuiteName ( trProjectId, mySuiteName, cbJson )
            .then ( caseDicts => {
                cbJson.forEach(feature => {
                    var myFeature = {
                        name: testrail_lib.getGeneratedSectionName(feature)
                    };                            
                    feature.elements.forEach ( scenario => { 
                        testrail_lib.addTestResultIndividually ( testRunId, trProjectId, mySuiteName, myFeature.name, feature, scenario , false, trTestTarget)//.then( resp => {
                        console.log ( resp );
                    })
                testrail_lib.addTestResultInBulk ( trTestrunId, cbJsonUpdate, caseDicts, trTestTarget)
                })
            })
        })
        break;

    //@samplecode
    case 'xDeleteSections':
        //use for testing only
        testrail_lib.getSuiteId_byName (trProjectId, trSuiteName , false ).then ( suiteid => {
            console.log ( "FOUND SUITE : " + suiteid)
            testrail.getSections(/*PROJECT_ID=*/trProjectId, /*suite-id*/ suiteid , function (err, response, sections) {
                sections.forEach ( sec => {
                    console.log ( "Deleting section => " + sec.name )
                    testrail.deleteSection ( sec.id );
                })
            });            
        })
        break;

    //@samplecode
    case 'xDeleteSuites':
        //use for testing only
        testrail_lib.getSuiteId_byName (trProjectId, trSuiteName , false ).then ( suiteid => {
            console.log ( "FOUND SUITE : " + suiteid)
            console.log ( "Deleting suite => " + suiteid )
            testrail.deleteSuite ( suiteid );
            });            
        break;
    default:
        console.error ( "Unknown command \"" + trCmd + "\" provided to trCmd parameter. ");
        break;
}
