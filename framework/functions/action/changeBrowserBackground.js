/**
 * set brower background colorName
 * @param  {String}   colorName set brower background colorName, i.e., red, white, blue, or color code, i.e., #ffffff, #0e0e0e
 */
module.exports = (colorName) => {
    const changeBrowserBackground = function(argument) { document.body.style.background = argument; };
    try {
        browser.execute(changeBrowserBackground, colorName); 
    } catch (e) {
        console.log(`changeBrowserBackground ${colorName} failed`);
    }
};
