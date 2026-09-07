/**
 * Delete a cookie
 * @param  {String}   name The name of the cookie to delete
 */
module.exports = async (name) => {
    await browser.deleteCookies(name);
};
