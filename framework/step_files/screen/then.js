const { Then } = require('cucumber');

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const parseExpectedText = require(FrameworkPath + '/framework/step_functions/common/parseExpectedText');
const textedElements = require(FrameworkPath + '/framework/testfiles/textedElements');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const fs_session = require(FrameworkPath + '/framework/libs/fs_session');
const fuzz = require('fuzzball');

Then(/^I expect the( last)* browser console log should( not)* contain "([^"]*)" words$/,
function (last, falseCase, regexWords) {
    const myRegexWords = regexWords.toLowerCase();
    const anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    const msgRegex = (myRegexWords.indexOf('any error') >= 0) ? RegExp(anyRegexWords) : RegExp(myRegexWords);
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.getLogs('browser').filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
    if (falseCase) {
        expect(targetLogArray.length).not.toBeGreaterThan(0);
    } else {
        expect(targetLogArray.length).toBeGreaterThan(0);
    }
});

Then(/^I expect the( last)* browser console (SEVERE) level log does( not)* exist(?: (exactly|not exactly|more than|no more than|less than|at least|no less than) (\d+) time(?:s)?)?$/,
function (last, logLevel, falseCase, compareAction, expectedNumber) {
    const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
    const targetLogArray = (last) ? JSON.parse(process.env.LastBrowserLog) : browser.getLogs('browser').filter(log => log.level == logLevel);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);

    if (!!false) {
        expect(compareAction).not.toContain('no', 'do not support double negative statement');
        expect(compareAction).not.toContain('at least', 'do not support no at least statement');
        switch (compareAction) {
            case 'exactly':
                expect(targetLogArray.length).not.toEqual(parseInt(myExpectedNumber));
                break;
            case 'more than':
                expect(targetLogArray.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'less than':
                expect(targetLogArray.length).not.toBeLessThan(parseInt(myExpectedNumber));
                break;
        }
    } else {
        switch (compareAction) {
            case 'exactly':
                expect(targetLogArray.length).toEqual(parseInt(myExpectedNumber));
                break;
            case 'not exactly':
                expect(targetLogArray.length).not.toEqual(parseInt(myExpectedNumber));
                break;
            case 'more than':
                expect(targetLogArray.length).toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'no more than':
                expect(targetLogArray.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
                break;
            case 'less than':
                expect(targetLogArray.length).toBeLessThan(parseInt(myExpectedNumber));
                break;
            case 'at least':
            case 'no less than':
                expect(targetLogArray.length).not.toBeLessThan(parseInt(myExpectedNumber));
                break;
        }
    }
});

Then(/^I expect (?:that )?the "([^"]*)?" image does( not)* appear(?: (exactly|not exactly|more than|no more than|less than|no less than) (\d+) time(?:s)?)?$/,
{ timeout: 60 * 1000 },
function (imageName, falseCase, compareAction, expectedNumber) {
    const parsedImageName = parseExpectedText(imageName);
    const myExpectedNumber = (expectedNumber) ? parseInt(expectedNumber) : 0;
    const myCompareAction = compareAction || ((typeof falseCase == 'undefined') ? 'more than' : 'exactly');

    var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText;
    var imagePathList, expectedImageSimilarity, expectedImageNumberMax;
    var screenFindResult;

    if (imageName && imageName == 'last-seen') {
        screenFindResult = this.lastSeen_screenFindResult;
    } else {
        [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = fs_session.getTestImageParms(parsedImageName);
        imagePathList = fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
        expectedImageSimilarity = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedImageName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
        expectedImageNumberMax = myExpectedNumber;
        screenFindResult = JSON.parse(screen_session.screenFindAllImages(imagePathList, expectedImageSimilarity, maxSimilarityOrText, null, null, expectedImageNumberMax));
    }
    this.lastSeen_screenFindResult = screenFindResult;
    if (screenFindResult.length == 0) {
        console.log('expected image does not show on screen');
    } else {
        console.log(screenFindResult);
    }
    switch (myCompareAction) {
        case 'exactly':
            expect(screenFindResult.length).toEqual(parseInt(myExpectedNumber));
            break;
        case 'not exactly':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toEqual(parseInt(myExpectedNumber));
            break;
        case 'more than':
            expect(screenFindResult.length).toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'no more than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toBeGreaterThan(parseInt(myExpectedNumber));
            break;
        case 'less than':
            expect(screenFindResult.length).toBeLessThan(parseInt(myExpectedNumber));
            break;
        case 'no less than':
            expect(typeof falseCase === 'undefined').toBe(true, 'cannot use double negative expression');
            expect(screenFindResult.length).not.toBeLessThan(parseInt(myExpectedNumber));
            break;
    }
});

