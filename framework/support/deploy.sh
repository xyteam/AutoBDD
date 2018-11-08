#!/bin/bash
for dn in $(find ../../test-projects -type d -name support | grep features); do
  cp use_framework_hooks.js $dn
done
