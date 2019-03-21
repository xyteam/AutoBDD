
const Testrail = require('testrail-api');
const testrail = new Testrail({
  host: process.env.cbReportUrl || 'http://testrail.cadreon.com/testrail',
  user: process.env.cbReportUser,
  password: process.env.cbReportKey,
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
  }

}