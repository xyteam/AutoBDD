#!/usr/bin/env node
//
// findTargetImage — locate a target on screen (a picture, or text), optionally act on it.
// Writes exactly one line to stdout:  target_result: <json array>
//
// Design note: the discovery questions (--help/--version/--list) and all argument
// validation are answered BEFORE the JVM and the native engine are started, so asking
// what this tool does costs ~10 ms instead of a 3 s whole-screen OCR scan. That matters
// for a human meeting the tool for the first time and for an agent probing it.

const path = require('path');
const fs = require('fs');
const minimist = require('minimist');

// ---------------------------------------------------------------------------
// flag catalogue — the single source for --help, --list and unknown-flag detection
// ---------------------------------------------------------------------------
const FLAGS = [
  ['--match-image=<file>',   '—',      'the target picture; "Screen" reads the whole screen'],
  ['--match-text=<text>',    '—',      'the target text; with --match-image it gates the matched region'],
  ['--match-regex',          'off',    'treat --match-text as a regular expression (default: literal)'],
  ['--min-score=<0-1>',      '0.8',    'minimum match score (floor)'],
  ['--max-score=<0-1>',      '1',      'maximum accepted score (ceiling)'],
  ['--wait=<dur>',           '1s',     'wait up to this long for the target (5s, 800ms; bare = seconds)'],
  ['--limit=<n>',            '1',      'return/act on at most n matches'],
  ['--flash=<dur>',          '1s',     'on-screen match flash; --flash=0s disables the pause'],
  ['--click',                'off',    'click the centre of the match'],
  ['--double-click',         'off',    'double-click the centre'],
  ['--right-click',          'off',    'right-click the centre'],
  ['--hover',                'off',    'hover over the centre (combine with --click to hover then click)'],
  ['--box[=<level>]',        'off',    'include the matched box (none|line|word)'],
  ['--psm=<n>',              '7',      'Tesseract page segmentation mode'],
  ['--oem=<n>',              '3',      'Tesseract OCR engine mode'],
];

// v1 names, still accepted and translated (docs/CONTRACT.md §2b)
const LEGACY = [
  ['--imagePath', '--match-image'], ['--ocrPath', '--match-text'],
  ['--textHint', '--match-text --match-regex'],
  ['--imageSimilarity', '--min-score'], ['--ocrSimilarity', '--min-score'],
  ['--maxSim', '--max-score'], ['--ocrMaxSim', '--max-score'],
  ['--imageWaitTime', '--wait'], ['--ocrWaitTime', '--wait'],
  ['--imageMaxCount', '--limit'], ['--ocrMaxCount', '--limit'],
  ['--imageAction', '--click|--double-click|--right-click|--hover'],
  ['--ocrAction', '--click|--double-click|--right-click|--hover'],
  ['--ocrDetail', '--box'], ['--ocrPSM', '--psm'], ['--ocrOEM', '--oem'],
];

const FLOWS = [
  ['read the whole screen as text', 'autobdd read-text'],
  ['find a picture on screen',      'autobdd find-target --match-image=logo.png'],
  ['find a picture, gated on text', 'autobdd find-target --match-image=card.png --match-text=Total'],
  ['find text on screen',           'autobdd find-target --match-text="Submit" --box'],
  ['find a picture, then click it', 'autobdd find-target --match-image=logo.png --click'],
  ['find several matches',          'autobdd find-target --match-image=tile.png --limit=2'],
  ['hover, then click',             'autobdd find-target --match-image=logo.png --hover --click'],
];

const KNOWN = new Set(
  FLAGS.map((f) => f[0].replace(/^--/, '').split('=')[0])
    .concat(LEGACY.map((l) => l[0].replace(/^--/, '')))
    .concat(['help', 'h', 'version', 'list'])
);
const ACTIONS = new Set(['none', 'click', 'single', 'hover', 'hoverClick', 'double', 'doubleClick', 'right', 'rightClick']);
const DETAILS = new Set(['none', 'line', 'word']);

const argv = minimist(process.argv.slice(2));
const str = (v, dflt) => (v != null && v !== 'undefined') ? String(v) : dflt;
const pad = (a, b) => a + ' '.repeat(Math.max(1, b - a.length));

