#!/usr/bin/env python
'''
Type python chimp_dryrun_v2.py --help for more informantion
'''
import argparse
import json
import os
import os.path as path
import re
import subprocess
from os import environ

SCENARIO_INFO = {
    "feature": "",
    "scenario": "",
    "line": "",
    "platform": "Linux",
    "browser": "CH",
    "HOST": "default",
    "SSHPORT": "default"
}


def parse_arguments():
    '''
    parse command line arguments
    '''
    descript = "This python scripts can be used to dry run cucumber and save scenarios information to json file. "
    descript += "Command Example: "
    descript += " framework/scripts/chimp_dryrun.py"
    descript += " --projectbase test-projects --project webtest-example"
    descript += " --modulelist test-webpage test-download --reportbase ~/Run/reports"
    descript += " --tags '@test1 or @test2'"

    parser = argparse.ArgumentParser(description=descript)

    parser.add_argument(
        "--projectbase",
        "--PROJECTBASE",
        dest="PROJECTBASE",
        default="test-projects",
        help="Base path for all test projects. Default value: test-projects")

    parser.add_argument(
        "--project",
        "--PROJECT",
        dest="PROJECT",
        default="webtest-example",
        help="Run chimp on the given project. Default value: webtest-example")

    parser.add_argument(
        "--modulelist",
        "--MODULELIST",
        nargs='+',
        dest="MODULELIST",
        default=[],
        required=True,
        help="Spece separated list of modules to run.")

    parser.add_argument(
        "--output",
        "--OUTPUT",
        dest="OUTPUT",
        default=None,
        help=
        "The full path to generate cucumber-js dryrun report into. Default: None, report will be archived in framework/scripts/runner"
    )

    parser.add_argument(
        "--platform",
        "--PLATFORM",
        dest="PLATFORM",
        default="Linux",
        help=
        "Run chimp on the given platform. Acceptable values: Linux, Win7, Win10. Default value: Linux"
    )

    parser.add_argument(
        "--browser",
        "--BROWSER",
        dest="BROWSER",
        default="CH",
        help=
        "Run chimp on the given browser. Acceptable values: CH, IE. Default value: CH"
    )

    parser.add_argument(
        "--tags",
        "--TAGS",
        dest="TAGLIST",
        help=
        "Only execute the features or scenarios with tags matching the expression (repeatable) (default: "
        ")")

    parser.add_argument(
        '--version', '-v', action='version', version='%(prog)s V1.0')

    args = parser.parse_args()

    print('\nInput parameters:')
    for arg in vars(args):
        print('{:*>15}: {}'.format(arg, getattr(args, arg)))

    return args


class ChimpDryRun():
    def __init__(self, arguments):
        if 'FrameworkPath' not in environ:
            self.FrameworkPath = path.join(environ['HOME'], 'Projects',
                                           'AutoBDD')
        else:
            self.FrameworkPath = environ['FrameworkPath']

        self.runner_path = path.join(self.FrameworkPath, 'framework',
                                     'scripts', 'runner')
        if not path.exists(self.runner_path):
            os.makedirs(self.runner_path)

        self.modulelist = arguments.MODULELIST
        self.tags = []
        if arguments.TAGLIST:
            self.tags = ['--tags', arguments.TAGLIST]
        self.projectbase = arguments.PROJECTBASE
        self.project = arguments.PROJECT
        self.project_full_path = path.join(self.FrameworkPath,
                                           self.projectbase, self.project)
        self.platform = arguments.PLATFORM
        self.browser = arguments.BROWSER
        self.out_array = []
        self.out_path = arguments.OUTPUT
        if not self.out_path:
            self.out_path = self.runner_path

    def get_dry_run_resluts(self):
        assert path.exists(self.project_full_path)
        for module in self.modulelist:
            dry_run_path = path.join(self.runner_path, module + '.json')
            print(dry_run_path)
            results = subprocess.Popen(
                [
                    'cucumber-js', '--dry-run', '-f', 'json:' + dry_run_path,
                    path.join(self.project_full_path, module)
                ] + self.tags,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT)
            print(results.communicate()[0])

            with open(dry_run_path, 'r') as fname:
                data = json.load(fname)
                for feature in data:
                    out_json = SCENARIO_INFO.copy()
                    out_json['feature'] = feature['name']
                    for scenario in feature['elements']:
                        out_json['scenario'] = scenario['name']
                        out_json['line'] = scenario['line']
                        self.out_array.append(out_json)

        out_path = path.join(self.out_path, '.runcase.json')
        with open(out_path, 'w') as fname:
            json.dump(self.out_array, fname, indent=4)
        
        return out_path
            
             

if __name__ == "__main__":
    command_arguments = parse_arguments()
    dryrun = ChimpDryRun(command_arguments)
    dryrun.get_dry_run_resluts()

