#!/bin/bash

# parse args - begin
PARAMS=""
RUN_OPTS=""
JOBS_COUNT=""
ABDD_PROJECT=$(pwd | sed 's/.*test-projects\///' | sed 's/\/.*//')

while (( "$#" )); do
  case "$1" in
    # parallel jobs
    -j=*|--jobs=*)
      OptVal=${1#*=}
      JOBS_COUNT=${OptVal}
      shift
      ;;
    -j|--jobs)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        JOBS_COUNT=$2
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    # cucumber tags
    -t=*|--cucumberOpts.tagExpression=*)
      OptVal=${1#*=}
      RUN_OPTS="${RUN_OPTS} --cucumberOpts.tagExpression=\"${OptVal}\""
      shift
      ;;
    -t|--cucumberOpts.tagExpression)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        RUN_OPTS="${RUN_OPTS} --cucumberOpts.tagExpression=\"$2\""
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    # report dir
    -r=*|--report-dir=*)
      OptVal=${1#*=}
      REPORTDIR=${OptVal}
      shift
      ;;
    -r|--report-dir)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        REPORTDIR=$2
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;  
    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done
# set positional arguments in their proper place
eval set -- "$PARAMS"
# parse args - end

CPU_COUNT=$(nproc)
if [[ "${JOBS_COUNT}" == "" ]]; then JOBS_COUNT=${CPU_COUNT}; fi
if [[ "${JOBS_COUNT}" == *"/"* ]]; then JOBS_COUNT=`expr ${CPU_COUNT} \* ${JOBS_COUNT/\// \/ }`; fi
if [[ "${JOBS_COUNT}" == *"-"* ]]; then JOBS_COUNT=`expr ${CPU_COUNT} ${JOBS_COUNT/-/ \- }`; fi
if [[ "${JOBS_COUNT}" == *"-"* ]] || [[ "${JOBS_COUNT}" == "0" ]]; then JOBS_COUNT=1; fi
REPORTDIR=${REPORTDIR:-prunner-report}
mkdir -p ${REPORTDIR}
if [[ "$CLEANOLDREPORT" == "1" ]]; then
    rm -rf ${REPORTDIR}/*
fi

SPEC_FILTER=${@:-.}
MODULE_LIST=$(find ${SPEC_FILTER} -type d -name "features" ! -path "*/${REPORTDIR}/*" | xargs dirname | sort -u)
for MODULE in ${MODULE_LIST}; do
  if [[ "$MODULE" == "." ]]; then
    SPEC_LIST="${SPEC_LIST} $(find . -type f -name *.feature | sort -u)"
  else
    SPEC_LIST="${SPEC_LIST} $(find . -type f -path */${MODULE}/* -name *.feature | sort -u)"
  fi
done

echo running $(echo ${SPEC_LIST} | wc -w) feature files with ${JOBS_COUNT} processes
echo ${SPEC_LIST} | tr " " "\n"

time REPORTDIR=${REPORTDIR} parallel --jobs=${JOBS_COUNT} --results=${REPORTDIR}/logs.csv xvfb-runner.sh npx wdio '{=1 s:/features/.+:/abdd.js: =}' ${RUN_OPTS} --spec={1} ${PARAMS} ::: ${SPEC_LIST}

# gen report
cd ${REPORTDIR}
parsePRunnerLog.js
gen-report.js
cd -
