/**
 * Simple browser action
 * @param  {String}   command name of browser action without parameter, i.e. back, forward, reload, 
 */
module.exports = (command) => {
    try {
        if (command == 'reload') {
            browser.reloadSession();
        } else {
            browser[command]();
        }    
    } catch (e) {
        console.log(`browser ${command} failed`);
    }
};
