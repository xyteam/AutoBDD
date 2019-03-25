
const Testrail = require('testrail-api');
const _ = require('underscore');
const testrail = new Testrail({
  host: process.env.trApiUrl,
  user: process.env.trApiUser,
  password: process.env.trApiKey,
});

module.exports = {
  getProjectName_byId: async function (projectId) {
    try {
        const myProject = await testrail.getProject(projectId)
        .then(response => {
            return response.body;
        }).catch(err => {
            console.error('testrail:', err);
        })
        return myProject.name;
    } catch (e) {
    }
  },

  getSuiteId_byName: async function (projectId, suiteName) {
    try {
        const mySuite = await testrail.getSuites(projectId)
        .then(response => {
            const suites = response.body;
            const suite = suites.filter(s => s.name == suiteName);
            return suite[0];
        }).catch(err => {
            console.error('testrail:', err);
        })
        return mySuite.id;
    } catch (e) {
    }
  },

  getSectionId_byName: async function (projectId, sectionName) {
    try {
        const mySection = await testrail.getSuites(projectId)
        .then(response => {
            const sections = response.body;
            const section = sections.filter(s => s.name == sectionName);
            return section[0];
        }).catch(err => {
            console.error('testrail:', err);
        })
        return mySection.id;
    } catch (e) {
    }
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