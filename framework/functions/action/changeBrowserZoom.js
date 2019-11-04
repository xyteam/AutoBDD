/**
 * browser zoom with percent
 * @param  {String}   percent zoom percent, i.e., 80%, 120%, 
 */
module.exports = (percent) => {
    const browserZoom = function(argument) { document.body.style.zoom = argument; };
    try {
        browser.execute(browserZoom, percent); 
    } catch (e) {
        console.log(`browser zoom ${percent} failed`);
    }
};