Then(/^I expect (?:that )?(?:the( first| last)? (\d+)(?:st|nd|rd|th)? line(?:s)? of )?the (?:"([^"]*)?" )?(image|screen area) does( not)* (contain|equal|mimic|match) the (text|regex) "(.*)?"$/,
    { timeout: 60 * 1000 },
    function (firstOrLast, lineCount, targetName, targetArea, falseCase, compareAction, expectType, expectedText) {
        const myExpectedText = parseExpectedText(expectedText);
        const myFirstOrLast = firstOrLast || '';

        var imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText, imagePathList, imageScore;
        var screenFindResult;
        if (targetName && targetName == 'last-seen') {
            screenFindResult = this.lastSeen_screenFindResult;
        } else if (targetName && targetArea == 'image') {
            const parsedTargetName = parseExpectedText(targetName);
            [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = fs_session.getTestImageParms(parsedTargetName);
            if (imageFileName.includes('Screen')) {
                imagePathList = imageFileName;
            } else {
                imagePathList = fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
            }
            imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedTargetName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
            screenFindResult = JSON.parse(screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
        } else {
            screenFindResult = JSON.parse(screen_session.screenGetText());
        }
        this.lastSeen_screenFindResult = screenFindResult;

        let lineArray = screenFindResult[0].text;
        var lineText;
        switch (myFirstOrLast.trim()) {
            case 'first':
                lineText = lineArray.slice(0, lineCount).join('\n');
                break;
            case 'last':
                lineText = lineArray.slice(-lineCount).join('\n');
                break;
            default:
                if (lineCount) {
                    lineText = lineArray[lineCount - 1];
                } else {
                    lineText = lineArray.join(' ');
                }
        }

        const mimicScore = (myExpectedText && myExpectedText.length > 0) ? fuzz.partial_ratio(lineText, myExpectedText) : 100;

        if (screenFindResult.length == 0) {
            console.log('expected image or text does not show on screen');
        } else {
            console.log(screenFindResult);
        }

        let boolFalseCase = !!falseCase;
        if (boolFalseCase) {
            switch (compareAction) {
                case 'contain':
                    expect(lineText).not.toContain(
                        myExpectedText,
                        `target image text should not contain the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'equal':
                    expect(lineText).not.toEqual(
                        myExpectedText,
                        `target image text should not equal the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'mimic':
                    expect(mimicScore).not.toBeGreaterThanOrEqual(60,
                        `target image text should not mimic the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'match':
                    expect(lineText.toLowerCase()).not.toMatch(
                        RegExp(myExpectedText.toLowerCase()),
                        `target image text should not match the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                default:
                    expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
            }
        } else {
            switch (compareAction) {
                case 'contain':
                    expect(lineText).toContain(
                        myExpectedText,
                        `target image text should contain the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'equal':
                    expect(lineText).toEqual(
                        myExpectedText,
                        `target image text should equal the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'mimic':
                    expect(mimicScore).toBeGreaterThanOrEqual(60,
                        `target image text should mimic the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                case 'match':
                    expect(lineText.toLowerCase()).toMatch(
                        RegExp(myExpectedText.toLowerCase()),
                        `target image text should match the ${expectType} ` +
                        `"${myExpectedText}"`
                    );
                    break;
                default:
                    expect(false).toBe(true, `compareAction ${compareAction} should be one of contain, equal or match`);
            }
        }
    }
);

Then(/^I should(?: still)?( not)* see the "([^"]*)" image on the screen$/, { timeout: 60 * 1000 }, function (falseCase, imageName) {
    const parsedImageName = parseExpectedText(imageName);
    const [imageFileName, imageFileExt, imageSimilarity, maxSimilarityOrText] = fs_session.getTestImageParms(parsedImageName);
    const imagePathList = fs_session.globalSearchImageList(__dirname, imageFileName, imageFileExt);
    const imageScore = this.lastSeen_screenFindResult && this.lastSeen_screenFindResult.name == parsedImageName ? (this.lastSeen_screenFindResult.score - 0.000001) : imageSimilarity;
    var screenFindResult = JSON.parse(screen_session.screenFindImage(imagePathList, imageScore, maxSimilarityOrText));
    console.log(screenFindResult);
    if (falseCase) {
        expect(screenFindResult.length).toEqual(0, `expect image ${parsedImageName} not on the screen but found.`);
    } else {
        expect(screenFindResult.length).not.toEqual(0, `expect image ${parsedImageName} on the screen but not found.`);
        this.lastSeen_screenFindResult = screenFindResult;
        // console.log(this.lastSeen_screenFindResult);
    }
});

Then(/^I should see the "([^"]*)" (button|label|option|modalDialog) on the page$/,
    { timeout: 60 * 1000 },
    function (elementText, elementName) {
        const targetElement = eval('textedElements.texted_' + elementName).replace('__TEXT__', elementText);
        browser.$(targetElement).waitForDisplayed(500);
        expect(browser.$(targetElement).isDisplayed()).toBe(true);
    });

Then(/^the "([^"]*)" modal\-dialoag should contain these select\-option$/, { timeout: 60 * 1000 }, function (modalText, table) {
    const web_selectors = this.web_selectors;
    const seleniumPage_selectors = this.seleniumPage_selectors;
    const myModalDialog = seleniumPage_selectors.texted_modalDialog.replace('__TEXT__', modalText);
    const myModalDialog_select = myModalDialog + web_selectors.select;
    var expected_browserList = table.hashes();
    var displayed_browserList = browser.$(myModalDialog_select).getText();
    browser.$(myModalDialog_select).click();
    expected_browserList.forEach(function (row) {
        expect(displayed_browserList).toContain(row['browser_name']);
    });
});


