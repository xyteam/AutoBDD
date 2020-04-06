module.exports = () => {
    if (browser.isVisible('button=Advanced') || browser.isVisible('button=Back to safety')) {
        browser.click('button=Advanced');
        browser.click('#proceed-link');
    }
}