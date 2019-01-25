#!/usr/bin/env python
'''
Type python chimp_autorun_v2.py --help for more informantion
'''

import sys
import os
import time
import random
import errno
import json
import argparse
import shutil
import re
from multiprocessing import Pool
import os.path as path
from os import environ
from datetime import datetime
from tinydb import TinyDB, Query

# new tiny db
tinydb_path = '/tmp/db.json'
if path.exists(tinydb_path):
    print('remove db.json')
    os.remove(tinydb_path)
DB = TinyDB(tinydb_path)


def run_chimp(index, host, platform, browser, report_dir, movie, screenshot,
              debugmode, display_size, chimp_profile):
    ''' Run chimp'''
    time.sleep(random.uniform(0, 2))
    #Get matched case from tinydb
    case = Query()
    results = DB.search((
        (case.status == 'notrun') | (case.status == 'failed')) & (
            case.platform == platform) & (case.browser == browser))
    if len(results) == 0:
        return
    case = results[0]
    DB.update({'status': 'running'}, doc_ids=[case.doc_id])

    uri_array = case['uri'].split('/')
    module_path = '/'.join(uri_array[0:-2])
    module = uri_array[-1].split('.')[0]
    report_file = report_dir + '/' + case['uri'].replace('/', '_') + '_' + str(
        case['line'])
    run_file = '/'.join(uri_array[-2:]) + ':' + str(case['line'])

    if platform == 'Linux':
        time.sleep(random.uniform(0, 1))
        cmd = 'cd ' + module_path + ';' + \
            ' REPORTDIR=' + report_dir + \
            ' MOVIE=' + movie + \
            ' SCREENSHOT=' + screenshot + \
            ' BROWSER=' + browser + \
            ' DEBUGMODE=' + debugmode + \
            ' MODULE=' + module + \
            ' BROWSER=' + browser + \
            ' DISPLAYSIZE=' + display_size + \
            ' PLATFORM=' + platform + \
            ' xvfb-run --auto-servernum --server-args="-screen 0 ' + display_size + 'x16"' + \
            ' chimpy ' + chimp_profile + ' ' + './' + run_file + \
            ' --format=json:' + report_file + '.json' \
            ' 2>&1 > ' + report_file + '.run'
    elif platform == 'Win7' or platform == 'Win10':
        for rdp in host:
            cmd = ''
            lock_file = ''
            time.sleep(random.uniform(0, 1))
            # avoid different process using same SSH PORT simultaneously
            lock_file = '/tmp/rdesktop.' + rdp['SSHHOST'] + ':' + rdp[
                'SSHPORT'] + '.lock'
            if not os.path.exists(lock_file):
                open(lock_file, 'a').close()
                cmd = 'cd ' + module_path + ';' + \
                    ' REPORTDIR=' + report_dir + \
                    ' MOVIE=' + movie + \
                    ' SCREENSHOT=' + screenshot + \
                    ' DEBUGMODE=' + debugmode + \
                    ' MODULE=' + module + \
                    ' BROWSER=' + browser + \
                    ' DISPLAYSIZE=' + display_size + \
                    ' PLATFORM=' + platform + \
                    ' SSHHOST=' + rdp['SSHHOST'] + \
                    ' SSHPORT=' + rdp['SSHPORT'] + \
                    ' xvfb-run --auto-servernum --server-args="-screen 0 ' + display_size + 'x16"' + \
                    ' chimpy ' + chimp_profile + ' ' + './' + run_file + \
                    ' --format=json:' + report_file + '.json' + \
                    ' 2>&1 > ' + report_file + '.run'
                time.sleep(random.uniform(1, 2))
                break
    else:
        assert False, 'Can not process on {}'.format(platform)

    print('RUNNING #{}: {}'.format(index, run_file))
    # print(cmd)
    os.system(cmd)

    # update test case status
    DB.update({'status': 'runned'}, doc_ids=[case.doc_id])


