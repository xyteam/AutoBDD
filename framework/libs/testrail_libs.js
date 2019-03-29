const Testrail = require('testrail-api');
const _ = require('underscore');
const testrail = new Testrail({
  host: process.env.trApiUrl,
  user: process.env.trApiUser,
  password: process.env.trApiKey,
});

module.exports = {
  getProjectName_byId: async function(projectId) {
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

  //========= MILESTONE HANDLING ===========
  addMilestone_byName: async function(projectId, milestoneName) {
    var myPreparedMilestone = {
      name: milestoneName,
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

  getMilestones_byProjectId: async function(projectId, sprintId, forceAdd) {
    var isValid = true;
    var milestoneName = this.getGeneratedMilestoneName(sprintId);
    var myMilestone = await testrail.getMilestones(projectId).then(response => {
        const milestones = response.body;
        const milestone = milestones.filter(m => m.name == milestoneName && !m.is_completed);
        const milestoneCompleted = milestones.filter( m => m.name == milestoneName && m.is_completed);
        isValid = milestoneCompleted[0] == undefined //test invalid when target milestone is already completed
        return milestone[0];
    }).catch(err => {
        console.error('MILESTONE testrail:', err);
    })
    
    if (isValid) {
      if (myMilestone == undefined && forceAdd == true) {
        console.log ( "> Create Milestone : " + milestoneName )
        myMilestone = await this.addMilestone_byName(projectId, milestoneName);
      }
      return myMilestone.id;
    }
    else {
      throw "[Milestone Completed] - Milestone \"" + milestoneName + "\" for Project ID \"" + projectId + "\" is already completed!"
    }    
  },

  getGeneratedMilestoneName: function (sprintId){
    if (sprintId == 0) {
      return "Sprint " + this.getCurrentSprintID() + " - Automated Regression"
    }
    return "Sprint " + sprintId + " - Automated Regression"
  },

  //========= TEST RUNS HANDLING ===========
  addTestRun_byName: async function(projectId, milestoneId, suiteId, testRunName, caseDicts) {
    var caseIds = [];
    caseDicts.forEach ( caseDict => {
      caseIds.push ( caseDict.cid );
    })
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
    myPreparedTestRun.description = 'Test Run For ' + projectName + ' project';
    myAddedTestRun = await testrail.addRun(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedTestRun).then(response => {        
        return response.body;
    });
    return myAddedTestRun;
  },

  closeTestRun_byName: async function(projectId, milestoneId, testRunName ){
    var targetTestRun = await testrail.getRuns(/*PROJECT_ID=*/projectId, /*FILTERS=*/{milestone_id : milestoneId}).then(response => {
      var prevTestRun = response.body.filter (r => r.name == testRunName && !r.is_completed)
      return prevTestRun[0];
    });

    if (targetTestRun) {     
      testrail.closeRun(/*RUN_ID=*/targetTestRun.id, function (err, response, run) {
        console.log ("> Close test run \"" + run.name + "\"");
      });
    }
    else{
      console.log ("> Unable to close Test run \"" + testRunName + "\", Either it's already closed or non-exist!");
    }    
  },

  updateTestRun_byName: async function(testRunId, caseDicts) {
    var caseIds = [];
    caseDicts.forEach ( caseDict => {
      caseIds.push ( caseDict.cid );
    })
    var currentCaseIds = await testrail.getTests ( testRunId ).then ( response => {
      var data = [];
      response.body.forEach ( test => {
          data.push ( test.case_id );
      })
      return data;
    })
    var finalcaseids = currentCaseIds.concat (caseIds);
    //console.log ( "=== FINAL CASE IDS ===")
    //console.dir ( finalcaseids)
    //console.log ( "=== END CASE IDS ===")
    var updatedTestRun = {
      "case_ids" : finalcaseids
    }

    myTestRun = testrail.updateRun(/*RUN_ID=*/testRunId, /*CONTENT=*/updatedTestRun).then ( response => {
      return response.body;
    })
    return myTestRun;
  },

  getTestRuns_byMilestoneId: async function(projectId,  milestoneId , sprintId, suiteName, caseDicts, forceAdd, forceUpdate) {
    var isValid = true;
    var suiteId = await this.getSuiteId_byName ( projectId , suiteName , false );
    var testRunName = this.getGeneratedTestRunName(sprintId , suiteName , 0);
    var previousTestRunName = this.getGeneratedTestRunName (sprintId, suiteName, 1);
    var myTestRun = await testrail.getRuns(projectId).then ( response => {
        const testRuns = response.body;
        const testRun = testRuns.filter(r => ((r.name == testRunName && r.milestone_id == milestoneId) && !r.is_completed));
        const testRunCompleted = testRuns.filter(r => ((r.name == testRunName && r.milestone_id == milestoneId) && r.is_completed));
        isValid = testRunCompleted[0] == undefined //test invalid when target testrun is already completed/closed
        return testRun[0];
    }).catch(err => {
        console.error('TESTRUN testrail:', err);
    })

    if (isValid) {
      if (myTestRun && forceUpdate == true ) {
        console.log ("> Update Test Run : " + testRunName )
        myTestRun = await this.updateTestRun_byName (myTestRun.id, caseDicts);
      }
      if (myTestRun == undefined && forceAdd == true) {
        console.log ( "> Create Test Run : " + testRunName )
        myTestRun = await this.addTestRun_byName(projectId, milestoneId, suiteId, testRunName, caseDicts);
      }
      this.closeTestRun_byName(projectId, milestoneId, previousTestRunName);
      
      return myTestRun.id;
    }
    else {
      throw "[Test Run Completed] - Test Runs \"" + testRunName + "\" for Milestone ID \"" + milestoneId + "\" is already completed/closed!"
    }    
  },

  getGeneratedTestRunName: function (sprintId , suiteName , dayOffset){
    var currentDate = new Date( Date.now() - (dayOffset * 864e5)).toJSON().slice(0,10).replace(/-/g,'/');
    if (sprintId == 0) {
      return "Sprint " + this.getCurrentSprintID() + " - " + suiteName + " Automated Regression " + currentDate
    }
    return "Sprint " + sprintId + " - " + suiteName + " Automated Regression " + currentDate
  },

  //========= TEST RESULTS HANDLING (WIP) ===========
    //WIP
    // addTestResult: async function( testRunId, projectId, suiteName, sectionName, feature, scenario, forceAdd, caseDicts) {    
    //   //var caseId = await this.getCaseId_byScenario ( projectId , suiteName , sectionName , feature , scenario , forceAdd );
    //   var results = this.constructResultsSummary ( scenario , caseDicts );
    //   testrail.addResultsForCases (testRunId , results ).then ( response => {
    //     return response.body;
    //   })
    // },
    addTestResult: async function( testRunId,  cbJson,  caseDicts , testTarget) {    
      var results = this.constructResultsSummary ( cbJson , caseDicts , testTarget );
      testrail.addResultsForCases (testRunId , results ).then ( response => {
        //console.dir ( response );
        return response;
      })
    },

    //WIP
    constructResultsSummary: function (cbJson, caseDicts , testTarget) {
      var results = []
      var result = {}
      var targetStatus = 0; /*1 - passed on QA, 2 - blocked, 3 - untested , 4 - retest , 5 - failed , 10 - passed on support , 11 - passed on stg , 12 - passed on prod*/      
      switch (testTarget.toLowerCase()) {
        case "qa": targetStatus = 1; break;
        case "support": targetStatus = 10; break;
        case "staging":
        case "stg" : targetStatus = 11; break;
        case "production":
        case "prod": targetStatus = 12; break;
      }
      var status = targetStatus 
      var resultComment = "";
      var resultElapsed = 0;
      cbJson.forEach (feature => {
        feature.elements.forEach(scenario => {

          scenario.steps.filter ( s => _.contains (["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach(step => {
              
            resultComment += "- **" + step.result.status.toUpperCase() + "** :: " + step.keyword + " " + step.name + "\r\n";
            if ( step.result.status != "passed") {
              status = 5;
            }
            if (_.has ( step.result , "error_message")) {
              resultComment += step.result.error_message + "\r\n";
            }
            resultElapsed += step.result.duration;
          }); 

          if ( scenario.type != 'background'){   
            result.case_id = _.find( caseDicts , d => {return d.cname == (scenario.keyword + ': ' + scenario.name)}).cid;
            result.comment = resultComment;
            result.status_id = status;
            result.elapsed = (resultElapsed > 0) ? resultElapsed/1000000 + "s" : null ; //null for undefined steps
            results.push ( result );

            result = {};       
            resultComment = "";
            resultElapsed = 0 ;
            status = targetStatus;
          }
        })
      })
      //var caseId = await this.getCaseId_byScenario ( projectId , suiteName , sectionName , feature , scenario , false );                
      return results;
    },

  //========= TEST SUITES (MODULES) HANDLING ===========
  addSuite_byName: async function(projectId, suiteName) {
    var myPreparedSuite = {
      name: suiteName,
      description: ''
    };
    var myAddedSuite;
    var projectName = await this.getProjectName_byId(projectId);
    myPreparedSuite.description = 'For ' + projectName + ' project';
    // console.log(myPreparedSuite);
    myAddedSuite = await testrail.addSuite(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedSuite).then(response => {
        return response.body;
    });
    return myAddedSuite;
  },

  getSuiteId_byName: async function(projectId, suiteName, forceAdd) {
    var mySuite = await testrail.getSuites(projectId).then(response => {
        const suites = response.body;
        const suite = suites.filter(s => s.name == suiteName);
        return suite[0];
    }).catch(err => {
        console.error('SUITE testrail:', err);
    })
    if (mySuite == undefined && forceAdd == true) {
      console.log ( " > Create suite : " + suiteName )
      mySuite = await this.addSuite_byName(projectId, suiteName);
    }   
    return mySuite.id;
  },

  //========= TEST SECTIONS (FEATURES) HANDLING ===========
  addSection_byName: async function(projectId, suiteName, sectionName ) {
    var mySection = await this.getSuiteId_byName(projectId, suiteName, /*forceAdd*/true).then(suiteId => {
      var myFeature = {
        name: sectionName,
        suite_id: suiteId
      };
      return testrail.addSection(/*PROJECT_ID=*/projectId, /*CONTENT=*/myFeature).then(response => {
        return response.body;
      });
    });
    return mySection;
  },

  getSectionId_byName: async function(projectId, suiteName, sectionName, forceAdd) {
    const mySuiteId = await this.getSuiteId_byName(projectId, suiteName, forceAdd);
    var mySection = await testrail.getSections(projectId, mySuiteId).then(response => {
        const sections = response.body;
        const section = sections.filter(s => (s.name == sectionName));
        return section[0];
    }).catch(err => {
        console.error('SECTION testrail:', err);
    })
    if (mySection == undefined && forceAdd == true) {
      console.log ( " > Create section : " + sectionName )
      mySection = await this.addSection_byName(projectId, suiteName, sectionName);
    }
    return mySection.id;
  },

  //========= TEST CASE (SCENARIO) HANDLING ===========
  addCase_byScenario: async function(projectId, suiteName, sectionName, feature, scenario) {
    var myCase = await this.getSectionId_byName(projectId, suiteName, sectionName, /*forceAdd*/true).then(sectionId => {      
      var myTestCase = {
        title : scenario.keyword + ': ' + scenario.name,
        custom_automation: 1, //1- to be automated
        custom_bdd_scenario: this.constructScenario(feature, scenario),
      }
      return testrail.addCase(/*SECTION_ID=*/sectionId, /*CONTENT=*/myTestCase).then(response => {
        return response.body;
      });                        
    });
    return myCase;
  },

  updateCase_byScenario: async function(caseId, feature, scenario) {
    var myTestCase = {
      title : scenario.keyword + ': ' + scenario.name,
      custom_automation: 1, //1- to be automated
      custom_bdd_scenario: this.constructScenario(feature, scenario),
    }
    myCase = await testrail.updateCase(/*CASE_ID=*/caseId, /*CONTENT=*/myTestCase).then(response => {
      return response.body;
    });                        
    return myCase;
  },

  getCaseId_byScenario: async function(projectId, suiteName, sectionName, feature, scenario, forceAdd, forceUpdate) {
    if ( scenario.type != 'background') {
      const suite_id = await this.getSuiteId_byName(projectId, suiteName, forceAdd);
      const section_id = await this.getSectionId_byName(projectId, suiteName, sectionName, forceAdd);
      const myCaseFilter = {suite_id, section_id};
      var myCase = await testrail.getCases(projectId, myCaseFilter).then(response => {
          const myCases = response.body;
          const myCase = myCases.filter(s => (s.title == scenario.keyword + ': ' + scenario.name));
          return myCase[0];
      }).catch(err => {
          console.error('CASE testrail:', err);
      })
      if (myCase == undefined && forceAdd == true) {
        console.log ( " > Create test case : " + scenario.name )
        myCase = await this.addCase_byScenario(projectId, suiteName, sectionName, feature, scenario);
      }
      if (myCase && forceUpdate == true) {
        console.log ( " > Update test case : " + scenario.name )
        myCase = await this.updateCase_byScenario(myCase.id, feature, scenario);
      }
      return myCase.id;
    } else {
      return 0;
    }
  },

  getCaseDicts_byFeature: async function(projectId, suiteName, cbJson) {
    const suite_id = await this.getSuiteId_byName(projectId, suiteName, false);
    //const section_id = await this.getSectionId_byName(projectId, suiteName, sectionName, false);
    const myCaseFilter = {suite_id };
    var caseDict = [];
    await testrail.getCases ( projectId , myCaseFilter).then (response => {
      var myCases = response.body;     
      cbJson.forEach( feature => {   
        feature.elements.filter ( s=> s.type != 'background').forEach (scenario => {
          var myCase = myCases.filter (c => (c.title == scenario.keyword + ": " + scenario.name ));
          caseDict.push ( { "cid" : myCase[0].id , "cname" : myCase[0].title})
        })
      })      
    }).catch ( err => {
      console.error ( "Case Dictionary error " + err)
    })
    return caseDict;

  },

  constructScenario: function (feature, scenario) {
    var caseSummary = '**' + scenario.keyword + ': ' + scenario.name + '**';
    caseSummary += '\r\n\r\n';
    caseSummary += this.constructBackground (feature);
    caseSummary += this.constructGenericStep (scenario);
    return caseSummary;
  },

  constructBackground: function ( feature ) {
    var bgScenario = feature.elements.filter ( s => s.type === 'background' )[0]
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
      if ( _.has ( step, "rows" )) {
        step.rows.forEach ( row => {
          row.cells.forEach ( cell => {
            genericSteps += '|' + cell;
          });
          genericSteps += '|\r\n';
        });
      }
    })
    return genericSteps;
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

  getCurrentSprintID : function (){
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
  }
}