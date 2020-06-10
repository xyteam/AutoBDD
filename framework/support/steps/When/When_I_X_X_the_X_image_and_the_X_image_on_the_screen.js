const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
const { When } = require('cucumber');
When(/^I (click|hoverClick|rightClick|doubleClick|hover|wave|shake|circle)(?: (\d+) times)? (on|between) the "([^"]*)" image(?: and the "([^"]*)" image)? on the screen$/,
  { timeout: 60*1000 },
  function (mouseAction, timesCount, targetType, imageNameOne, imageNameTwo) {
    // re imageNameOne
    const parsedImageNameOne = parseExpectedText(imageNameOne);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = this.fs_session.getTestImageParms(parsedImageNameOne);
    var imagePathListOne;
    if (imageFileNameOne.includes('Screen')) {
      imagePathListOne = imageFileNameOne;
    } else {
      imagePathListOne = this.fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);
    }
    // re imageNameTwo
    const parsedImageNameTwo = parseExpectedText(imageNameTwo);
    const [imageFileNameTwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = this.fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = this.fs_session.globalSearchImageList(__dirname, imageFileNameTwo, imageFileExtTwo);
    switch (targetType) {
      case 'between':
        var locationOne, locationTwo;
        var targetLocation = {};
        locationOne = JSON.parse(this.screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
        expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
        locationTwo = JSON.parse(this.screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
        expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
        targetLocation.x = (locationOne[0].center.x + locationTwo[0].center.x) / 2;
        targetLocation.y = (locationOne[0].center.y + locationTwo[0].center.y) / 2;
        var myTimesCount = timesCount || 1;
        while (myTimesCount > 0) {
          switch (mouseAction) {
            case "click":
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
              this.screen_session.mouseClick();
              break;
            case "hoverClick":
              this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
              this.screen_session.mouseClick();
              break;
              case "rightClick":
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
              this.screen_session.mouseClick("right");
              break;
            case "doubleClick":
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
              this.screen_session.mouseClick("left", true);
              break;
            case "move":
            case 'park':
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y);
              break;
            case "hover":
              this.screen_session.moveMouseSmooth(targetLocation.x, targetLocation.y);
              break;
            case "wave":
              this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
              this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
              this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
              this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
              break;
            case "shake":
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
              break;
            case "circle":
              const delta_50 =  50 / Math.sqrt(2);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
              this.screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y - delta_50);
              this.screen_session.moveMouse(targetLocation.x + 50, targetLocation.y);
              this.screen_session.moveMouse(targetLocation.x + delta_50, targetLocation.y + delta_50);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y + 50);
              this.screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y + delta_50);
              this.screen_session.moveMouse(targetLocation.x - 50, targetLocation.y);
              this.screen_session.moveMouse(targetLocation.x - delta_50, targetLocation.y - delta_50);
              this.screen_session.moveMouse(targetLocation.x, targetLocation.y - 50);
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
          screenFindResult = JSON.parse(this.screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
        }
        
        var myTimesCount = timesCount || 1;
        while (myTimesCount > 0) {
          switch (mouseAction) {
            case "click":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.mouseClick('left');
              break;
            case "hoverClick":
              this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.mouseClick('left');
              break;
            case "rightClick":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.mouseClick('right');
              break;
            case "doubleClick":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.mouseClick('left', true);
              break;
            case "move":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "hover":
              this.screen_session.moveMouseSmooth(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "wave":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x - 50, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x + 50, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "shake":
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y + 50);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y);
              break;
            case "circle":
              const delta_50 =  50 / Math.sqrt(2);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              this.screen_session.moveMouse(screenFindResult[0].center.x + delta_50, screenFindResult[0].center.y - delta_50);
              this.screen_session.moveMouse(screenFindResult[0].center.x + 50, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x + delta_50, screenFindResult[0].center.y + delta_50);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y + 50);
              this.screen_session.moveMouse(screenFindResult[0].center.x - delta_50, screenFindResult[0].center.y + delta_50);
              this.screen_session.moveMouse(screenFindResult[0].center.x - 50, screenFindResult[0].center.y);
              this.screen_session.moveMouse(screenFindResult[0].center.x - delta_50, screenFindResult[0].center.y - delta_50);
              this.screen_session.moveMouse(screenFindResult[0].center.x, screenFindResult[0].center.y - 50);
              break;
          }  
          myTimesCount--;
        }
        console.log(screenFindResult);
        expect(screenFindResult.length).not.toEqual(0, `can not ${mouseAction} the "${imageNameOne}" image on the screen`);
        break;
    }
  });




