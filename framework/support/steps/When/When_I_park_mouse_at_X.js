module.exports = function() {
  this.When(/^I (park|expect) mouse at "([^"]*)"$/, {timeout: process.env.StepTimeoutInMS}, function (action, location) {
    const myDISPLAYSIZE = process.env.DISPLAYSIZE || '1920x1200';
    const [myScreenX, myScreenY] = myDISPLAYSIZE.split('x');
    var targetLocation = {x: 0, y: 0};
    switch (location) {
      case 'upperLeft':
        targetLocation = {x: 0, y: 0};
        break;
      case 'upperRight':
        targetLocation.x = myScreenX;
        break;
      case 'lowerLeft':
        targetLocation.y = myScreenY;
        break;
      case 'lowerRight':
        targetLocation = {x: myScreenX, y: myScreenY};
        break;
      case 'center':
        targetLocation = {x: myScreenX/2, y: myScreenY/2};
        break;                                      
      default:
        [targetLocation.x, targetLocation.y] = location.split(',');
    }
    switch (action) {
      case 'park':
        console.log(`moving mouse to ${JSON.stringify(targetLocation)}`);
        this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
        break;
      case 'expect':
        const mousePos = JSON.parse(this.screen_session.getMousePos());
        const deltaX = Math.abs(mousePos.x - targetLocation.x);
        const deltaY = Math.abs(mousePos.y - targetLocation.y);
        expect(deltaX).not.toBeGreaterThan(5);
        expect(deltaY).not.toBeGreaterThan(5);
        break;
    }
  });
}