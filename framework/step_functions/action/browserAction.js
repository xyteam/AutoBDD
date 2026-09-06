/**
 * Simple browser action
 * @param  {String}   command name of browser action without parameter, i.e. back, forward, reload, 
 */
module.exports = async (command) => {
    try {
        if (command == 'reload') {
            await browser.reloadSession();
        } else {
            await browser[command]();
        }    
    } catch (e) {
        console.log(`browser ${command} failed`);
    }
};
