#!/usr/bin/env node

// java-bridge replaces node-java (JNI); set JVM options up front so they apply
// before the JVM is started by the first class import/call below.
const java = require('java-bridge');
java.ensureJvm({ opts: ['-Xms128m', '-Xmx512m'] });

const path = require('path');
const minimist = require('minimist');

// all external env vars should be parsed or quoted to const
process.env.imageSimilarity = parseFloat(process.env.imageSimilarity) || 0.8;
process.env.imageWaitTime = parseInt(process.env.imageWaitTime) || 1;
process.env.OMP_THREAD_LIMIT = parseInt(process.env.OMP_THREAD_LIMIT) || 1;
const myDISPLAY = ':' + (process.env.DISPLAY ? parseInt(process.env.DISPLAY.split(':')[1]) : 1);

// needed for Tesseract-OCR property
process.env.LC_ALL = 'C';
process.env.LC_CTYPE = 'C';

// Determine Oculix JAR location: seam/lib/oculixapi-<VER>-linux.jar
// Allow overriding version via OCULIX_VER env (set at build time)
const OCULIX_VER = process.env.OCULIX_VER || '4.0.0';
const jarPath = path.join(__dirname, '..', 'lib', `oculixapi-${OCULIX_VER}-linux.jar`);

// Load the Oculix classes. If this fails we still emit a JSON error object so the
// frozen CLI contract (stdout JSON) is never violated.
let App, Button, ImagePath, Mouse, OCR, Pattern, Region, Settings, Screen, Thread;
try {
  java.classpath.append(jarPath);
  App = java.importClass('org.sikuli.script.App');
  Button = java.importClass('org.sikuli.script.Button');
  ImagePath = java.importClass('org.sikuli.script.ImagePath');
  Mouse = java.importClass('org.sikuli.script.Mouse');
  OCR = java.importClass('org.sikuli.script.OCR');
  Pattern = java.importClass('org.sikuli.script.Pattern');
  Region = java.importClass('org.sikuli.script.Region');
  Settings = java.importClass('org.sikuli.basics.Settings');
  Screen = java.importClass('org.sikuli.script.Screen');
  Thread = java.importClass('java.lang.Thread');
} catch (e) {
  const msg = (e && e.message) ? e.message : String(e);
  console.log(`target_result: ${JSON.stringify([{status: 'error', message: `Failed to load Oculix JAR at ${jarPath}: ${msg}`}])}`);
  process.exit(0);
}

// All args are used as plain JS values (we never build a shell command line here),
// so they must NOT be shell-quoted.
const argv = minimist(process.argv.slice(2));
const str = (v, dflt) => (v != null && v !== 'undefined') ? String(v) : dflt;

const imagePath = str(argv.imagePath, 'Screen');
const imageSimilarity = parseFloat(str(argv.imageSimilarity, String(process.env.imageSimilarity || 0.8)));
const maxSim = parseFloat(str(argv.maxSim, '1'));
const textHint = str(argv.textHint, '');
const imageAction = str(argv.imageAction, 'none');
const imageWaitTime = parseInt(str(argv.imageWaitTime, String(process.env.imageWaitTime || 1)));
const imageMaxCount = parseInt(str(argv.imageMaxCount, '1'));
const flashSecs = (argv.flash != null && argv.flash !== 'undefined') ? parseFloat(argv.flash) : 1.0;

// OCR-specific arguments (all opt-in). ocrPath === null means "image matching mode".
const ocrPath = (argv.ocrPath != null && argv.ocrPath !== 'undefined') ? String(argv.ocrPath) : null;
const ocrSimilarity = parseFloat(str(argv.ocrSimilarity, '0.8'));
const ocrMaxSim = parseFloat(str(argv.ocrMaxSim, '1.0'));
const ocrWaitTime = parseInt(str(argv.ocrWaitTime, '1000'));
const ocrMaxCount = parseInt(str(argv.ocrMaxCount, '1'));
const ocrAction = str(argv.ocrAction, 'none');
const ocrDetail = str(argv.ocrDetail, 'none'); // none | line | word
const ocrPSM = parseInt(str(argv.ocrPSM, '7'));
const ocrOEM = parseInt(str(argv.ocrOEM, '3'));

// default output
const notFoundStatus = {status: 'notFound'};

