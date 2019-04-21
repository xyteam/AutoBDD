const Testrail = require('testrail-api');
const _ = require('underscore');
const l = require('lodash');

const testrail = new Testrail({
  host: process.env.trApiUrl,
  user: process.env.trApiUser,
  password: process.env.trApiKey,
});

module.exports = {

  //================== NAME GENERATOR ==================

  getGeneratedSectionName: function (feature) {
    let sectionName = feature.keyword + ': ' + feature.uri.substring(feature.uri.lastIndexOf('/')+1, feature.uri.length) + ' || ' + feature.name;
    return sectionName.trim();
  },

  getGeneratedCaseName: function (scenario) {
    let caseName = scenario.keyword + ': ' + scenario.name;
    return caseName.trim();
  },

  getGeneratedMilestoneName: function (sprintId ) {
    if (sprintId == 0) { //auto-generated
      return "Sprint " + this.getCurrentSprintID() + " - Automated Regression";
    }
    return "Sprint " + sprintId + " - Automated Regression";
  },

  getGeneratedTestRunName: function (sprintId , suiteName, dayOffset) {
    var currentDate = new Date( Date.now() + (dayOffset * 864e5)).toJSON().slice(0,10).replace(/-/g,'/');
    if (sprintId == 0) { //auto-generated
      return "Sprint " + this.getCurrentSprintID() + " - " + suiteName + " Automated Regression " + currentDate;
    }
    return "Sprint " + sprintId + " - " + suiteName + " Automated Regression " + currentDate;
  },

  //================ PRE-TEST VALIDATOR ================

  getPretestStatus: async function ( cbJson ) {
    var scenarioNames = [];
    cbJson.forEach ( feature => {
      feature.elements.filter(s => s.type != 'background').forEach (scenario => {
          scenarioNames.push ( scenario.keyword + " - " + scenario.name );
      })
    })
    var duplicatedScenario = l.transform(l.countBy(scenarioNames), function(result, count, value) {
      if (count > 1 ) result.push(value);
    }, []);

    if ( duplicatedScenario.length > 0 ) {
      let err = `\n[Scenario-Name-Error] Duplicated scenario name detected!\n` + 
        `  > Possible resolutions:\n` +
        `    >> Ensure scenario outline has unique index/data appended to it as per the convention\n` +
        `    >> Ensure there is no duplicated scenario name in the same Module/Suite\n` +
        `\nDuplicated Scenarios below:\n`;
      err += duplicatedScenario.join('\n');
      throw err;    
    }
  },

  //========= TEST SUITES (MODULES) HANDLING ===========
  
  getSuiteId_byName: async function (projectId, suiteName, forceAdd) {
    var mySuite = await testrail.getSuites(projectId)
    .then(response => {
        const suites = response.body;
        const suite = suites.filter(s => s.name == suiteName);
        return suite[0];
    }).catch(err => {
        console.error('Testrail getSuites Error :', err);
    }) 
    if (mySuite == undefined && forceAdd == true) {
        console.log ( " > Create suite : " + suiteName );
        mySuite = await this.addSuite_byName(projectId, suiteName);
    } else if ( mySuite == undefined && forceAdd == false) {
        let err = `\n[Suite-Handling-Error] Test suite "${suiteName}" does not exist and NO request to add it.\n` +
                  `  > Possible resolution: Please supply "--trForceAdd true" to add the missing suite\n`;
        throw err;    
    }

    return mySuite.id;
  },

  addSuite_byName: async function (projectId, suiteName) {
    var myPreparedSuite = {
        name: suiteName,
        description: ''
    };
    var myAddedSuite;
    var projectName = await this.getProjectName_byId(projectId);
    myPreparedSuite.description = 'For ' + projectName + ' project';
    myAddedSuite = await testrail.addSuite(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedSuite).then(response => {
        return response.body;
    });
    return myAddedSuite;
  },

  //======== TEST SECTIONS (FEATURES) HANDLING =========

  getSectionId_byName: async function (projectId, suiteName, sectionName, featureData , forceAdd, forceUpdate) {
    const mySuiteId = await this.getSuiteId_byName(projectId, suiteName, forceAdd);
    var mySection = await testrail.getSections(projectId, mySuiteId).then(response => {
        const sections = response.body;
        const section = sections.filter(s => (s.name == sectionName));
        return section[0];
    }).catch(err => {
        console.error('Testrail getSections Error :', err);
    });
    if (mySection == undefined && forceAdd == true) {
        console.log ( " > Create section : " + sectionName );
        mySection = await this.addSection_byName(projectId, suiteName, sectionName, featureData);
    } else if (mySection == undefined && forceAdd == false) {
        let err = `\n[Section-Handling-Error] Test section "${sectionName}" under suite "${suiteName}" does not exist and no request to add it.\n` +
                  `  > Possible resolution: Please supply "--trForceAdd true" to add the missing section\n`;
        throw err;            
    } 
    return mySection.id;
  },

  addSection_byName: async function (projectId, suiteName, sectionName, featureData) {
    var mySection = await this.getSuiteId_byName(projectId, suiteName, /*forceAdd*/true).then(suiteId => {
        var myFeature = {
            name: sectionName,
            suite_id: suiteId,
            description: featureData.description
        };
        return testrail.addSection(/*PROJECT_ID=*/projectId, /*CONTENT=*/myFeature).then(response => {
            return response.body;
        });
    });
    return mySection;
  },

  //========= TEST CASE (SCENARIO) HANDLING ============

  getCaseId_byScenario: async function (projectId, suiteName, sectionName, feature, scenario, forceAdd, forceUpdate) {
    if ( scenario.type != 'background') {
      const suite_id = await this.getSuiteId_byName(projectId, suiteName, forceAdd);
      const section_id = await this.getSectionId_byName(projectId, suiteName, sectionName, forceAdd);
      const myCaseFilter = {suite_id, section_id};
      var myCase = await testrail.getCases(projectId, myCaseFilter).then(response => {
          const myCases = response.body;
          const myCase = myCases.filter(s => (s.title == this.getGeneratedCaseName(scenario)));
          return myCase[0];
      }).catch(err => {
          console.error('Testrail getCases Error :', err);
      });

      if (myCase && forceUpdate == true) {
        console.log ( " > Update test case : " + this.getGeneratedCaseName(scenario));
        myCase = await this.updateCase_byScenario(myCase.id, feature, scenario);
      }  
      if (myCase == undefined && forceAdd == true) {
        console.log ( " > Create test case : " + this.getGeneratedCaseName(scenario));
        myCase = await this.addCase_byScenario(projectId, suiteName, sectionName, feature, scenario);
      } else if (myCase == undefined && forceAdd == false) {
        let err = `\n[TestCase-Handling-Error] Test case "${scenario.name}" does not exist and NO request to add it.\n` +
                  `  > Possible resolution: Please supply "--trForceAdd true" to add the missing test case\n`;
        throw err;            
      }      
      if (myCase.refs == null) {
        this.syncCasesFromMaster (projectId, 'Master', myCase.title, myCase.id);
      }
      return myCase.id;
    } else {
      return 0;
    }
  },
  
  syncCasesFromMaster : async function (projectId, suiteName, caseName, caseId) {
    
    //console.log ( "*" + caseName.replace('Scenario: ' , '' ).replace(/\[\d{8}\] /, ''));
    this.getSuiteId_byName(projectId, suiteName, false).then ( masterSuiteId => (async() => {
      var masterCase = await testrail.getCases(projectId, {suite_id : masterSuiteId}).then(response => {
        const myCases = response.body;
        const myCase = myCases.filter(s => (s.title == caseName.replace('Scenario: ','').replace('Scenario Outline: ' , '')));
        return myCase[0];
      }).catch(err => {
          console.error('Testrail getCases Error :', err);
      });
      if (masterCase) {
        console.log ( "   > Test case id " + masterCase.id + " found in Master. Synced with master.");
        var myTestCase = {
          //title : this.getGeneratedCaseName(scenario),
          //custom_automation: 1, //1- to be automated
          //custom_bdd_scenario: this.constructScenario(feature, scenario),
          milestone_id: masterCase.milestone_id,
          refs: masterCase.refs
        };
        await testrail.updateCase ( caseId , myTestCase );
      }
      else {
        console.log ( "   > Test case " + caseName + " does not exist in Master. Sync terminated.");
      }
    })()).catch ( err => {
      console.error ( "Master suite not found. no sync will happen!");
    })                
  },
  addCase_byScenario: async function (projectId, suiteName, sectionName, feature, scenario) {
    var myCase = await this.getSectionId_byName(projectId, suiteName, sectionName, /*forceAdd*/true).then(sectionId => {      
      var myTestCase = {
        title : this.getGeneratedCaseName(scenario),
        custom_automation: 1, //1- to be automated
        custom_bdd_scenario: this.constructScenario(feature, scenario),
      };
      console.log ( "   > Test case length : " + myTestCase.custom_bdd_scenario.length);
      return testrail.addCase(/*SECTION_ID=*/sectionId, /*CONTENT=*/myTestCase).then(response => {
        //console.log ( response );
        return response.body;
      });                        
    });
    return myCase;
  },

  updateCase_byScenario: async function (caseId, feature, scenario) {
    var myTestCase = {
      title : this.getGeneratedCaseName(scenario),
      //custom_automation: 1, //1- to be automated
      custom_bdd_scenario: this.constructScenario(feature, scenario),
    };
    myCase = await testrail.updateCase(/*CASE_ID=*/caseId, /*CONTENT=*/myTestCase).then(response => {
      return response.body;
    });                        
    return myCase;
  },

  //=============== MILESTONE HANDLING =================

  getMilestones_byProjectId: async function (projectId, sprintId, forceAdd) {
    var isValid = true;
    var milestoneName = this.getGeneratedMilestoneName(sprintId);
    var myMilestone = await testrail.getMilestones(projectId).then(response => {
        const milestones = response.body;
        const milestone = milestones.filter(m => m.name == milestoneName && !m.is_completed);
        const milestoneCompleted = milestones.filter( m => m.name == milestoneName && m.is_completed);
        isValid = milestoneCompleted[0] == undefined; //test invalid when target milestone is already completed
        return milestone[0];
    }).catch(err => {
        console.error('Testrail Milestone Error :', err);
    })
    
    if (isValid) {
      if (myMilestone == undefined && forceAdd == true) {
        console.log ( "> Create Milestone : " + milestoneName );
        myMilestone = await this.addMilestone_byName(projectId, milestoneName);
      } else if (myMilestone == undefined && forceAdd == false) {
        let err = `\n[Milestone-Handling-Error] Test Milestone "${milestoneName}" for Project ID "${projectId}" does not exist and NO request to add it.\n` +
                  `  > Possible resolution: Please supply "--trForceAdd true" to add the missing milestone\n`;
        throw err; 
      }
      return myMilestone.id;
    }
    else {
      let err = `\n[Milestone-Handling-Error] Test Milestone "${milestoneName}" for Project ID "${projectId}" is already completed!\n`;
      throw err;      
    }    
  },

  addMilestone_byName: async function (projectId, milestoneName) {
    var myPreparedMilestone = {
      name: milestoneName,
      due_on: this.getMilestoneDuedate_bySprintId (milestoneName),
      description: ''
    };
    var myAddedMilestone;
    var projectName = await this.getProjectName_byId(projectId);
    myPreparedMilestone.description = 'Milestone For ' + projectName + ' project';
    myAddedMilestone = await testrail.addMilestone(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedMilestone).then(response => {
        return response.body;
    });
    return myAddedMilestone;
  },

  //=============== TEST RUNS HANDLING =================

  getTestRuns_byMilestoneId: async function (projectId, milestoneId, sprintId, suiteName, caseDicts, jenkinsPath, forceAdd, forceUpdate) {
    var isValid = true;
    var suiteId = await this.getSuiteId_byName ( projectId , suiteName , false );
    var testRunName = this.getGeneratedTestRunName(sprintId , suiteName , 0);
    var previousTestRunName = this.getGeneratedTestRunName (sprintId, suiteName, -1);
    var myTestRun = await testrail.getRuns(projectId).then ( response => {
        const testRuns = response.body;
        const testRun = testRuns.filter(r => ((r.name == testRunName && r.milestone_id == milestoneId) && !r.is_completed));
        const testRunCompleted = testRuns.filter(r => ((r.name == testRunName && r.milestone_id == milestoneId) && r.is_completed));
        isValid = testRunCompleted[0] == undefined; //test invalid when target testrun is already completed/closed
        return testRun[0];
    }).catch(err => {
        console.error('Testrail TestRun Error :', err);
    })

    if (isValid) {
      if (myTestRun && forceUpdate == true ) {
        console.log ("> Update Test Run : " + testRunName );
        myTestRun = await this.updateTestRun_byName (myTestRun.id, caseDicts, jenkinsPath);
      }
      if (myTestRun == undefined && forceAdd == true) {
        console.log ( "> Create Test Run : " + testRunName );
        myTestRun = await this.addTestRun_byName(projectId, milestoneId, suiteId, testRunName, caseDicts, jenkinsPath);
      } else if (myTestRun == undefined && forceAdd == false) {
        let err = `\n[TestRun-Handling-Error] Test run "${testRunName}" does not exist and NO request to add it.\n` +
                  `  > Possible resolution: Please supply "--trForceAdd true" to add the missing test run\n`;
        throw err;   
      }         
      this.closeTestRun_byName(projectId, milestoneId, previousTestRunName);      
      return myTestRun.id;
    }
    else {
      let err = `\n[TestRun-Handling-Error] Test Run "${testRunName}" for Milestone ID "${milestoneId}" is already completed/closed!\n`;
      throw err;       
    }    
  },

  addTestRun_byName: async function (projectId, milestoneId, suiteId, testRunName, caseDicts , jenkinsPath) {
    var caseIds = [];
    caseDicts.forEach ( caseDict => {
      caseIds.push ( caseDict.cid );
    });
    var myPreparedTestRun = {
      name: testRunName,
      milestone_id: milestoneId,
      suite_id : suiteId,
      include_all: false, 
      case_ids: caseIds,
      description: ''
    };
    var myAddedTestRun;
    var projectName = await this.getProjectName_byId(projectId);
    myPreparedTestRun.description = (jenkinsPath) ? "Latest test run is triggered from Jenkins job. Job details : " + jenkinsPath : "Latest test run is triggered locally (without Jenkins)"
    myAddedTestRun = await testrail.addRun(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedTestRun).then(response => {        
        return response.body;
    });
    return myAddedTestRun;
  },

  updateTestRun_byName: async function (testRunId, caseDicts, jenkinsPath) {
    var caseIds = [];
    caseDicts.forEach ( caseDict => {
      caseIds.push ( caseDict.cid );
    })
    var currentCaseIds = await testrail.getTests (testRunId).then (response => {
      var data = [];
      response.body.forEach ( test => {
          data.push ( test.case_id );
      })
      return data;
    })
    var finalcaseids = currentCaseIds.concat (caseIds);
    var updatedTestRun = {      
      "case_ids" : finalcaseids
    }
    updatedTestRun.description = (jenkinsPath) ? "Latest test run is triggered from Jenkins job. Job details : " + jenkinsPath : "Latest test run is triggered locally (without Jenkins)"
    myTestRun = testrail.updateRun(/*RUN_ID=*/testRunId, /*CONTENT=*/updatedTestRun).then ( response => {
      return response.body;
    })
    return myTestRun;
  },

  closeTestRun_byName: async function (projectId, milestoneId, testRunName) {
    var targetTestRun = await testrail.getRuns(/*PROJECT_ID=*/projectId, /*FILTERS=*/{milestone_id : milestoneId}).then(response => {
      var prevTestRun = response.body.filter (r => r.name == testRunName && !r.is_completed);
      return prevTestRun[0];
    });

    if (targetTestRun) {     
      testrail.closeRun(/*RUN_ID=*/targetTestRun.id, function (err, response, run) {
        console.log ("> Auto Close Test Run \"" + run.name + "\"");
      });
    }
    else{
      console.log ("> [Skip-TestRun-Close] Unable to close Test run \"" + testRunName + "\", Either it's already closed or non-exist!");
    }    
  },

  getCaseDicts_byFeature: async function (projectId, suiteName, cbJson) {
    const suite_id = await this.getSuiteId_byName(projectId, suiteName, false);
    const myCaseFilter = {suite_id};
    var caseDict = [];
    await testrail.getCases ( projectId , myCaseFilter).then (response => {
      var myCases = response.body;     
      cbJson.forEach( feature => {   
        feature.elements.filter ( s=> s.type != 'background').forEach (scenario => {
          var myCase = myCases.filter (c => (c.title == this.getGeneratedCaseName(scenario) ));
          caseDict.push ( { "cid" : myCase[0].id , "cname" : myCase[0].title})
        });
      });
    }).catch ( err => {
      console.error ( "Case Dictionary error " + err);
    })
    //console.dir ( caseDict );
    return caseDict;
  },

  //=============== TEST RESULTS HANDLING ==============

  addTestResultInBulk: async function (testRunId,  cbJson,  caseDicts , testTarget, jenkinsPath) {   
    this.constructResultsSummary ( cbJson , caseDicts , testTarget , jenkinsPath).then ( results => {
      console.log ( " > Test result count : "  + results.length);
      testrail.addResultsForCases (testRunId , results).then ( response => {
        return response;
      }).catch ( err => {
        console.error ( err );
      });
    });    
  },

  addTestResultIndividually: async function (testRunId, cbJson, caseDicts, testTarget , jenkinsPath) {     
    var targetStatus = 0; /*1 - passed on QA, 2 - blocked, 3 - untested , 4 - retest , 5 - failed , 10 - passed on support , 11 - passed on stg , 12 - passed on prod*/      
    switch (testTarget.toLowerCase()) {
      case "qa": targetStatus = 1; break;
      case "support": targetStatus = 10; break;
      case "staging":
      case "stg" : targetStatus = 11; break;
      case "production":
      case "prod": targetStatus = 12; break;
      default : targetStatus = 1; break;
    }
    var counter = 0 ;
    var result = {};
    var status = targetStatus;
    var resultComment = "";
    var resultElapsed = 0;
    var cid = 0 ;
    cbJson.forEach (feature => {
      feature.elements.forEach(scenario => {
        scenario.steps.filter ( s => _.contains (["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach(step => {          
          if ( step.result.status != "passed" && step.result.status != "skipped") {
            resultComment += "- **" + step.result.status.toUpperCase() + "** :: " + step.keyword + " " + step.name + "\r\n";
            status = 5;
          }
          if (_.has ( step.result , "error_message") ) {
            resultComment += "\r\n**Error Reference :**";
            resultComment += "\r\n" + step.result.error_message.substring ( 0, step.result.error_message.indexOf("\n")) + "\r\n\r\n";
            resultComment += (jenkinsPath) ? "||:For more detais, please go [Jenkins Link](" + jenkinsPath + this.getConstructCucumberReportPath (feature) + ").\r\n" : "||:Details error are not available as the test are triggered locally!\r\n";
          }
          resultElapsed += step.result.duration;
        }); 

        if ( scenario.type != 'background') {
          counter++;
          cid = _.find( caseDicts , d => {return d.cname == this.getGeneratedCaseName(scenario)}).cid;       
          result.comment = resultComment;          
          result.status_id = status;
          if ( result.status_id == targetStatus ) {
            //todo - to be optimized
            testrail.updateCase ( cid , {custom_automation: 2});
          }
          result.elapsed = (Math.round(resultElapsed/1e9) > 0) ? (Math.round(resultElapsed/1e9)) + "s" : null ; //null for undefined steps

          console.log ( " > #" + counter + " adding result for test case " + cid );
          testrail.addResultForCase (testRunId , cid, result ).then ( response => {
            return response.body;
          }).catch(err => {
            console.log (  " > add result error : " + err );
          })

          result = {};       
          resultComment = "";
          resultElapsed = 0 ;
          status = targetStatus;
          cid = 0 ;
        }
      });
    });
  },

  constructResultsSummary: async function (cbJson, caseDicts, testTarget , jenkinsPath) {     
    var targetStatus = 0; /*1 - passed on QA, 2 - blocked, 3 - untested , 4 - retest , 5 - failed , 10 - passed on support , 11 - passed on stg , 12 - passed on prod*/      
    switch (testTarget.toLowerCase()) {
      case "qa": targetStatus = 1; break;
      case "support": targetStatus = 10; break;
      case "staging":
      case "stg" : targetStatus = 11; break;
      case "production":
      case "prod": targetStatus = 12; break;
      default : targetStatus = 1; break;
    }
    var results = [];
    var result = {};
    var status = targetStatus;
    var resultComment = "";
    var resultElapsed = 0;
    cbJson.forEach (feature => {
      feature.elements.forEach(scenario => {
        scenario.steps.filter ( s => _.contains (["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach(step => {          
          if ( step.result.status != "passed" && step.result.status != "skipped") {
            resultComment += "- **" + step.result.status.toUpperCase() + "** :: " + step.keyword + " " + step.name + "\r\n";
            status = 5;
          }
          if (_.has ( step.result , "error_message") ) {
            resultComment += "\r\n**Error Reference :**";
            resultComment += "\r\n" + step.result.error_message.substring ( 0, step.result.error_message.indexOf("\n")) + "\r\n\r\n";
            resultComment += (jenkinsPath) ? "||:For more detais, please go [Jenkins Link](" + jenkinsPath + this.getConstructCucumberReportPath (feature) + ").\r\n" : "||:Details error are not available as the test are triggered locally!\r\n";
          }
          resultElapsed += step.result.duration;
        }); 

        if ( scenario.type != 'background'){      
          result.case_id = _.find( caseDicts , d => {return d.cname == this.getGeneratedCaseName(scenario)}).cid;       
          result.comment = resultComment;          
          result.status_id = status;
          if ( result.status_id == targetStatus ) {
            //todo - to be optimized
            testrail.updateCase ( result.case_id , {custom_automation: 2});
          }
          result.elapsed = (Math.round(resultElapsed/1e9) > 0) ? (Math.round(resultElapsed/1e9)) + "s" : null ; //null for undefined steps
          results.push ( result );
          result = {};       
          resultComment = "";
          resultElapsed = 0 ;
          status = targetStatus;
        }
      });
    });
    return results;
  },

  //========= TEST SCENARIO STEP CONSTRUCTOR ===========

  constructScenario: function (feature, scenario) {
    var caseSummary = '**' + scenario.keyword + ': ' + scenario.name + '**';
    caseSummary += '\r\n\r\n';
    caseSummary += this.constructBackground (feature);
    caseSummary += this.constructGenericStep (scenario);
    return caseSummary;
  },

  constructBackground: function ( feature ) {
    var bgScenario = feature.elements.filter ( s => s.type === 'background' )[0];
    var bgSummary = "";
    if (bgScenario !== undefined) {
      bgSummary += this.constructGenericStep ( bgScenario );
    }
    return bgSummary;
  },

  constructGenericStep: function ( scenario ) {
    var genericSteps = "";
    scenario.steps.filter ( s => _.contains (["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach(step => {
      genericSteps += step.keyword + ' ' + step.name + '\r\n';
      //todo - enabled below code, once testrail able to handle large data.
      // if ( _.has ( step, "rows" )) {
      //   step.rows.forEach ( row => { 
      //     genericSteps += '|';
      //     row.cells.forEach ( cell => {            
      //       genericSteps += '|' + cell ;
      //     });
      //     genericSteps += '|\r\n';
      //   });
      // }
      if ( _.has (step , "doc_string")) {        
        genericSteps += step.doc_string.value + "\r\n";
      }
    })
    return genericSteps;
  },

  extractSteps: function (feature , type , scenarioName = ""){
    //to extract all the steps (including tables) from a given feature and type (background or scenario)
    try {
      scenarioName = (type == 'background') ? "" : scenarioName;
      var stepBuilder = "";
      if ( !_.isEmpty ( feature ) ) {
          var targetScenario = feature.elements.filter ( s => (s.type === type && s.name === scenarioName));
          if (targetScenario.length >= 1) { //assume single unique scenario (todo: handle outline?)
              targetScenario[0].steps.filter ( s => _.contains(["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach ( step => {
                stepBuilder += step.keyword + ' ' + step.name + '\r\n';
                if ( _.has (step , "rows" )){
                    step.rows.forEach (row => {
                        row.cells.forEach ( cell => {
                            stepBuilder += '|' + cell ;
                        });
                        stepBuilder += '|\r\n';
                    })
                }
              });
          } else {
              //console.log ("Unable to find type of \"" + type + "\" in provided feature file");
          }
      } else {
          console.log ("Provided feature is empty");
      }    
      return stepBuilder;
    } catch (e) {      
    }    
  },

  getFeature_ByScenario: function ( scenarioName , jsonData) {
    //to get single feature object that contains the given scenarioName (assume unique scenario)
    var targetFeature = {};
    jsonData.forEach ( feature => {
        feature.elements.forEach ( scenario => {
            if ( scenario.name === scenarioName ) {        
              targetFeature = feature;                                
            }
        })
    })
    return targetFeature;    
  },

  //===================== UTILITIES ====================

  getConstructCucumberReportPath : function (feature) {
    //below path only works on older cucumber (4.1.0)
    //const CUKE_APPEND = 'cucumber-html-reports/report-feature_'; 
    //var cukePath = CUKE_APPEND + feature.uri.replace(/\//g,'-').replace(/\./g,'-').replace(/\s/g, '-') + ".html";    

    var cukePath = 'cucumber-html-reports/overview-failures.html'
    return cukePath;

  },

  getCurrentSprintID : function () {
    //get current sprint number, used to handle milestone/runs naming.
    const TZ = "+8";
    const MS_TO_DAY = 86400000; //milliseconds to day
    const START_SPRINT = 100;
    const SPRINT_LENGTH = 14;
    const START_DATE = "March 04, 2019 00:00:00";
    var epochDate = date => Date.parse ( new Date ( date.getTime() + (date.getTimezoneOffset() * 60000) + (3600000 * TZ)))
    curDate = epochDate(new Date());
    startDate = epochDate (new Date(START_DATE));
    return ( Math.floor(((curDate - startDate)/MS_TO_DAY/SPRINT_LENGTH) + START_SPRINT ));
  },

  getMilestoneDuedate_bySprintId : function (milestoneName) {
    const END_DATE_SPRINT100 = "March 15, 2019 00:00:00";
    const ANCHOR_SPRINTID = 100;
    const SPRINT_LENGTH = 14;
    var dueDate = new Date(END_DATE_SPRINT100);
    let sprintID = milestoneName.match (/\d+/);
    dueDate.setDate( dueDate.getDate() + (( sprintID - ANCHOR_SPRINTID) * SPRINT_LENGTH));
    return Math.floor(dueDate/1000);
  },

  getSuiteName_byResultJson: async function ( cbJson ) {

    //JS test structure -> .../test-projects/<your-project-name>/<your-module-name>/features/...
    const targetJS = "test-projects/";
    //Java test structure -> .../<your-project-name>/<your-module-name>/src/test/...
    const targetJava = "/src/test/";

    var strModule = "";
    if ( cbJson.length > 0 ) {
      let featureURI = cbJson[0].uri;
      if (featureURI.lastIndexOf(targetJava) > 0 ){ //java-file                
        let strProjModule = featureURI.substring(0, featureURI.lastIndexOf(targetJava));
        strModule = strProjModule.substring ( strProjModule.lastIndexOf('/') + 1 );
        console.log ( "Detected suite name (Java-test) : " + strModule );      
      } else if ( featureURI.indexOf(targetJS) > 0 ) { //js-file
        let strProjModuleFeature = featureURI.slice ( featureURI.indexOf(targetJS) + targetJS.length);
        let strModuleFeature = strProjModuleFeature.slice(strProjModuleFeature.indexOf('/')+1);
        strModule = strModuleFeature.substring (0, strModuleFeature.indexOf('/'));
        console.log ( "Detected suite name (JS-test) : " + strModule);
      } else {
          let err = `\n[Suite-Name-Error] Json file has invalid format : ${featureURI.substring (0, featureURI.lastIndexOf('/') + 1)} \n` +
                    `  > Possible resolution: Ensure your project is following proper folder structure as per the convention\n`;
          throw err;
      }
      return strModule;
    }
    else {
      let err = "\n[Suite-Name-Error] No features found from the supplied Json file!\n";
      throw err;
    }
  },  
  getSuiteName_byFeature:  function ( feature ) {

    //JS test structure -> .../test-projects/<your-project-name>/<your-module-name>/features/...
    const targetJS = "test-projects/";
    //Java test structure -> .../<your-project-name>/<your-module-name>/src/test/...
    const targetJava = "/src/test/";

    var strModule = "";
      let featureURI = feature.uri;
      if (featureURI.lastIndexOf(targetJava) > 0 ){ //java-file                
        let strProjModule = featureURI.substring(0, featureURI.lastIndexOf(targetJava));
        strModule = strProjModule.substring ( strProjModule.lastIndexOf('/') + 1 );
        console.log ( "Detected suite name (Java-test) : " + strModule );      
      } else if ( featureURI.indexOf(targetJS) > 0 ) { //js-file
        let strProjModuleFeature = featureURI.slice ( featureURI.indexOf(targetJS) + targetJS.length);
        let strModuleFeature = strProjModuleFeature.slice(strProjModuleFeature.indexOf('/')+1);
        strModule = strModuleFeature.substring (0, strModuleFeature.indexOf('/'));
        console.log ( "Detected suite name (JS-test) : " + strModule);
      } else {
          let err = `\n[Suite-Name-Error] Json file has invalid format : ${featureURI.substring (0, featureURI.lastIndexOf('/') + 1)} \n` +
                    `  > Possible resolution: Ensure your project is following proper folder structure as per the convention\n`;
          throw err;
      }
      return strModule;  
  }, 

  getProjectName_byId: async function (projectId) {
    try {
        const myProject = await testrail.getProject(projectId).then(response => {
            return response.body;
        }).catch(err => {
            console.error('testrail:', err);
        })
        return myProject.name;
    } catch (e) {
    }
  },  

  getFeature_ByScenario: function (scenarioName , jsonData) {
    //to get single feature object that contains the given scenarioName (assume unique scenario)
    var targetFeature = {};
    jsonData.forEach ( feature => {
        feature.elements.forEach ( scenario => {
            if ( scenario.name === scenarioName ) {        
              targetFeature = feature;                                
            }
        })
    })
    return targetFeature;    
  },
}