function usage() {
  const rows = FLAGS.map(([f, d, desc]) => `  ${pad(f, 26)} ${pad(d, 8)} ${desc}`).join('\n');
  return `findTargetImage — locate a target on screen (a picture, or text), optionally act on it

USAGE
  findTargetImage [--<flag>=<value> ...]

FLOWS
${FLOWS.map(([what, cmd]) => `  ${pad(what, 32)} ${cmd}`).join('\n')}

OUTPUT (stdout, exactly one line)
  target_result: <json array>
  a match   -> {name, score, text[], location, dimension, center, clicked}
  no match  -> [{"status":"notFound"}]
  a fault   -> [{"status":"error","message":"..."}]

DISCOVERY
  --help | -h     this text          --list          the flows above, one per line
  --version       what is running

EXIT STATUS
  0   a result was produced (including notFound; parse the JSON to branch)
  2   usage error — an unparseable number or an unknown action/level

KNOWN GAPS
  --min-score is applied to image matches; the OCR path exposes no per-match
  confidence to filter on, so it is accepted but not applied for text targets.
  --box reports the matched region, not one entry per token.
  --box reports the matched region, not one entry per token.

DEPRECATED (translated, with a warning on stderr)
${LEGACY.map(([o, n]) => `  ${pad(o, 26)} -> ${n}`).join('\n')}

FLAGS
${rows}
`;
}

function printList() { process.stdout.write(FLOWS.map(([what, cmd]) => `${cmd}\n    # ${what}\n`).join('')); }

function version() {
  const stamp = (key, dflt) => {
    try { return (fs.readFileSync('/etc/autobdd-versions', 'utf8').match(new RegExp('^' + key + '=(.*)$', 'm')) || [])[1] || dflt; }
    catch (e) { return dflt; }
  };
  return `autobdd — AutoBDD base image
version: ${stamp('version', 'unknown')}
image  : built ${stamp('built', 'unknown')}
oculix : ${stamp('oculix', process.env.OCULIX_VER || '4.0.0')}
node   : ${process.version}
`;
}

function die(msg) { process.stderr.write(`findTargetImage: ${msg}\n`); process.exit(2); }

// --- discovery, answered before the JVM starts -------------------------------------
if (argv.help != null || argv.h != null) { process.stdout.write(usage()); process.exit(0); }
if (argv.version != null) { process.stdout.write(version()); process.exit(0); }
if (argv.list != null) { printList(); process.exit(0); }

// --- unknown flags warn but do not fail: the argument surface is additive -----------
const unknown = Object.keys(argv).filter((k) => k !== '_' && !KNOWN.has(k));
if (unknown.length) {
  process.stderr.write(`findTargetImage: warning: ignoring unknown argument(s): ${unknown.map((k) => '--' + k).join(' ')} (see --help)\n`);
}

// --- validate anything that would otherwise fail silently ---------------------------
const num = (flag, raw, dflt) => {
  if (raw == null || raw === 'undefined') return dflt;
  const v = Number(raw);
  if (!isFinite(v)) die(`${flag} expects a number, got '${raw}'`);
  return v;
};
const oneOf = (flag, raw, set, dflt) => {
  if (raw == null || raw === 'undefined') return dflt;
  const v = String(raw);
  if (!set.has(v)) die(`${flag} expects one of ${[...set].join('|')}, got '${v}'`);
  return v;
};

// all external env vars should be parsed or quoted to const
process.env.imageSimilarity = parseFloat(process.env.imageSimilarity) || 0.8;
process.env.imageWaitTime = parseInt(process.env.imageWaitTime) || 1;
process.env.OMP_THREAD_LIMIT = parseInt(process.env.OMP_THREAD_LIMIT) || 1;
const myDISPLAY = ':' + (process.env.DISPLAY ? parseInt(process.env.DISPLAY.split(':')[1]) : 1);

// needed for Tesseract-OCR property
process.env.LC_ALL = 'C';
process.env.LC_CTYPE = 'C';

// Determine Oculix JAR location: seam/lib/oculixapi-<VER>-linux.jar
const OCULIX_VER = process.env.OCULIX_VER || '4.0.0';
const jarPath = path.join(__dirname, '..', 'lib', `oculixapi-${OCULIX_VER}-linux.jar`);

// java-bridge replaces node-java (JNI); set JVM options up front so they apply
// before the JVM is started by the first class import/call below.
const java = require('java-bridge');
java.ensureJvm({ opts: ['-Xms128m', '-Xmx512m'] });