// Flash the found region. Under Oculix/java-bridge Region.highlight() is
// fire-and-forget (paints on a background thread and returns immediately), so if
// this process calls process.exit() right after, the red box is torn down before
// it ever paints. Flash for a visible duration and hold the process so the box
// actually renders.
const flashOnMatch = (region) => {
  region.highlight();
  Thread.sleep(Math.round(flashSecs * 1000));
};

// Map a Region/rectangle-like object to the {location,dimension,center} triple.
const fillRectangleInfo = (rectItem) => {
  const location = {x: rectItem.x, y: rectItem.y};
  const dimension = {width: rectItem.w, height: rectItem.h};
  const center = {x: rectItem.x + Math.round(rectItem.w / 2), y: rectItem.y + Math.round(rectItem.h / 2)};
  return [location, dimension, center];
};

// Perform a mouse action on a rectangle-like object. Returns true when the action
// actually clicks (so the caller knows whether to record `clicked`).
const performAction = (rect, action) => {
  if (!action || action === 'none' || action === 'null') return false;
  const clickRegion = new Region(rect.x, rect.y, rect.w, rect.h);
  clickRegion.mouseUpSync();
  let didClick = false;
  switch (action) {
    case 'single':
    case 'click':
      if (myDISPLAY.split(':')[1] > 9) {
        clickRegion.doubleClick();
      } else {
        clickRegion.click();
      }
      didClick = true;
      break;
    case 'hoverClick':
      clickRegion.hoverSync();
      if (myDISPLAY.split(':')[1] > 9) {
        clickRegion.doubleClick();
      } else {
        clickRegion.click();
      }
      didClick = true;
      break;
    case 'double':
    case 'doubleClick':
      clickRegion.doubleClick();
      didClick = true;
      break;
    case 'right':
    case 'rightClick':
      clickRegion.rightClick();
      didClick = true;
      break;
    case 'hover':
      clickRegion.hoverSync();
      break;
  }
  clickRegion.mouseUpSync();
  return didClick;
};

