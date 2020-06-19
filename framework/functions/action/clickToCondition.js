/**
 * Perform an click action on the given element
 * @param  {String}  clickElement  element to be clicked
 * @param  {String}  clickCount    click up to number of times
 * @param  {String}  checkElement  element to be checked
 * @param  {String}  falseCase     fasle case
 * @param  {String}  state         checked element state
 */
module.exports = (clickElement, clickCount, checkElement, falseCase, state) => {
    var myClickCount = clickCount || 2;
    var myState = state || 'existing';
    // convert conditions
    var checkAction = `is${myState.charAt(0).toUpperCase()}${myState.slice(1)}`;
    if (checkAction == 'isVisible') checkAction = 'isDisplayedInViewport';
    if (checkAction == 'isChecked') checkAction = 'isSelected';
    var keepGoing = true;
    do {
      browser.$(clickElement).click();
      myClickCount--;
      browser.pause(300);
      keepGoing = !browser.$(checkElement)[checkAction]();
      if (falseCase) keepGoing = !keepGoing;
    } while (myClickCount > 0 && keepGoing);
};
