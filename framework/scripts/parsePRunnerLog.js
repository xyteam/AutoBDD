#!/usr/bin/env node

const csv = require('csv-parser');
const stripAnsi = require('strip-ansi');
const fs = require('fs');
const cmdline_session = require(`${process.env.FrameworkPath}/framework/libs/cmdline_session.js`);

const results = [];

fs.createReadStream('logs.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    results.forEach(r => {
      // Seq,Host,Starttime,JobRuntime,Send,Receive,Exitval,Signal,Command,V1,Stdout,Stderr
      var [testModulePath, testFeaturePath] = r['V1'].split('/features/');
      if (testModulePath == '') testModulePath = './';
      testFeaturePath = testFeaturePath.replace('/', '_');
      if (!fs.existsSync(testModulePath)) fs.mkdirSync(testModulePath);
      fs.writeFileSync(`${testModulePath}/${testFeaturePath}.log`, stripAnsi(r['Stdout']));
      cmdline_session.runCmd(`cat ${testModulePath}/${testFeaturePath}.log | ansi2html > ${testModulePath}/${testFeaturePath}.log.html`);
    })
  });
