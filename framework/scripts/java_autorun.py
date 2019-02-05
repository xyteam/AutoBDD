#!/usr/bin/env python
'''
Type python chimp_autorun.py --help for more informantion
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

CURRENTDIR = path.dirname(path.realpath(__file__))


def run_chimp(module, run_file, report_name, platform, browser, debugmode,
              screenshot, movie, display_size, chimp_profile, report_dir,
              project_full_path, host, current_index, total_run_count):
    '''
    run chimp in sub process by calling linux script
    '''
    report_file = report_dir + '/' + report_name
    module_path = project_full_path + '/' + module
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
            ' xvfb-run --auto-servernum --server-args=\"-screen 0 ' + display_size + 'x16\"' + \
            ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"src/test/resources/features/' + run_file + \
            ' --plugin pretty --add-plugin json:' + report_file + '.json\"' + \
            ' 2>&1 > ' + report_file + '.run'
        print('RUNNING #{}: {}'.format(current_index, run_file))
        # print(cmd)
        os.system(cmd)
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
                    ' xvfb-run --auto-servernum --server-args=\"-screen 0 ' + display_size + 'x16\"' + \
                    ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"src/test/resources/features/' + run_file + \
                    ' --plugin pretty --add-plugin json:' + report_file + '.json\"' + \
                    ' 2>&1 > ' + report_file + '.run'
                time.sleep(random.uniform(1, 2))
                break
        print('RUNNING #{}: {}'.format(current_index, run_file))
        # print('CMMAND: {}'.format(cmd))
        os.system(cmd)
    else:
        assert False, 'Can not process on {}'.format(platform)

    time.sleep(2)

    # # generate cucumber report for single json file
    # report_json_file = report_file + '.json'
    # if path.exists(report_json_file):
    #     if path.getsize(report_json_file) > 1:
    #         try:
    #             json.loads(open(report_json_file).read())
    #             report_cmd = path.join(environ['FrameworkPath'], 'framework', 'scripts', 'generate-reports.js') + ' ' + report_json_file
    #             os.system(report_cmd)
    #         except ValueError as e:
    #             print(str(e))
    #             print(
    #                 'Warning: {} is not json format'.format(report_json_file))
    #             open(report_dir + '/NoReportScenarios.txt',
    #                  'a').write('{}::{}\n'.format(module, run_file))
    #             os.remove(report_json_file)
    #     else:
    #         os.remove(report_json_file)
    #         print('Warning: {} is smaller than the specified minimum size'.
    #               format(report_json_file))
    #         open(report_dir + '/NoReportScenarios.txt',
    #              'a').write('{}::{}\n'.format(module, run_file))
    # else:
    #     print('Warning: {} is not exits'.format(report_json_file))
    #     open(report_dir + '/NoReportScenarios.txt',
    #          'a').write('{}::{}\n'.format(module, run_file))

    if platform == 'Win7' or platform == 'Win10':
        if path.exists(lock_file):
            os.remove(lock_file)

    print(' *** {} of {}\'\' completed *** '.format(current_index,
                                                    total_run_count))


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
        help="Run automation by Module or by Scenario. Default value: Scenario"
    )

    parser.add_argument(
        "--platform",
        "--PLATFORM",
        dest="PLATFORM",
        default="Linux",
        help="Run chimp on the given platform. Acceptable values: Linux, Win7, Win10. Default value: Linux")

    parser.add_argument(
        "--browser",
        "--BROWSER",
        dest="BROWSER",
        default="CH",
        help="Run chimp on the given browser. Acceptable values: CH, IE. Default value: CH")

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
        required=True,
        help="Spece separated list of modules to run.")

    parser.add_argument(
        "--reportbase",
        "--REPORTBASE",
        dest="REPORTBASE",
        default=None,
        help="The full path base directory for all reports into. Default: None, report will be archived in framework/test-reports")

    parser.add_argument(
        "--reportpath",
        "--REPORTPATH",
        dest="REPORTPATH",
        default=None,
        help="The report directory inside REPORTBASE to generate reports into. If ommited script will generate a timestamped path. Default: None")

    parser.add_argument(
        "--tags",
        "--TAGS",
        nargs='+',
        dest="TAGLIST",
        help="Added cucumber tags for chimp.")

    parser.add_argument(
        '--version', '-v', action='version', version='%(prog)s V1.0')

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
        self.rumtime_stamp = arguments.TIMESTAMP if arguments.TIMESTAMP else time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.parallel = arguments.PARALLEL
        self.screenshot = arguments.SCREENSHOT
        self.movie = arguments.MOVIE
        self.runlevel = arguments.RUNLEVEL
        self.platform = arguments.PLATFORM
        self.browser = arguments.BROWSER
        self.debugmode = arguments.DEBUGMODE
        self.projectbase = arguments.PROJECTBASE
        self.project = arguments.PROJECT
        self.reportbase = arguments.REPORTBASE if arguments.REPORTBASE else path.join(self.FrameworkPath, 'test-reports')
        self.reportpath = arguments.REPORTPATH if arguments.REPORTPATH else '_'.join((self.project, self.rumtime_stamp))

        self.modulelist = arguments.MODULELIST
        if arguments.TAGLIST is not None:
            self.args = '_'.join((arguments.MODULELIST + arguments.TAGLIST))
            self.tags = ' --tags ' + ','.join(arguments.TAGLIST)
        else:
            self.args = '_'.join(arguments.MODULELIST)
            self.tags = ''
        self.tagarray = arguments.TAGLIST
        self.display = ':99'
        self.display_size = '1920x1200'

        # self.test_projects_path = path.join(self.FrameworkPath,
        #                                     'test-projects')
        self.project_full_path = path.join(self.FrameworkPath, self.projectbase, self.project)
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

    def get_feature_files(self, directory):
        '''
        get all files end with '.feature' in module/features directory
        '''
        assert path.isdir(directory), '{} is not exits'.format(directory)
        return [
            #path.join('features', fname)
			fname
            for fname in os.listdir(path.join(directory, 'src', 'test', 'resources', 'features'))
            if fname.endswith('.feature')
        ]

    def create_module_array(self):
        '''
            save feature files path in module array
        '''
        print('self.project_full_path: ' + self.project_full_path)
        for mod in self.modulelist:
            self.marray[mod] = self.get_feature_files(
                path.join(self.project_full_path, mod))
            self.features_count += len(self.marray[mod])

        if self.runlevel == 'Scenario':
            from java_dryrun import dry_run
            self.sarray, self.scenarios_count = dry_run(
                self.project_full_path, self.modulelist, self.tags)

    def create_rerun_module_array(self):
        '''
        get failed scenario from cucumber report
        '''
        json_data = open(path.join(self.rerun,
                                   'cucumber-report.html.json')).read()
        data = json.loads(json_data)
        for element in data:
            for scenarios in element['elements']:
                result = ''
                status = ''
                scenario_line = 1

                # get status
                for step in scenarios['steps']:
                    result += step['result']['status']
                if 'failed' not in result and 'skipped' not in result and 'undefined' not in result:
                    status = 'passed'
                else:
                    status = 'failed'
                scenario_line = scenarios['line']

                if status == 'failed':
                    scenario_path_array = element['uri'].split('/')
                    scenario_name = scenario_path_array[-1]
                    scenario_module = '/'.join(
                        scenario_path_array[scenario_path_array.
                                            index('SFPortal-G2') + 1:-2])
                    scenario_run_path = 'features/' + scenario_name + ':' + str(
                        scenario_line)
                    if scenario_module in self.modulelist:
                        if scenario_module not in self.sarray:
                            self.sarray[scenario_module] = [scenario_run_path]
                        else:
                            self.sarray[scenario_module].append(
                                scenario_run_path)
                        self.scenarios_count += 1

        if path.exists(path.join(self.rerun, 'NoReportScenarios.txt')):
            with open(path.join(self.rerun, 'NoReportScenarios.txt'),
                      'r') as fname:
                for item in fname.readlines():
                    scenario_info = item.strip().split('::')
                    if scenario_info[0] in self.modulelist:
                        rerun_scenario = scenario_info[1].replace('\\', '')
                        rerun_scenario = re.sub('--tags.*', '',
                                                rerun_scenario).strip()
                        if scenario_info[0] not in self.sarray:
                            self.sarray[scenario_info[0]] = [rerun_scenario]
                        else:
                            self.sarray[scenario_info[0]].append(
                                rerun_scenario)
                        self.scenarios_count += 1

    def is_rerun(self):
        if self.rerun is None:
            return False
        return True

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
                    if hostdict['Status'] == 'on' and hostdict[
                            'Platform'] == self.platform:
                        self.thread_count += int(hostdict['Thread'])
                        self.host.append(hostdict)
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
                    if not fname.startswith('cucumber-report'):
                        shutil.copy2(
                            os.path.join(self.rerun, fname), self.report_dir)
        else:
            rerun_path = 'None'

        if path.exists(self.report_dir + '/cucumber-report.html.json'):
            os.remove(self.report_dir + '/cucumber-report.html.json')
        cmd_generate_report = path.join(self.FrameworkPath, 'framework', 'scripts', 'generate-reports.js') + ' ' + \
            ' ' + self.report_dir + ' ' + self.project + ' \'Automation Report\' ' +  \
            ' ' + self.platform + ' ' + self.browser + ' ' + self.parallel + ' ' + self.rumtime_stamp + \
            ' ' + run_duration + ' ' + rerun_path + ' ' + self.args
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
        # set sub process array
        run_array = {}
        if self.runlevel == 'Feature':
            run_array = self.marray
            total_run_count = self.features_count
            print('There are {} feature files will be run'.format(
                total_run_count))
        elif self.runlevel == 'Scenario':
            run_array = self.sarray
            total_run_count = self.scenarios_count
            print('There are {} scenarios will be run'.format(total_run_count))

        # set sub process pool number
        if self.parallel == 'MAX':
            # using all available rdp host in config file
            pool_number = int(self.thread_count)
        else:
            pool_number = min(int(self.thread_count), int(self.parallel))
        print('pool number: {}'.format(pool_number))
        self.parallel = str(pool_number)
        pool = Pool(pool_number)

        # add process in process pool
        current_index = 0
        for module in run_array:
            for fname in run_array[module]:
                current_index += 1
                run_file = fname.replace(' ', '\ ')
                report_name = (module + '_' + fname).replace(' ', '_').replace(
                    ':', '_').replace('/', '_')

                pool.apply_async(
                    run_chimp,
                    args=(
                        module,
                        run_file,
                        report_name,
                        self.platform,
                        self.browser,
                        self.debugmode,
                        self.screenshot,
                        self.movie,
                        self.display_size,
                        self.chimp_profile,
                        self.report_dir,
                        self.project_full_path,
                        self.host,
                        current_index,
                        total_run_count,
                    ))
        pool.close()
        pool.join()

        # Wait for test to finish then record the end time
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())


if __name__ == "__main__":
    command_arguments = parse_arguments()
    print(command_arguments)
    chimp_run = ChimpAutoRun(command_arguments)
    if chimp_run.is_rerun():
        chimp_run.create_rerun_module_array()
    else:
        chimp_run.create_module_array()

    if command_arguments.RUNONLY:
        chimp_run.run_in_parallel()
    elif command_arguments.REPORTONLY:
        chimp_run.generate_report()
    else:
        chimp_run.run_in_parallel()
        chimp_run.generate_report()
