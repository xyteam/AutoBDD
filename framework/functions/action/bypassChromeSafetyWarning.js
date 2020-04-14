module.exports = (wait, ifPresent) =>{
    if (wait) try {browser.waitForVisible('button=Advanced', 3000)} catch (e) {/*no-op*/};
    if (!ifPresent) {
      expect(browser.isExisting('button=Advanced')).toBe(true);
    } 
    if (browser.isVisible('button=Advanced') || browser.isVisible('button=Back to safety')) {
        browser.click('button=Advanced');
        browser.click('#proceed-link');
    }
}