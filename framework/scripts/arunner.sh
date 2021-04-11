#! /bin/bash
echo running feature files with 1 processes
rm -rf logs/*
echo

if [ "${@: -1}" == "-x" ]; then
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

REPORTDIR=${REPORTDIR:-arunner-report}
MODULEDIR=$(pwd | awk -F 'e2e-test/' '{print $2}')
mkdir -p ${REPORTDIR}/${MODULEDIR}
if [[ "$CLEANOLDREPORT" == "1" ]]; then
    rm -rf ${REPORTDIR}/${MODULEDIR}/*
fi

echo REPORTDIR=${REPORTDIR} $RUN_CMD $RUN_ARGS
time REPORTDIR=${REPORTDIR} $RUN_CMD $RUN_ARGS | tee ${REPORTDIR}/${MODULEDIR}/arunner.log

# gen report
cd ${REPORTDIR}
parseARunnerLog.js
gen-report.js
cd -
