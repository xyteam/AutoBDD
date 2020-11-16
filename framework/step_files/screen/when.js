const { When } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/step_functions/common/parseExpectedText');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');

When(/^(?::screen: )?I select the "([^"]*)?" file for upload$/, {timeout: 300*1000},
(fullFileName) => {
    if(fullFileName && fullFileName.split('.').length > 1){
    const currentPath = path.resolve();
    const TESTFILE_FOLDER = 'testfiles';
    const fullPathForFile = currentPath + '/' + TESTFILE_FOLDER + '/' + fullFileName;
    screen_session.typeString(fullPathForFile+'\n');
    }
});
  
When(/^(?::screen: )?I download the (PDF) file by clicking "([^"]*)"$/, { timeout: 60 * 1000 * 2 },
function (fileType, imageName) {
    // delete previous download file
    var downloadUrl = browser.getUrl();
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    fs_session.deleteDownloadFile(fileName, fileExt);

    // process PDF download icon
    const parsedImageNameOne = parseExpectedText(imageName);
    const [imageFileNameOne, imageFileExtOne, imageSimilarityOne, maxSimilarityOrTextOne] = fs_session.getTestImageParms(parsedImageNameOne);
    const imagePathListOne = fs_session.globalSearchImageList(__dirname, imageFileNameOne, imageFileExtOne);

    // shake mouse to induce the display of PDF download icon
    screen_session.moveMouse(0, 0);
    screen_session.moveMouse(100, 100);
    screen_session.moveMouse(0, 0);
    screen_session.moveMouse(100, 100);
    // click PDF download icon
    var screenActionResultOne;
    screenActionResultOne = JSON.parse(screen_session.screenClickImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(screenActionResultOne.length).not.toEqual(0, 'failed to click PDF download icon');

    // process FileSave_button
    const parsedImageNameTwo = parseExpectedText('FileSave_button:save');
    const [imageFileNametwo, imageFileExtTwo, imageSimilarityTwo, maxSimilarityOrTextTwo] = fs_session.getTestImageParms(parsedImageNameTwo);
    const imagePathListTwo = fs_session.globalSearchImageList(__dirname, imageFileNametwo, imageFileExtTwo);
    // click FileSave_button
    screenActionResult = JSON.parse(screen_session.screenClickImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(screenActionResult.length).not.toEqual(0, 'failed to click FileSave button');
    const downloadFilePath = fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
});

When(/^(?::screen: )?I download the (XLS|PDF) file by going to URL "([^"]*)"$/,
{ timeout: 60 * 1000 * 2 },
function (fileType, downloadUrl) {
    // delete previous download file
    var fileName = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1, downloadUrl.lastIndexOf('.')));
    var fileExt = decodeURI(downloadUrl.substring(downloadUrl.lastIndexOf('.') + 1));
    fs_session.deleteDownloadFile(fileName, fileExt);

    // download file from URL
    browser.url(downloadUrl)
    var downloadFilePath = fs_session.checkDownloadFile(fileName, fileExt);
    expect(downloadFilePath).toContain(fileName + '.' + fileExt);
    // pass download Url for steps after
    this.downloadUrl = downloadUrl;
});

