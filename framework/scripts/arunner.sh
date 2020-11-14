#! /bin/bash
echo running feature files with 1 processes
rm -rf logs/*
echo

if [ "$1" == "-x" ]; then
    shift
    RUN_CMD="xvfb-runner.sh npx wdio abdd.js"
else
    RUN_CMD="npx wdio abdd.js"
fi

IFS=' ' read -r -a array <<< $@
for element in "${array[@]}"
do
    if [[ "$element" == *".feature"* && "$element" != "--spec="* ]]; then
        element="--spec=$element"
    fi
    RUN_ARGS="$RUN_ARGS $element"
done

echo $RUN_CMD $RUN_ARGS
time $RUN_CMD $RUN_ARGS