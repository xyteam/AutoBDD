
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
    // console.dir(mySuite);
    if (mySuite == undefined && forceAdd == true) {
      console.log ( " > Create suite : " + suiteName )
      mySuite = await this.addSuite_byName(projectId, suiteName);
    }
    return mySuite.id;
  },

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

  addCase_byScenario: async function(projectId, suiteName, sectionName, feature, scenario ) {
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

  getCaseId_byScenario: async function(projectId, suiteName, sectionName, feature, scenario, forceAdd) {
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