// Load the Oculix classes. If this fails we still emit a JSON error object so the
// frozen CLI contract (stdout JSON) is never violated.
let App, Button, ImagePath, Mouse, OCR, Pattern, Region, Settings, Screen;
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
} catch (e) {
  const msg = (e && e.message) ? e.message : String(e);
  console.log(`target_result: ${JSON.stringify([{status: 'error', message: `Failed to load Oculix JAR at ${jarPath}: ${msg}`}])}`);
  process.exit(0);
}

// Synchronous sleep. java-bridge's static Thread.sleep() is a no-op here (measuring
// 0 ms for sleep(1000)), so blocking waits are done on the Node side with
// Atomics.wait — a genuine block that does not spin the CPU.
const _sleepBuf = new Int32Array(new SharedArrayBuffer(4));
const sleepMs = (ms) => { if (ms > 0) Atomics.wait(_sleepBuf, 0, 0, ms); };

// --- vocabulary ---------------------------------------------------------------------
// Canonical arguments are used as plain JS values (never shell-quoted). The v1 names are
// translated below, with one warning per name on stderr, so an existing consumer keeps
// working; stdout stays pure payload.
const has = (k) => argv[k] != null && argv[k] !== 'undefined';
const dep = (old, nu) => process.stderr.write(`findTargetImage: ${old} is deprecated — use ${nu}\n`);

// durations carry their unit (5s / 800ms); a bare number means seconds. Internally
// everything is milliseconds, which is what removes the old s-vs-ms split.
const dur = (flag, raw, dfltMs) => {
  if (raw == null || raw === 'undefined') return dfltMs;
  if (raw === true) die(`${flag} needs a value, e.g. ${flag}=5s`);
  const m = String(raw).trim().match(/^([0-9]*\.?[0-9]+)\s*(ms|s)?$/i);
  if (!m) die(`${flag} expects a duration like 5s or 800ms, got '${raw}'`);
  const n = parseFloat(m[1]);
  return (m[2] && m[2].toLowerCase() === 'ms') ? n : n * 1000;
};

// --- target ---------------------------------------------------------------------------
let matchImage = null, matchText = null, regexMode = false;
if (has('match-image')) matchImage = String(argv['match-image']);
if (has('match-text'))  matchText  = String(argv['match-text']);
if (has('match-regex')) regexMode = true;
if (has('imagePath')) { dep('--imagePath', '--match-image'); matchImage = String(argv.imagePath); }
if (has('ocrPath'))   { dep('--ocrPath', '--match-text');    matchText  = String(argv.ocrPath); }
if (has('textHint'))  { dep('--textHint', '--match-text --match-regex'); matchText = String(argv.textHint); regexMode = true; }

// --- scores ---------------------------------------------------------------------------
let minScore = has('min-score') ? num('--min-score', argv['min-score'], 0.8) : (parseFloat(process.env.imageSimilarity) || 0.8);
let maxScore = has('max-score') ? num('--max-score', argv['max-score'], 1) : 1;
if (has('imageSimilarity')) { dep('--imageSimilarity', '--min-score'); minScore = num('--imageSimilarity', argv.imageSimilarity, minScore); }
if (has('ocrSimilarity'))   { dep('--ocrSimilarity', '--min-score');   minScore = num('--ocrSimilarity', argv.ocrSimilarity, minScore); }
if (has('maxSim'))          { dep('--maxSim', '--max-score');          maxScore = num('--maxSim', argv.maxSim, maxScore); }
if (has('ocrMaxSim'))       { dep('--ocrMaxSim', '--max-score');       maxScore = num('--ocrMaxSim', argv.ocrMaxSim, maxScore); }

// --- wait (canonical: ms). Legacy --imageWaitTime was SECONDS, --ocrWaitTime was MS. ---
let waitMs = has('wait') ? dur('--wait', argv.wait, 1000) : null;
if (has('imageWaitTime')) { dep('--imageWaitTime', '--wait (seconds, e.g. 5s)'); waitMs = num('--imageWaitTime', argv.imageWaitTime, 1) * 1000; }
if (has('ocrWaitTime'))   { dep('--ocrWaitTime', '--wait (milliseconds, e.g. 800ms)'); waitMs = num('--ocrWaitTime', argv.ocrWaitTime, 1000); }
if (waitMs == null) waitMs = 1000;