def parse_arguments():
    '''
    parse command line arguments
    '''
    descript = "This python scripts can be used to run chimp in parallel and generate cucumber report. "
    descript += "Command Example: "
    descript += " framework/scripts/chimp_autorun.py --parallel 2 --movie 0"
    descript += " --platform Linux --browser CH"
    descript += " --projectbase test-projects --project webtest-example"
    descript += " --modulelist test-webpage test-download --reportbase ~/Run/reports"

    parser = argparse.ArgumentParser(description=descript)

    parser.add_argument(
        "--timestamp",
        "--TIMESTAMP",
        dest="TIMESTAMP",
        default=None,
        help=
        "time stamp in single string, i.e., 20181218_072018PST, will be used in report folder name, useful when you different docker containers and use the same folder for the report"
    )

    parser.add_argument(
        "--runonly",
        "--RUNONLY",
        dest="RUNONLY",
        default=None,
        help=
        "instead of running test and generating report for each run, this will run test only but will not generate cucumber report. Default: None"
    )

    parser.add_argument(
        "--reportonly",
        "--REPORTONLY",
        dest="REPORTONLY",
        default=None,
        help=
        "instead of running test and generating report for each run, this will generate cucumber report only for the given path. Default: None"
    )

    parser.add_argument(
        "--parallel",
        "--PARALLEL",
        dest="PARALLEL",
        default='MAX',
        help=
        "chimp parallel run number, all available host will be used when set to MAX. Default value: MAX"
    )

    parser.add_argument(
        "--screenshot",
        "--SCREENSHOT",
        dest="SCREENSHOT",
        default="1",
        help="record screent shot when chimp finished. Default value: 1")

    parser.add_argument(
        "--movie",
        "--MOVIE",
        dest="MOVIE",
        default="0",
        help="record movie when chimp running. Default value: 0")

    parser.add_argument(
        "--runlevel",
        "--RUNLEVEL",
        dest="RUNLEVEL",
        default="Scenario",
        help="run automation by Module or by Scenario. Default value: Scenario"
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
        "--debugmode",
        "--DEBUGMODE",
        dest="DEBUGMODE",
        default="None",
        help=
        "hit F12 in browser, takes None, Elements, Console, Sources and Network"
    )

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
        "--rerun",
        "--RERUN",
        dest="RERUN",
        help="Rerun failed scenarios on selected cucumber report")

    parser.add_argument(
        "--modulelist",
        "--MODULELIST",
        nargs='+',
        dest="MODULELIST",
        default=[],
        help="Spece separated list of modules to run.")

    parser.add_argument(
        "--reportbase",
        "--REPORTBASE",
        dest="REPORTBASE",
        default=None,
        help=
        "The full path base directory for all reports into. Default: None, report will be archived in framework/test-reports"
    )

    parser.add_argument(
        "--reportpath",
        "--REPORTPATH",
        dest="REPORTPATH",
        default=None,
        help=
        "The report directory inside REPORTBASE to generate reports into. If ommited script will generate a timestamped path. Default: None"
    )

    parser.add_argument(
        "--tags",
        "--TAGS",
        dest="TAGS",
        default=None,
        help=
        "Only execute the features or scenarios with tags matching the expression"
    )

    parser.add_argument(
        "--runcase",
        "--RUNCASE",
        dest="RUNCASE",
        default=None,
        help="The path for dry run json file")

    parser.add_argument(
        '--version', '-v', action='version', version='%(prog)s V2.0')

    args = parser.parse_args()
    print('\nInput parameters:')
    for arg in vars(args):
        print('{:*>15}: {}'.format(arg, getattr(args, arg)))
    return args


