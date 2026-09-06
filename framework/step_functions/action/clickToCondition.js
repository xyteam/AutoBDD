/**
 * Perform an click action on the given element
 * @param  {String}  clickElement  element to be clicked
 * @param  {String}  clickCount    click up to number of times
 * @param  {String}  checkElement  element to be checked
 * @param  {String}  falseCase     fasle case
 * @param  {String}  state         checked element state
 */
module.exports = async (clickElement, clickCount, checkElement, falseCase, state) => {
    var myClickCount = clickCount || 2;
    var myState = state || 'existing';
    // convert conditions
    var checkAction = `is${myState.charAt(0).toUpperCase()}${myState.slice(1)}`;
    // "is visible" = CSS-visible (isDisplayed), not in-viewport
    if (checkAction == 'isVisible') checkAction = 'isDisplayed';
    if (checkAction == 'isChecked') checkAction = 'isSelected';
    var keepGoing = true;
    do {
      await (await browser.$(clickElement)).click();
      myClickCount--;
      await browser.pause(300);
      keepGoing = !(await (await browser.$(checkElement))[checkAction]());
      if (falseCase) keepGoing = !keepGoing;
    } while (myClickCount > 0 && keepGoing);
};