// --- limit ----------------------------------------------------------------------------
let limit = has('limit') ? num('--limit', argv.limit, 1) : 1;
if (has('imageMaxCount')) { dep('--imageMaxCount', '--limit'); limit = num('--imageMaxCount', argv.imageMaxCount, limit); }
if (has('ocrMaxCount'))   { dep('--ocrMaxCount', '--limit');   limit = num('--ocrMaxCount', argv.ocrMaxCount, limit); }

// --- actions (composable flags; --hover --click means hover then click) ---------------
let action = 'none';
if (has('hover') && has('click')) action = 'hoverClick';
else if (has('click')) action = 'click';
else if (has('double-click')) action = 'doubleClick';
else if (has('right-click')) action = 'rightClick';
else if (has('hover')) action = 'hover';
const legacyAct = has('imageAction') ? 'imageAction' : (has('ocrAction') ? 'ocrAction' : null);
if (legacyAct) {
  dep(`--${legacyAct}`, '--click|--double-click|--right-click|--hover');
  const v = oneOf(`--${legacyAct}`, argv[legacyAct], ACTIONS, 'none');
  action = (v === 'single') ? 'click' : v;          // 'single' was a click alias
}

// --- output detail --------------------------------------------------------------------
let ocrDetail = 'none';
if (has('box')) ocrDetail = (argv.box === true) ? 'line' : oneOf('--box', argv.box, DETAILS, 'line');
if (has('ocrDetail')) { dep('--ocrDetail', '--box'); ocrDetail = oneOf('--ocrDetail', argv.ocrDetail, DETAILS, 'none'); }

// --- tesseract knobs ------------------------------------------------------------------
let psm = has('psm') ? num('--psm', argv.psm, 7) : 7;
let oem = has('oem') ? num('--oem', argv.oem, 3) : 3;
if (has('ocrPSM')) { dep('--ocrPSM', '--psm'); psm = num('--ocrPSM', argv.ocrPSM, psm); }
if (has('ocrOEM')) { dep('--ocrOEM', '--oem'); oem = num('--ocrOEM', argv.ocrOEM, oem); }

// --- flash ----------------------------------------------------------------------------
const flashSecs = (has('flash') ? dur('--flash', argv.flash, 1000) : 1000) / 1000;

