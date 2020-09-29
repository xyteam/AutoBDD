#!/bin/bash

# parse args - begin
PARAMS=""
RUN_OPTS=""
JOBS_COUNT=""
while (( "$#" )); do
  case "$1" in
    ####################################################################
    # Example Section
    # opts processing example code
    #   -a|--my-boolean-flag)
    #   MY_FLAG=0
    #   shift
    #   ;;
    # -b|--my-flag-with-argument)
    #   if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
    #     MY_FLAG_ARG=$2
    #     shift 2
    #   else
    #     echo "Error: Argument for $1 is missing" >&2
    #     exit 1
    #   fi
    #   ;;
    # -*|--*=) # unsupported flags
    #   echo "Error: Unsupported flag $1" >&2
    #   exit 1
    #   ;;
    ####################################################################
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
      ;;    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done
# set positional arguments in their proper place
eval set -- "$PARAMS"

# parse args - end

CPU_COUNT=$(lscpu | grep CPU\(s\): | awk '{print $2}')
if [[ "${JOBS_COUNT}" == "" ]]; then JOBS_COUNT=${CPU_COUNT}; fi
if [[ "${JOBS_COUNT}" == *"/"* ]]; then JOBS_COUNT=`expr ${CPU_COUNT} \* ${JOBS_COUNT/\// \/ }`; fi
if [[ "${JOBS_COUNT}" == *"-"* ]]; then JOBS_COUNT=`expr ${CPU_COUNT} ${JOBS_COUNT/-/ \- }`; fi
if [[ "${JOBS_COUNT}" == *"-"* ]] || [[ "${JOBS_COUNT}" == "0" ]]; then JOBS_COUNT=1; fi
SPEC_FILTER=${@:-.}
SPEC_LIST=$(find ${SPEC_FILTER} -type f -name "*.feature" | sort)
echo running $(echo ${SPEC_LIST} | wc -w) feature files with ${JOBS_COUNT} processes
echo ${SPEC_LIST} | tr " " "\n"
rm -rf logs/*
echo "to monitor progress"
echo "tail -f `pwd`/logs/1/*.feature/stdout"
echo
time parallel --jobs=${JOBS_COUNT} --results logs xvfb-runner.sh npx wdio abdd.js ${RUN_OPTS} --spec={1} ${PARAMS} ::: ${SPEC_LIST}
