module.exports = {
  baseURL: 'http://selenium-release.storage.googleapis.com',
  version: '3.4.0',
  drivers: {
    chrome: {
      version: '2.41',
      arch: process.arch,
      baseURL: 'http://chromedriver.storage.googleapis.com'
    },
    ie: {
      version: '3.4.0',
      arch: process.arch,
      baseURL: 'http://selenium-release.storage.googleapis.com'
    },
    firefox: {
      version: '0.20.0',
      arch: process.arch,
      baseURL: 'http://github.com/mozilla/geckodriver/releases/download'
    },
    edge: {
      version: '16299',
      arch: process.arch,
      url: 'https://download.microsoft.com/download/D/4/1/D417998A-58EE-4EFE-A7CC-39EF9E020768/MicrosoftWebDriver.exe',
      extension: 'exe'
    }
  }
};
