module.exports = function() {
  this.When(/^I (circle|expect|park|shake|wave) mouse at the (center|lowerLeft|lowerRight|previous|upperLeft|upperRight|\d+,\d+) position of the screen$/, {timeout: process.env.StepTimeoutInMS}, function (action, location) {
    const myDISPLAYSIZE = process.env.DISPLAYSIZE || '1920x1200';
    const [myScreenX, myScreenY] = myDISPLAYSIZE.split('x');
    var targetLocation = {x: 0, y: 0};
    switch (location) {
      case 'center':
        targetLocation = {x: myScreenX/2, y: myScreenY/2};
        break;     
      case 'lowerLeft':
        targetLocation.y = myScreenY;
        break;
      case 'lowerRight':
        targetLocation = {x: myScreenX, y: myScreenY};
        break;
      case 'previous':
        const mousePos = JSON.parse(this.screen_session.getMousePos());
        targetLocation = {x: mousePos.x, y: mousePos.y};
        break;
      case 'upperLeft':
        targetLocation = {x: 0, y: 0};
        break;
      case 'upperRight':
        targetLocation.x = myScreenX;
        break;                                 
      default:
        [targetLocation.x, targetLocation.y] = location.split(',');
    }
    switch (action) {
      case "circle":
        const delta_50 =  50 / Math.sqrt(2);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
        this.screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y - delta_50);
        this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y + delta_50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
        this.screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y + delta_50);
        this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y - delta_50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        break;
      case 'expect':
        const mousePos = JSON.parse(this.screen_session.getMousePos());
        const deltaX = Math.abs(mousePos.x - targetLocation.x);
        const deltaY = Math.abs(mousePos.y - targetLocation.y);
        expect(deltaX).not.toBeGreaterThan(5);
        expect(deltaY).not.toBeGreaterThan(5);
        break;
      case 'park':
        console.log(`moving mouse to ${JSON.stringify(targetLocation)}`);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        break;
      case "shake":
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        break;
      case "wave":
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
        this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
        break;
    }
  });
}