When(/^(?::screen: )?I drag "([^"]*)" and drop to "([^"]*)"$/,
function (imageNameOne, imageNameTwo) {
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

    var locationOne = JSON.parse(screen_session.screenFindImage(imagePathListOne, imageSimilarityOne, maxSimilarityOrTextOne));
    expect(locationOne.length).not.toEqual(0, `can not locate the "${imageNameOne}" image on the screen`);
    var locationTwo = JSON.parse(screen_session.screenFindImage(imagePathListTwo, imageSimilarityTwo, maxSimilarityOrTextTwo));
    expect(locationTwo.length).not.toEqual(0, `can not locate the "${imageNameTwo}" image on the screen`);
    screen_session.drag_and_drop(locationOne[0].center, locationTwo[0].center);
    browser.pause(1000);
});


When(/^(?::screen: )?I (circle|click|expect|park|hover|shake|wave) mouse(?: (\d+) times)? at the (center|centerLeft|centerRight|bottomCenter|bottomLeft|bottomRight|previous|topCenter|topLeft|topRight|\d+,\d+) position of the screen$/,
{ timeout: 60 * 1000 },
function (mouseAction, timesCount, screenLocation) {
    const myDISPLAYSIZE = process.env.DISPLAYSIZE;
    const [myScreenX, myScreenY] = myDISPLAYSIZE.split('x');
    var targetLocation = { x: 0, y: 0 };
    switch (screenLocation) {
        case 'center':
            targetLocation = { x: myScreenX / 2, y: myScreenY / 2 };
            break;
        case 'centerLeft':
            targetLocation = { x: 0, y: myScreenY / 2 };
            break;
        case 'centerRight':
            targetLocation = { x: myScreenX, y: myScreenY / 2 };
            break;
        case 'bottomCenter':
            targetLocation = { x: myScreenX / 2, y: myScreenY };
            break;
        case 'bottomLeft':
            targetLocation = { x: 0, y: myScreenY };
            break;
        case 'bottomRight':
            targetLocation = { x: myScreenX, y: myScreenY };
            break;
        case 'previous':
            const mousePos = JSON.parse(screen_session.getMousePos());
            targetLocation = { x: mousePos.x, y: mousePos.y };
            break;
        case 'topCenter':
            targetLocation = { x: myScreenX / 2, y: 0 };
            break;
        case 'topLeft':
            targetLocation = { x: 0, y: 0 };
            break;
        case 'topRight':
            targetLocation = { x: myScreenX, y: 0 };
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
                const delta_50 = 50 / Math.sqrt(2);
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

When(/^(?::screen: )?I wait (?:(?:every (\d+) seconds for )?(\d+) minute(?:s)? )?on (?:the (first|last) (\d+) line(?:s)? of )?the (?:"([^"]*)?" image|screen area) to( not)* display the (text|regex) "(.*)?"$/,
{ timeout: 60 * 60 * 1000 },
function (waitIntvSec, waitTimeoutMnt, firstOrLast, lineCount, targetName, falseState, expectType, expectedText) {
    // parse input
    const myExpectedText = parseExpectedText(expectedText);
    const myWaitTimeoutMnt = parseInt(waitTimeoutMnt) || 1;
    const myWaitIntvSec = parseInt(waitIntvSec) || 5;

    // process target before check
    var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
    if (targetName) {
        const parsedTargetName = parseExpectedText(targetName);
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = fs_session.getTestImageParms(parsedTargetName);
        if (imageFileName.includes('Screen')) {
            imagePathList = imageFileName;
        } else {
            imagePathList = fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        }
        imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedTargetName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
    }

    // process wait and timeout condition
    var boolFalseState = !!falseState;
    var keepWaiting = true;
    var timeOut = false;
    var handle = setInterval(() => {
        console.log(`wait timeout: ${targetName}, ${myWaitTimeoutMnt} minute(s)`);
        timeOut = true;
    }, myWaitTimeoutMnt * 60 * 1000);

    // wait and check loop
    var screenFindResult;
    do {
        // wait
        browser.pause(myWaitIntvSec * 1000)
        // check
        if (targetName) {
            screenFindResult = JSON.parse(screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
        } else {
            screenFindResult = JSON.parse(screen_session.screenGetText());
        }
        this.lastSeen_screenFindResult = screenFindResult;
        let lineArray = screenFindResult[0].text;
        var lineText;
        switch (firstOrLast) {
            case 'first':
                lineText = lineArray.slice(0, lineCount).join('\n');
                break;
            case 'last':
                lineText = lineArray.slice(-lineCount).join('\n');
                break;
            default:
                lineText = lineArray.join('\n');
                break;
        }
        switch (expectType) {
            case 'regex':
                let myRegex = new RegExp(myExpectedText, 'i');
                keepWaiting = !lineText.match(myRegex);
                break;
            case 'text':
            default:
                keepWaiting = !lineText.includes(myExpectedText);
                break;
        }
        if (boolFalseState) {
            keepWaiting = !keepWaiting;
        }
        // loop decision
        console.log(`lineText: ${lineText}`);
        console.log(`expectedText: ${myExpectedText}`);
        console.log(`keepWaiting: ${keepWaiting}`);
    } while (keepWaiting && !timeOut)

    // clear timeout
    clearInterval(handle);
});


When(/^(?::screen: )?I (click|hoverClick|rightClick|doubleClick|hover|wave|shake|circle)(?: (\d+) times)? (on|between) the "([^"]*)" image(?: and the "([^"]*)" image)? on the screen$/,
{ timeout: 60 * 1000 },
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
                        const delta_50 = 50 / Math.sqrt(2);
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
                        const delta_50 = 50 / Math.sqrt(2);
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
