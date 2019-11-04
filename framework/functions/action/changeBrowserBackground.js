/**
 * browser zoom with percent
 * @param  {String}   colorName set brower background colorName, i.e., red, white, blue, or color code, i.e., #ffffff, #0e0e0e
 */
module.exports = (colorName) => {
    const changeBrowserBackgroundColor = function(argument) { document.body.style.background = argument; };
    try {
        console.log(`changeBrowserBackgroundColor ${colorName}`);
        browser.execute(changeBrowserBackgroundColor, colorName); 
    } catch (e) {
        console.log(`changeBrowserBackgroundColor ${colorName} failed`);
    }
};
