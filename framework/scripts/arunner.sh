#! /bin/bash
echo running feature files with 1 processes
rm -rf logs/*
echo
if [ "$1" == "-x" ]; then
    shift
    time xvfb-runner.sh npx wdio abdd.js $@
else
    time npx wdio abdd.js $@
fi