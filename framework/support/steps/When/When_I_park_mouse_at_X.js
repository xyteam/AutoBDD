const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const { When } = require('cucumber');
When(/^I (circle|click|expect|park|hover|shake|wave) mouse(?: (\d+) times)? at the (center|centerLeft|centerRight|bottomCenter|bottomLeft|bottomRight|previous|topCenter|topLeft|topRight|\d+,\d+) position of the screen$/,
  { timeout: 60*1000 },
  function (mouseAction, timesCount, screenLocation) {
    const myDISPLAYSIZE = process.env.DISPLAYSIZE;
    const [myScreenX, myScreenY] = myDISPLAYSIZE.split('x');
    var targetLocation = {x: 0, y: 0};
    switch (screenLocation) {
      case 'center':
        targetLocation = {x: myScreenX/2, y: myScreenY/2};
        break;
      case 'centerLeft':
        targetLocation = {x: 0, y: myScreenY/2};
        break;
      case 'centerRight':
        targetLocation = {x: myScreenX, y: myScreenY/2};
        break;
      case 'bottomCenter':
        targetLocation = {x: myScreenX/2, y: myScreenY};
        break;
      case 'bottomLeft':
        targetLocation = {x: 0, y: myScreenY};
        break;
      case 'bottomRight':
        targetLocation = {x: myScreenX, y: myScreenY};
        break;
      case 'previous':
        const mousePos = JSON.parse(screen_session.getMousePos());
        targetLocation = {x: mousePos.x, y: mousePos.y};
        break;
      case 'topCenter':
        targetLocation = {x: myScreenX/2, y: 0};
        break;
      case 'topLeft':
        targetLocation = {x: 0, y: 0};
        break;
      case 'topRight':
        targetLocation = {x: myScreenX, y: 0};
        break;                                 
      default:
        [targetLocation.x, targetLocation.y] = screenLocation.split(',');
    }
    var myTimesCount = timesCount || 1;
    while (myTimesCount > 0) {
      switch (mouseAction) {
        case 'click':
          screen_session.moveMouse(targetLocation.x, targetLocation.y);
          screen_session.mouseClick('left');
          break; 
        case 'hoverClick':
          screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
          screen_session.mouseClick('left');
          break;
        case 'rightClick':
          screen_session.moveMouse(targetLocation.x, targetLocation.y);
          screen_session.mouseClick('right');
          break;
        case 'dubleClick':
          screen_session.moveMouse(targetLocation.x, targetLocation.y);
          screen_session.mouseClick('left', true);
          break; 
        case 'expect':
          const mousePos = JSON.parse(screen_session.getMousePos());
          const deltaX = Math.abs(mousePos.x - targetLocation.x);
          const deltaY = Math.abs(mousePos.y - targetLocation.y);
          expect(deltaX).not.toBeGreaterThan(5);
          expect(deltaY).not.toBeGreaterThan(5);
          break;
        case 'move':
        case 'park':
          console.log(`parking mouse to ${JSON.stringify(targetLocation)}`);
          screen_session.moveMouse(targetLocation.x, targetLocation.y);
          break;
        case 'hover':
          console.log(`hovering mouse to ${JSON.stringify(targetLocation)}`);
          screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
          break;
        case "wave":
          screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
          screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
          screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
          screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
          break;
        case "shake":
          screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
          screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
          screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
          screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
          break;
        case "circle":
          const delta_50 =  50 / Math.sqrt(2);
          screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y - 50);
          screen_session.moveMouseSmooth(targetLocation.x + delta_50, targetLocation.y - delta_50);
          screen_session.moveMouseSmooth(targetLocation.x + 50, targetLocation.y);
          screen_session.moveMouseSmooth(targetLocation.x + delta_50, targetLocation.y + delta_50);
          screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y + 50);
          screen_session.moveMouseSmooth(targetLocation.x - delta_50, targetLocation.y + delta_50);
          screen_session.moveMouseSmooth(targetLocation.x - 50, targetLocation.y);
          screen_session.moveMouseSmooth(targetLocation.x - delta_50, targetLocation.y - delta_50);
          screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y - 50);
          break;
      }
      myTimesCount--;
    }
  });