// --- map the canonical options onto the engine's internal variables -------------------
// The image and text paths below are unchanged; only these values differ from before.
const imagePath = matchImage;
const ocrPath = matchImage ? null : matchText;        // text search only when no picture
const imageSimilarity = minScore;
const maxSim = maxScore;
const imageAction = action;
const imageWaitTime = waitMs / 1000;                  // the image path takes seconds
const imageMaxCount = limit;
const ocrSimilarity = minScore;
const ocrMaxSim = maxScore;
const ocrWaitTime = waitMs;                           // the text path takes milliseconds
const ocrMaxCount = limit;
const ocrAction = action;
const ocrPSM = psm;
const ocrOEM = oem;
// A text gate on an image match: literal by default (regex metacharacters escaped),
// regex only when asked for — so a phrase containing ':' or '(' cannot silently change
// meaning. --textHint keeps today's regex semantics via the legacy path above.
const textHint = matchText
  ? (regexMode ? matchText : matchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  : '';

// default output
const notFoundStatus = {status: 'notFound'};

// Flash the found region. Under Oculix/java-bridge Region.highlight() is
// fire-and-forget (paints on a background thread and returns immediately), so if
// this process calls process.exit() right after, the red box is torn down before
// it ever paints. Flash for a visible duration and hold the process so the box
// actually renders.
const flashOnMatch = (region) => {
  region.highlight();
  sleepMs(Math.round(flashSecs * 1000));
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
  // Move to the region centre first. Region.click()/doubleClick()/rightClick() do not
  // reposition the pointer in this Oculix build, so without this the action would be
  // dispatched somewhere other than the reported centre — hoverSync() does move it.
  const centre = {x: Math.round(rect.x + rect.w / 2), y: Math.round(rect.y + rect.h / 2)};
  clickRegion.hoverSync();
  clickRegion.mouseUpSync();
  let didClick = false;
  switch (action) {
    case 'single':
    case 'click':
      clickRegion.click();
      didClick = true;
      break;
    case 'hoverClick':
      clickRegion.click();
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
      break;   // hoverSync() above already moved the pointer
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

  let returnArray = [];
  try {
    // Screen construction can fail transiently (display not ready / X hiccup). It
    // must live inside the try so the CLI still emits its JSON instead of dying
    // before printing — the frozen contract guarantees stdout carries a result.
    const findRegion = new Screen();
    findRegion.setAutoWaitTimeout(myImageWaitTime);

    if (myImagePath.includes('Screen')) {
      const screenMargin = myImagePath.includes('-') ? parseInt(myImagePath.split('-')[1]) : 1;
      const oneTarget = new Region(findRegion.getBoundsSync()).growSync(-screenMargin);
      const item = {name: myImageName, score: null, text: oneTarget.textSync().split('\n'),
                    location: null, dimension: null, center: null, clicked: null};
      [item.location, item.dimension, item.center] = fillRectangleInfo(oneTarget);
      flashOnMatch(oneTarget);
      returnArray.push(item);
    } else {
      const oneSample = (new Pattern(myImagePath)).similarSync(myImageSimilarity);
      const myRegex = new RegExp(myTextHint, 'i');
      // SikuliX's autoWaitTimeout applies to exists()/wait(), not to findAll(), so the
      // documented --imageWaitTime (seconds) is honoured here by retrying the search
      // until the deadline. Without this, a target that appears late is missed even
      // though the caller asked to wait for it.
      const deadline = Date.now() + (Math.max(myImageWaitTime, 0) * 1000);
      const collect = () => {
        const found = [];
        const findTargets = findRegion.findAllSync(oneSample);
        while (found.length < myImageMaxCount && findTargets.hasNextSync()) {
          const oneMatch = findTargets.nextSync();
          const score = Math.floor(oneMatch.getScoreSync()*1000000)/1000000;
          if (score < myImageSimilarity || score > myMaxSim) continue;
          const oneTarget = new Region(oneMatch);
          const text = oneTarget.textSync().split('\n');
          if (!text.join('\n').match(myRegex)) continue;
          // A fresh object per match: reusing one accumulator would return N aliases
          // of the last match (same centre repeated).
          const item = {name: myImageName, score: score, text: text,
                        location: null, dimension: null, center: null, clicked: null};
          [item.location, item.dimension, item.center] = fillRectangleInfo(oneMatch);
          flashOnMatch(oneTarget);
          found.push(item);
        }
        return found;
      };
      do {
        returnArray = collect();
        if (returnArray.length > 0 || Date.now() >= deadline) break;
        sleepMs(Math.min(200, Math.max(0, deadline - Date.now())));
      } while (true);
    }
    if (returnArray.length == 0) {
      returnArray.push(notFoundStatus);
    } else if (myImageAction && myImageAction != 'none' && myImageAction != 'null') {
      for (let i=0; i<returnArray.length; i++) {
        const r = {x: returnArray[i].location.x, y: returnArray[i].location.y, w: returnArray[i].dimension.width, h: returnArray[i].dimension.height};
        // clicked reports where a click was actually dispatched; a non-clicking
        // action (hover) leaves it null, matching the OCR path.
        if (performAction(r, myImageAction)) returnArray[i].clicked = returnArray[i].center;
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
          sleepMs(50);
          continue;
        }
        rect = {x: screenRegion.x, y: screenRegion.y, w: screenRegion.w, h: screenRegion.h};
        conf = 1.0;
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
    sleepMs(50);
    } catch (e) {
      const msg = (e && typeof e.getMessageSync === 'function') ? e.getMessageSync() : (e && e.message ? e.message : String(e));
      console.log('findTargetImage ERROR:', msg);
      return JSON.stringify([notFoundStatus]);
    }
  }

  if (results.length === 0) {
    return JSON.stringify([notFoundStatus]);
  }
  return JSON.stringify(results);
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
// The target is required (docs/CONTRACT.md §1). Omitting it used to default to a
// whole-screen OCR scan, so a mistyped flag silently cost ~3 s and looked like a
// successful call; and it made `find-target` indistinguishable from `read-text`.
if (matchImage === null && matchText === null) {
  die('no target given — pass --match-image=<file|Screen> or --match-text=<text>; to read '
    + 'the whole screen use: autobdd read-text');
}
let target_result;
if (ocrPath !== null) {
  target_result = findImageOcr(ocrPath, ocrSimilarity, ocrMaxSim, ocrWaitTime, ocrMaxCount, ocrAction, ocrDetail, ocrPSM, ocrOEM);
} else {
  target_result = findImage(imagePath, imageSimilarity, maxSim, textHint, imageWaitTime, imageAction, imageMaxCount);
}

// display result to stdout
console.log(`target_result: ${target_result}`);
process.exit();
