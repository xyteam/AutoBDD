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
    var milestoneName = this.getGeneratedMilestoneName(sprintId);
    console.log ( "> Generated milestone name : " + milestoneName)
    var myMilestone = await testrail.getMilestones(projectId).then(response => {
        const milestones = response.body;
        const milestone = milestones.filter(m => m.name == milestoneName);
        return milestone[0];
    }).catch(err => {
        console.error('MILESTONE testrail:', err);
    })
    if (myMilestone == undefined && forceAdd == true) {
      console.log ( " > Create Milestone : " + milestoneName )
      myMilestone = await this.addMilestone_byName(projectId, milestoneName);
    }
    return myMilestone.id;
  },

  getGeneratedMilestoneName: function (sprintId){
    if (sprintId == 0) {
      return "Sprint " + this.getCurrentSprintID() + " - Automated Regression"
    }
    return "Sprint " + sprintId + " - Automated Regression"
  },

  //========= TEST RUNS HANDLING ===========
  addTestRun_byName: async function(projectId, milestoneId, suiteId, testRunName) {
    var myPreparedTestRun = {
      name: testRunName,
      milestone_id: milestoneId,
      suite_id : suiteId,
      include_all: true, 
      description: ''
    };
    console.dir ( myPreparedTestRun );
    var myAddedTestRun;
    var projectName = await this.getProjectName_byId(projectId);
    myPreparedTestRun.description = 'Test Run For ' + projectName + ' project';
    myAddedTestRun = await testrail.addRun(/*PROJECT_ID=*/projectId, /*CONTENT=*/myPreparedTestRun).then(response => {        
        return response.body;
    });
    return myAddedTestRun;
  },

  getTestRuns_byMilestoneId: async function(projectId,  milestoneId , sprintId, suiteName, forceAdd) {
    var suiteId = await this.getSuiteId_byName ( projectId , suiteName , false );
    var testRunName = this.getGeneratedTestRunName(sprintId , suiteName);
    console.log ( "> Generated testrun name : " + testRunName)
    var myTestRun = await testrail.getRuns(projectId).then ( response => {
        const testRuns = response.body;
        const testRun = testRuns.filter(r => (r.name == testRunName && r.milestone_id == milestoneId));
        return testRun[0];
    }).catch(err => {
        console.error('MILESTONE testrail:', err);
    })
    if (myTestRun == undefined && forceAdd == true) {
      console.log ( " > Create Test Run : " + testRunName )
      myTestRun = await this.addTestRun_byName(projectId, milestoneId, suiteId, testRunName);
    }
    return myTestRun.id;
  },

  getGeneratedTestRunName: function (sprintId , suiteName){
    var currentDate = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    if (sprintId == 0) {
      return "Sprint " + this.getCurrentSprintID() + " - " + suiteName + " Automated Regression " + currentDate
    }
    return "Sprint " + sprintId + " - " + suiteName + " Automated Regression " + currentDate
  },

  //========= TEST RESULTS HANDLING (WIP) ===========
  //WIP
  addXXXX: async function(projectId, suiteName, sectionName, feature, scenario ) {
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

  //WIP
  getTestResult: async function(projectId, suiteName, sectionName, feature, scenario, forceAdd) {
    var caseId = await this.getCaseId_byScenario ( projectId , suiteName , sectionName , feature , scenario , false );
    
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
      return myCase.id;
    } else {
      return 0;
    }
  },

  //WIP
  constructResultSummary: function (feature, caseId) {
    var resultSummary = [];
    var result = {}
    var resultComment = "";
    var resultElapsed = 0;
    feature.elements.forEach (scenario =>{
      //var caseId = await this.getCaseId_byScenario ( projectId , suiteName , sectionName , feature , scenario , false );
      scenario.steps.filter ( s => _.contains (["given","when","then","but","and"], s.keyword.trim().toLowerCase())).forEach(step => {
        resultComment += step.keyword + " " + step.name + " ==> " + step.status.toUpperCase() + "\r\n";
        resultElapsed += step.duration;
      });
      result.comment = resultComment;
      result.elapsed = (resultElapsed > 0) ? resultElapsed + "s" : null ; //null for undefined steps
    })
    
   
    
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
  addSection_byName: async function(projectId, suiteName, sectionName) {
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