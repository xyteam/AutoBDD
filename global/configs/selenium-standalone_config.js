// we need to stick with 3.4.0 in order to maintain IE compatibility.
// 3.5.0 to 3.14.0 is known to break in IE with "Error: Invalid timeout type specified: ms".
module.exports = {
  baseURL: 'http://selenium-release.storage.googleapis.com',
  version: '3.141.0',
  drivers: {
    chrome: {
      version: '2.43',
      arch: process.arch,
      baseURL: 'http://chromedriver.storage.googleapis.com'
    },
    ie: {
      version: '3.4.0',
      arch: process.arch,
      baseURL: 'http://selenium-release.storage.googleapis.com'
    },
    firefox: {
      version: '0.22.0',
      arch: process.arch,
      baseURL: 'http://github.com/mozilla/geckodriver/releases/download'
    },
    edge: {
      version: '10240',
      arch: process.arch,
      baseURL: 'https://download.microsoft.com/download/8/D/0/8D0D08CF-790D-4586-B726-C6469A9ED49C/MicrosoftWebDriver.exe'
    }
  }
};