// ---------------------------------------------------------------------------
// Image-matching mode (the frozen original behaviour)
// ---------------------------------------------------------------------------
const findImage = (imagePath, imageSimilarity, maxSim, textHint, imageWaitTime, imageAction, imageMaxCount) => {
  const myImagePath = imagePath;
  const myImageName = myImagePath.substring(myImagePath.lastIndexOf('/') + 1);
  const myImageSimilarity = parseFloat(imageSimilarity);
  const myMaxSim = parseFloat(maxSim);
  const myTextHint = textHint;
  const myImageWaitTime = parseInt(imageWaitTime);
  const myImageAction = imageAction;
  const myImageMaxCount = parseInt(imageMaxCount || 1);

  const findRegion = new Screen();
  findRegion.setAutoWaitTimeout(myImageWaitTime);

  let returnArray = [];
  try {
    var oneTarget;
    var returnItem = {name: myImageName, score: null, text: null, location: null, dimension: null, center: null, clicked: null};
    if (myImagePath.includes('Screen')) {
      const screenMargin = myImagePath.includes('-') ? parseInt(myImagePath.split('-')[1]) : 1;
      oneTarget = new Region(findRegion.getBoundsSync()).growSync(-screenMargin);
      returnItem.text = oneTarget.textSync().split('\n');
      [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(oneTarget);
      flashOnMatch(oneTarget);
      returnArray.push(returnItem);
    } else {
      const oneSample = (new Pattern(myImagePath)).similarSync(myImageSimilarity);
      const findTargets = findRegion.findAllSync(oneSample);
      const myRegex = new RegExp(myTextHint, 'i');
      var matchCount = 0;
      while (matchCount < myImageMaxCount && findTargets.hasNextSync()) {
        const oneMatch = findTargets.nextSync();
        returnItem.score = Math.floor(oneMatch.getScoreSync()*1000000)/1000000;
        [returnItem.location, returnItem.dimension, returnItem.center] = fillRectangleInfo(oneMatch);
        oneTarget = new Region(oneMatch);
        returnItem.text = oneTarget.textSync().split('\n');
        if (returnItem.score >= myImageSimilarity && returnItem.score <= myMaxSim && returnItem.text.join('\n').match(myRegex)) {
          matchCount += 1;
          flashOnMatch(oneTarget);
          returnArray.push(returnItem);
        }
      }
    }
    if (returnArray.length == 0) {
      returnArray.push(notFoundStatus);
    } else if (myImageAction && myImageAction != 'none' && myImageAction != 'null') {
      for (let i=0; i<returnArray.length; i++) {
        const r = {x: returnArray[i].location.x, y: returnArray[i].location.y, w: returnArray[i].dimension.width, h: returnArray[i].dimension.height};
        performAction(r, myImageAction);
        returnArray[i].clicked = returnArray[i].center;
      }
    }
  } catch(e) {
    const msg = (e && typeof e.getMessageSync === 'function') ? e.getMessageSync() : (e && e.message ? e.message : String(e));
    console.log('findTargetImage ERROR:', msg);
    returnArray.push(notFoundStatus);
  } finally {
    return JSON.stringify(returnArray);
  }
};

// ---------------------------------------------------------------------------
// OCR mode (opt-in; no image template required)
//
// The screen is OCR'd in place — no raster copy is made. Region.findText() gives a
// tight box when the Oculix build exposes it; otherwise we confirm the requested
// text is present in the screen text and report the screen rectangle (the centre
// is still a valid click point).
// ---------------------------------------------------------------------------
const findImageOcr = (ocrPath, ocrSimilarity, ocrMaxSim, ocrWaitTime, ocrMaxCount, ocrAction, ocrDetail, ocrPSM, ocrOEM) => {
  const waitStart = Date.now();
  const results = [];

  try {
    Settings.OcrPSM = ocrPSM;
    Settings.OcrOEM = ocrOEM;
  } catch (e) { /* older Oculix builds do not expose these knobs */ }

  while (Date.now() - waitStart < ocrWaitTime) {
    let rect = null, text = ocrPath, conf = null;

    try {
      const findRegion = new Screen();
      const screenRegion = new Region(findRegion.getBoundsSync());
      const region = new Region(0, 0, screenRegion.w, screenRegion.h);

      let tight = null;
      try {
        tight = region.findText(ocrPath, ocrSimilarity);
      } catch (e) {
        tight = null;
      }

      if (tight) {
        rect = {x: tight.getX(), y: tight.getY(), w: tight.getW(), h: tight.getH()};
        conf = tight.getScore();
        text = tight.getText();
      } else {
        const needle = String(ocrPath).toLowerCase();
        const lines = region.textSync().split('\n');
        if (!lines.some((l) => String(l).toLowerCase().includes(needle))) {
          Thread.sleep(50);
          continue;
        }
        rect = {x: screenRegion.x, y: screenRegion.y, w: screenRegion.w, h: screenRegion.h};
        conf = 1.0;
      }
    } catch (e) {
      const msg = (e && typeof e.getMessageSync === 'function') ? e.getMessageSync() : (e && e.message ? e.message : String(e));
      console.log('findTargetImage ERROR:', msg);
      return JSON.stringify([notFoundStatus]);
    }

    const details = [];
    if (ocrDetail === 'line' || ocrDetail === 'word') {
      details.push({text: text, x: rect.x, y: rect.y, width: rect.w, height: rect.h, confidence: conf});
    }

    const result = {
      name: text,
      score: conf,
      text: [text],
      location: {x: rect.x, y: rect.y, width: rect.w, height: rect.h},
      dimension: {width: rect.w, height: rect.h},
      center: {x: rect.x + Math.round(rect.w/2), y: rect.y + Math.round(rect.h/2)},
      clicked: null,
      ...(ocrDetail !== 'none' ? {ocrDetails: details} : {})
    };

    if (performAction(rect, ocrAction)) {
      result.clicked = result.center;
    }

    results.push(result);
    if (results.length >= ocrMaxCount) break;
    Thread.sleep(50);
  }

  if (results.length === 0) {
    return JSON.stringify([notFoundStatus]);
  }
  return JSON.stringify(results);
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
let target_result;
if (ocrPath !== null) {
  target_result = findImageOcr(ocrPath, ocrSimilarity, ocrMaxSim, ocrWaitTime, ocrMaxCount, ocrAction, ocrDetail, ocrPSM, ocrOEM);
} else {
  target_result = findImage(imagePath, imageSimilarity, maxSim, textHint, imageWaitTime, imageAction, imageMaxCount);
}

// display result to stdout
console.log(`target_result: ${target_result}`);
process.exit();
