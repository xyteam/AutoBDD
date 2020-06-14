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
    const action = `is${state.charAt(0).toUpperCase()}${state.slice(1)}`;
    var keepGoing = true;
    do {
      browser.click(clickElement);
      myClickCount--;
      browser.pause(300);
      keepGoing = !browser.$(checkElement)[action];
      if (falseCase) keepGoing = !keepGoing;
    } while (myClickCount > 0 && keepGoing);
};
