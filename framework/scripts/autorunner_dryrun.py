#!/usr/bin/env python
'''
Type python autorunner_dryrun.py --help for more information
'''
import argparse
import json
import os
import os.path as path
import re
import subprocess
import shlex
import glob
from os import environ

CASE_INFO = {
    "uri": "",
    "feature": "",
    "scenario": "",
    "line": "",
    "platform": "Linux",
    "browser": "CH",
    "HOST": "default",
    "SSHPORT": "default",
    "status": "notrun"
}

class ChimpDryRun():
    def __init__(self,
                 projectbase,
                 project,
                 modulelist,
                 platform,
                 browser,
                 argString,                 
                 output=None):

        if 'FrameworkPath' not in environ:
            self.FrameworkPath = path.join(environ['HOME'], 'Projects', 'AutoBDD')
        else:
            self.FrameworkPath = environ['FrameworkPath'] 

        self.argString = argString if argString else ''
        self.projectbase = projectbase
        self.project = project
        self.project_full_path = path.join(self.FrameworkPath, self.projectbase, self.project)

        self.modulelist = modulelist
        if 'All' in modulelist:
            self.modulelist = filter(lambda x: path.isdir(path.join(self.project_full_path, x)), os.listdir(self.project_full_path))
            if 'target' in self.modulelist: self.modulelist.remove('target')          # remove target
            if 'build' in self.modulelist: self.modulelist.remove('build')            # remove target

        self.platform = platform
        self.browser = browser
        self.out_array = []
        self.out_path = output
        self.case_info = CASE_INFO
        self.case_info['platform'] = self.platform
        self.case_info['browser'] = self.browser

    def get_dry_run_results(self):
        assert path.exists(self.project_full_path)

        dryRun_json = path.join(self.out_path, 'dryrun_feature.subjson')

        finalfeaturepath = ''
        for module in self.modulelist:
            finalfeaturepath += ' '.join(glob.glob(self.project_full_path + '/' + module)) + ' '
        finalfeaturepath.strip()

        dryRun_cmd = 'cucumber-js --dry-run --format json:' + dryRun_json + ' ' + finalfeaturepath + ' ' + self.argString
        dryRunArgs = shlex.split(dryRun_cmd)
        print(dryRun_cmd)
        results = subprocess.Popen(
            dryRunArgs,
            cwd=self.FrameworkPath, 
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
            )

        results.communicate()

        with open(dryRun_json, 'r') as fname:
            data = json.load(fname)
            for feature in data:
                for scenario in feature['elements']:
                    out_json = self.case_info.copy()
                    feature_path = feature['uri'][feature['uri'].rfind(self.project) + len(self.project) + 1:]      # feature path without project_base and project_name 
                    out_json['uri'] = path.join(self.project_full_path, feature_path)
                    file_name = path.splitext(path.basename(feature['uri']))[0]
                    out_json['feature'] = file_name + '-' +feature['name']
                    out_json['scenario'] = scenario['name']
                    out_json['line'] = scenario['line']
                    self.out_array.append(out_json)

        out_path = path.join(self.out_path, '.runcase.subjson')
        print('Run case path: ' + out_path)
        with open(out_path, 'w') as fname:
            json.dump(self.out_array, fname, indent=4)

        return out_path
