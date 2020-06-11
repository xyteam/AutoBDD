module.exports = (wait, ifPresent) =>{
    if (wait) try {browser.$('button=Advanced').waitForDisplayed(3000)} catch (e) {/*no-op*/};
    if (!ifPresent) {
      expect(browser.isExisting('button=Advanced')).toBe(true);
    } 
    if (browser.$('button=Advanced').isDisplayed() || browser.$('button=Back to safety').isDisplayed()) {
        browser.click('button=Advanced');
        browser.click('#proceed-link');
    }
}