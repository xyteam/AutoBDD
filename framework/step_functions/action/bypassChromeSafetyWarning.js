module.exports = async (wait, ifPresent) =>{
    if (wait) try {await (await browser.$('button=Advanced')).waitForDisplayed(3000)} catch (e) {/*no-op*/};
    if (!ifPresent) {
      await expect(await (await browser.$('button=Advanced')).isExisting()).toBe(true);
    } 
    if (await (await browser.$('button=Advanced')).isDisplayed() || await (await browser.$('button=Back to safety')).isDisplayed()) {
        await (await browser.$('button=Advanced')).click();
        await (await browser.$('#proceed-link')).click();
    }
}
