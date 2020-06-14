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
from os import environ
from glob import glob

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

class AbddDryRun():
    def __init__(self,
                 projectbase,
                 project,
                 modulelist,
                 platform,
                 browser,
                 runner_args,
                 output=None):

        if 'FrameworkPath' not in environ:
            self.FrameworkPath = path.join(environ['HOME'], 'Projects', 'AutoBDD')
        else:
            self.FrameworkPath = environ['FrameworkPath']

        self.runner_args = runner_args if runner_args else ''
        self.projectbase = projectbase
        self.project = project
        self.project_full_path = path.join(self.FrameworkPath, self.projectbase, self.project)

        self.modulelist = modulelist
        self.platform = platform
        self.browser = browser
        self.out_array = []
        self.out_path = output
        self.case_info = CASE_INFO
        self.case_info['platform'] = self.platform
        self.case_info['browser'] = self.browser

    def create_run_json(self):
        assert path.exists(self.project_full_path)
        # increase sequence number in case of rerun
        seq_num = 1
        while os.path.exists(path.join(self.out_path, 'dryrun_feature.' + str(seq_num) + '.subjson')):
            seq_num += 1
        dryrun_json = path.join(self.out_path, 'dryrun_feature.' + str(seq_num) + '.subjson')
        run_json = path.join(self.out_path, 'run_feature.' + str(seq_num) + '.subjson')

        dryrun_feature_list = ''
        if self.modulelist == ['All']:
            dryrun_feature_list = self.project_full_path
        else:
            for module in self.modulelist:
                dryrun_feature_list += self.project_full_path + '/' + module + ' '
        dryrun_feature_list.strip()
        
        dryrun_cmd = 'cucumber-js --dry-run --format json:' + dryrun_json + ' ' + dryrun_feature_list + ' ' + self.runner_args
        Popen_args = shlex.split(dryrun_cmd)
        print('\ndryrun command: {}\n'.format(dryrun_cmd))
        results = subprocess.Popen(
            Popen_args,
            cwd=self.FrameworkPath,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
            )
        results.communicate()

        with open(dryrun_json, 'r', encoding='utf-8') as fname:
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

        print('dryrun file: {}'.format(dryrun_json))
        print('   run file: {}'.format(run_json))
        with open(run_json, 'w', encoding='utf-8') as fname:
            json.dump(self.out_array, fname, indent=4)

        return run_json