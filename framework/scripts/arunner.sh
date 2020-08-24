#! /bin/bash
echo running feature files with 1 processes
rm -rf logs/*
echo
time npx wdio abdd.js $@