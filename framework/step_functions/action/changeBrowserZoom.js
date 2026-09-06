/**
 * browser zoom with percent
 * @param  {String}   percent zoom percent, i.e., 80%, 120%, 
 */
module.exports = async (percent) => {
    const changeBrowserZoom = function(argument) { document.body.style.zoom = argument; };
    try {
        await browser.execute(changeBrowserZoom, percent); 
    } catch (e) {
        console.log(`browser zoom ${percent} failed`);
    }
};