class ChimpAutoRun:
    '''
    run chimp
    '''

    def __init__(self, arguments):
        '''
            initialize local variables
        '''
        if 'TZ' not in environ:
            os.environ['TZ'] = 'America/Los_Angeles'
        time.tzset()

        if 'FrameworkPath' not in environ:
            self.FrameworkPath = path.join(environ['HOME'], 'Projects',
                                           'AutoBDD')
        else:
            self.FrameworkPath = environ['FrameworkPath']

        self.reportonly = arguments.REPORTONLY
        self.rumtime_stamp = arguments.TIMESTAMP if arguments.TIMESTAMP else time.strftime(
            "%Y%m%d_%H%M%S%Z", time.gmtime())
        self.parallel = arguments.PARALLEL
        self.screenshot = arguments.SCREENSHOT
        self.movie = arguments.MOVIE
        self.runlevel = arguments.RUNLEVEL
        self.platform = arguments.PLATFORM
        self.browser = arguments.BROWSER
        self.debugmode = arguments.DEBUGMODE
        self.projectbase = arguments.PROJECTBASE
        self.project = arguments.PROJECT
        self.reportbase = arguments.REPORTBASE if arguments.REPORTBASE else path.join(
            self.FrameworkPath, 'test-reports')
        self.reportpath = arguments.REPORTPATH if arguments.REPORTPATH else '_'.join(
            (self.project, self.rumtime_stamp))

        self.modulelist = arguments.MODULELIST
        self.tags = arguments.TAGS
        if self.tags:
            self.args = self.tags.replace(' ', '_')
        else:
            self.args = ''
        self.runcase = arguments.RUNCASE
        self.display = ':99'
        self.display_size = '1920x1200'

        self.project_full_path = path.join(self.FrameworkPath,
                                           self.projectbase, self.project)
        # Each runable module should have a chimp.js
        self.chimp_profile = path.join('chimp.js')
        # Create report directory
        if not path.exists(path.join(self.FrameworkPath, self.reportbase)):
            os.makedirs(path.join(self.FrameworkPath, self.reportbase))
        self.report_dir = path.join(self.reportbase, self.reportpath)
        try:
            os.makedirs(self.report_dir)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
        print('\n*** Report Directory: ***\n {}'.format(self.report_dir))

        self.rerun = None
        if arguments.RERUN is not None:
            self.rerun = path.join(
                path.abspath(path.join(self.report_dir, '..')),
                arguments.RERUN)
            assert path.exists(self.rerun), '{} is not exits'.format(
                self.rerun)
            self.runlevel = 'Scenario'

        # remove /tmp/*.lock file
        for item in os.listdir('/tmp/'):
            if item.endswith(".lock"):
                os.remove('/tmp/' + item)

        self.marray = {}
        self.sarray = {}
        self.features_count = 0
        self.scenarios_count = 0
        self.runarray = []
        self.host = []
        self.thread_count = 0
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.get_available_host()

    def get_dry_run_out(self):
        if self.runcase:
            assert path.exists(self.runcase)
            # assert self.runcase.endswith('.subjason')
        else:
            from chimp_dryrun_v2 import ChimpDryRun
            dry_run = ChimpDryRun(self.projectbase, self.project,
                                  self.modulelist, self.platform, self.browser,
                                  self.tags, self.report_dir)
            self.runcase = dry_run.get_dry_run_resluts()

    def get_rerun_out(self):
        '''
        get failed scenario from cucumber report
        '''
        report_data = json.loads(
            open(path.join(self.rerun, 'cucumber-report.html.json')).read())
        run_cases = json.loads(
            open(path.join(self.rerun, '.runcase.subjason')).read())
        for element in report_data:
            for scenario in element['elements']:
                result, status = '', ''
                # get status
                for step in scenario['steps']:
                    result += step['result']['status']
                if 'failed' not in result and 'skipped' not in result and 'undefined' not in result:
                    status = 'passed'
                else:
                    status = 'failed'
                for case in run_cases:
                    if case['scenario'] == scenario['name'] and case[
                            'line'] == scenario['line']:
                        case['status'] = status
                        break
        out_path = path.join(self.report_dir, '.runcase.subjason')
        print('Run case path: ' + out_path)
        with open(out_path, 'w') as fname:
            json.dump(run_cases, fname, indent=4)
        self.runcase = out_path

    def is_rerun(self):
        if self.rerun is None:
            return False
        return True

    def init_tinydb(self):
        runcases = json.loads(open(self.runcase).read())
        self.scenarios_count = len(runcases)
        for case in runcases:
            DB.insert(case)

    def get_available_host(self):
        '''
        get avaiable host by reading config file
        '''
        config_file = path.join(self.FrameworkPath, 'framework', 'configs',
                                'chimp_run_host.config')
        assert path.exists(config_file), '{} is not exits'.format(config_file)

        with open(config_file) as fname:
            head = fname.readline()
            while 'SSHHOST' not in head:
                head = fname.readline()
            headarray = head.strip().split()

            for item in fname:
                hostinfo = item.strip().split()
                if len(hostinfo) > 1:
                    hostdict = dict(zip(headarray, hostinfo))
                    if hostdict[
                            'Status'] == 'on':  # and hostdict['Platform'] == self.platform:
                        self.thread_count += int(hostdict['Thread'])
                        self.host.append(hostdict)

        assert len(
            self.
            host) > 0, 'No host is avilable! Check file: chimp_run_host.config'
        print('\n*** Avaliable Host: ***')
        for item in self.host:
            print(item)
        print('Maximum thread count: {}'.format(self.thread_count))
        print('*** \n ')

    def generate_report(self):
        '''
        Merge files if rerun cucumber reports
        Generate report by calling generate-reports.js
        if run level is scenario, then merge report
        '''
        # get run duration
        t1 = self.rumtime_stamp
        t2 = self.end_time
        stime = datetime(
            int(t1[:4]), int(t1[4:6]), int(t1[6:8]), int(t1[9:11]),
            int(t1[11:13]), int(t1[13:15]))
        etime = datetime(
            int(t2[:4]), int(t2[4:6]), int(t2[6:8]), int(t2[9:11]),
            int(t2[11:13]), int(t2[13:15]))
        run_duration = str(etime - stime)
        print('Run Duration: {}'.format(run_duration))

        if self.rerun is not None:
            rerun_path = self.rerun
            for fname in os.listdir(self.rerun):
                if not path.exists(os.path.join(self.report_dir, fname)):
                    if not fname.startswith(
                            'cucumber-report') and not fname.endswith('subjason'):
                        shutil.copy2(
                            os.path.join(self.rerun, fname), self.report_dir)
        else:
            rerun_path = 'None'

        if path.exists(self.report_dir + '/cucumber-report.html.json'):
            os.remove(self.report_dir + '/cucumber-report.html.json')
        cmd_generate_report = path.join(self.FrameworkPath, 'framework', 'scripts', 'generate-reports.js') + ' ' + \
            ' ' + self.report_dir + ' ' + self.project + ' \'Automation Report\' ' +  \
            ' ' + self.platform + ' ' + self.browser + ' ' + self.parallel + ' ' + self.rumtime_stamp + \
            ' ' + run_duration + ' ' + rerun_path + ' ' + self.args.replace(' ', '_')
        print('Generate Report On: {}'.format(self.report_dir))
        os.system(cmd_generate_report)

        if self.runlevel == 'Scenario':
            # Merge json file and generate report
            report_json_path = self.report_dir + '/cucumber-report.html.json'
            new_data_json = []
            with open(report_json_path, 'r') as data_file:
                data_json = json.load(data_file)
                for item in data_json:
                    SAMEURI = False
                    for new_item in new_data_json:
                        if new_item['uri'] == item['uri']:
                            SAMEURI = True
                            new_item['elements'].extend(item['elements'])
                            break
                    if not SAMEURI:
                        new_data_json.append(item)

            with open(report_json_path, 'w') as outfile:
                json.dump(new_data_json, outfile)

            cmd_generate_report = cmd_generate_report.replace(
                self.report_dir, report_json_path)
            os.system(cmd_generate_report)

    def run_in_parallel(self):
        '''
        run chimp in parallel
        '''

        # set sub process pool number
        if self.parallel == 'MAX':
            # using all available rdp host in config file
            pool_number = int(self.thread_count)
        else:
            pool_number = min(int(self.thread_count), int(self.parallel))
        print('pool number: {}'.format(pool_number))
        print(self.scenarios_count)

        pool = Pool(pool_number)

        for index in range(1, self.scenarios_count + 1):
            pool.apply_async(
                run_chimp,
                args=(index, self.host, self.platform, self.browser,
                      self.report_dir, self.movie, self.screenshot,
                      self.debugmode, self.display_size, self.chimp_profile))
        pool.close()
        pool.join()

        # Wait for test to finish then record the end time
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())


if __name__ == "__main__":
    command_arguments = parse_arguments()
    chimp_run = ChimpAutoRun(command_arguments)

    if chimp_run.is_rerun():
        chimp_run.get_rerun_out()
    else:
        chimp_run.get_dry_run_out()

    chimp_run.init_tinydb()

    if command_arguments.RUNONLY:
        chimp_run.run_in_parallel()
    elif command_arguments.REPORTONLY:
        chimp_run.generate_report()
    else:
        chimp_run.run_in_parallel()
        chimp_run.generate_report()
