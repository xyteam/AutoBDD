module.exports = (wait, ifPresent) =>{
    if (wait) try {browser.$('button=Advanced').waitForDisplayed(3000)} catch (e) {/*no-op*/};
    if (!ifPresent) {
      expect(browser.$('button=Advanced').isExisting()).toBe(true);
    } 
    if (browser.$('button=Advanced').isDisplayed() || browser.$('button=Back to safety').isDisplayed()) {
        browser.$('button=Advanced').click();
        browser.$('#proceed-link').click();
    }
}