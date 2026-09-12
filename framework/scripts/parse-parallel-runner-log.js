#!/usr/bin/env node

const csv = require('csv-parser');
const stripAnsi = require('strip-ansi-control-characters');
const glob = require('glob');
const fs = require('fs');
const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);

const parseLog = (logFilePath) => {
  const results = [];
  const modulePath = logFilePath.includes('/') ? logFilePath.split('/')[0] : '';
  fs.createReadStream(logFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      results.forEach(r => {
        // Seq,Host,Starttime,JobRuntime,Send,Receive,Exitval,Signal,Command,V1,Stdout,Stderr
        // V1 is commonly a bare `file:///features/x.feature` URI with no module dir. Strip the
        // scheme/leading slash so the ':' from `file:` never becomes a directory name (the CI
        // artifact uploader and Windows reject such paths).
        const V1 = String(r['V1'] || '').replace(/^file:\/{2,}/, '').replace(/^\/+/, '');
        var [testModulePath, testFeaturePath] = V1.includes('/features/')
          ? V1.split('/features/')
          : [modulePath, V1.replace('features/', '')];
        testModulePath = String(testModulePath || '').replace(/[:*?"<>|]/g, '_');
        testFeaturePath = String(testFeaturePath || '').replace(/\//g, '_').replace(/[:*?"<>|]/g, '_');
        // keep only the module's own directory name (drop any absolute prefix)
        if (testModulePath.includes('/')) testModulePath = testModulePath.split('/').filter(Boolean).pop() || modulePath;
        if (testModulePath == '' || testModulePath == '.' ) testModulePath = modulePath;
        console.log(testModulePath)
        if (!fs.existsSync(testModulePath)) fs.mkdirSync(testModulePath, { recursive: true });
        fs.writeFileSync(`${testModulePath}/${testFeaturePath}.log`, stripAnsi.string(r['Stdout']));
        cmdline_session.runCmd(`cat ${testModulePath}/${testFeaturePath}.log | ansi2html > ${testModulePath}/${testFeaturePath}.log.html`);
      })
    });
  }

// script action starts here
glob.sync('**/logs.csv').forEach(f => {parseLog(f)});