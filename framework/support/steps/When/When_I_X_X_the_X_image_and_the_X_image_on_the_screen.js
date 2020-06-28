const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const { When } = require('cucumber');
When(/^I (click|hoverClick|rightClick|doubleClick|hover|wave|shake|circle)(?: (\d+) times)? (on|between) the "([^"]*)" image(?: and the "([^"]*)" image)? on the screen$/,
  { timeout: 60*1000 },
  function (mouseAction, timesCount, targetType, imageNameOne, imageNameTwo) {
    // re imageNameOne
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = fs_session.getTestImageParms(parsedImageNameOne);
    var imagePathListOne;
    if (imageFileNameOne.includes('Screen')) {
      imagePathListOne = imageFileNameOne;
    } else {
      imagePathListOne = fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    }
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = fs_session.getTestImageParms(parsedImageNameTwo);
    var imagePathListTwo;
    if (imageFileNameTwo.includes('Screen')) {
      imagePathListTwo = imageFileNameTwo;
    } else {
      imagePathListTwo = fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);
    }
   
    switch (targetType) {
      case 'between':
        var locationOne, locationTwo;
        var targetLocation = {};
        locationOne = JSON.parse(screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
        expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
        locationTwo = JSON.parse(screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
        expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
        targetLocation.x = (locationOne[0].center.x + locationTwo[0].center.x) / 2;
        targetLocation.y = (locationOne[0].center.y + locationTwo[0].center.y) / 2;
        var myTimesCount = timesCount || 1;
        while (myTimesCount > 0) {
          switch (mouseAction) {
            case "click":
              screen_session.moveMouse(targetLocation.x, targetLocation.y);
              screen_session.mouseClick("left");
              break;
            case "hoverClick":
              screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
              screen_session.mouseClick("left");
              break;
              case "rightClick":
              screen_session.moveMouse(targetLocation.x, targetLocation.y);
              screen_session.mouseClick("right");
              break;
            case "doubleClick":
              screen_session.moveMouse(targetLocation.x, targetLocation.y);
              screen_session.mouseClick("left", true);
              break;
            case "move":
            case 'park':
              screen_session.moveMouse(targetLocation.x, targetLocation.y);
              break;
            case "hover":
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
              screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
              screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y - delta_50);
              screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
              screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y + delta_50);
              screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
              screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y + delta_50);
              screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
              screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y - delta_50);
              screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
              break;
          }
          myTimesCount--;
        }
        break;
      case 'on':
      default:
        var screenFindResult;
        if (imageNameOne && imageNameOne == 'last-seen') {
          screenFindResult = this.lastSeen_screenFindResult;
        } else {
          screenFindResult = JSON.parse(screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
        }
        
        var myTimesCount = timesCount || 1;
        while (myTimesCount > 0) {
          switch (mouseAction) {
            case "click":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.mouseClick('left');
              break;
            case "hoverClick":
              screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.mouseClick('left');
              break;
            case "rightClick":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.mouseClick('right');
              break;
            case "doubleClick":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.mouseClick('left', true);
              break;
            case "move":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "hover":
              screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "wave":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x - 50, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x + 50, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "shake":
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y + 50);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "circle":
              const delta_50 =  50 / Math.sqrt(2);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              screen_session.moveMouse(screenFindResult[0].center.x + delta_50, screenFindResult[0].center.y - delta_50);
              screen_session.moveMouse(screenFindResult[0].center.x + 50, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x + delta_50, screenFindResult[0].center.y + delta_50);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y + 50);
              screen_session.moveMouse(screenFindResult[0].center.x - delta_50, screenFindResult[0].center.y + delta_50);
              screen_session.moveMouse(screenFindResult[0].center.x - 50, screenFindResult[0].center.y);
              screen_session.moveMouse(screenFindResult[0].center.x - delta_50, screenFindResult[0].center.y - delta_50);
              screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              break;
          }  
          myTimesCount--;
        }
        console.log(screenFindResult);
        expect(screenFindResult.length).not.toEqual(0, `can not ${mouseAction} the "${imageNameOne}" image on the screen`);
        break;
    }
  });




