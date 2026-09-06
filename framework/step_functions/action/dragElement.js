/**
 * Drag a element to a given destination
 * @param  {String}   source      The selector for the source element
 * @param  {String}   destination The selector for the destination element
 */
module.exports = async (source, destination) => {
    await (await browser.$(source)).dragAndDrop(await $(destination));
};
