#!/usr/bin/env python
'''
Type python autorunner.py --help for more information
'''

import sys
import os
import time
import random
import errno
import json
import argparse
import shutil
import subprocess
import re
import multiprocessing
import os.path as path
from os import environ
from datetime import datetime
from tinydb import TinyDB, Query
import shlex
from pprint import pprint

def parse_arguments():
    '''
    parse command line arguments
    '''
    descript = "This python scripts can be used to run abdd/maven in parallel and generate cucumber report. "
    descript += "Command Example: "
    descript += " framework/scripts/autorunner.py --parallel 2 --movie 0"
    descript += " --platform Linux --browser CH"
    descript += " --projectbase test-projects --project webtest-example"
    descript += " --modulelist test-webpage test-download --reportbase ~/Run/reports"

    parser = argparse.ArgumentParser(fromfile_prefix_chars='+', description=descript)

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
        "will run test only and will not generate cucumber report. Default: None"
    )

    parser.add_argument(
        "--reportonly",
        "--REPORTONLY",
        dest="REPORTONLY",
        default=None,
        help=
        "will generate cucumber report only for the given path. Default: None"
    )

    parser.add_argument(
        "--reruncrashed",
        "--RERUNCRASHED",
        dest="RERUNCRASHED",
        default="0",
        help="Number of iterations to re-run crashed feature"
    )

    parser.add_argument(
        "--rerunfailed",
        "--RERUNFAILED",
        dest="RERUNFAILED",
        default="0",
        help="Number of iterations to re-run failed feature"
    )

    parser.add_argument(
        "--parallel",
        "--PARALLEL",
        dest="PARALLEL",
        default='CPU',
        help=
        "abdd parallel run number, if CPU is used, without MOVIE count is CPU - 1, with MOVIE count is CPU/2, minimum id 1"
    )

    parser.add_argument(
        "--screenshot",
        "--SCREENSHOT",
        dest="SCREENSHOT",
        default="1",
        help="take screenshots. 0: no screenshot, 1: last screenshot, 2: first and last, 3: every step. Default value: 1")

    parser.add_argument(
        "--screenremark",
        "--SCREENREMARK",
        dest="SCREENREMARK",
        default="1",
        help="remark test information to screenshots. 0: no, 1: yes. Default value: 1")

    parser.add_argument(
        "--movie",
        "--MOVIE",
        dest="MOVIE",
        default="0",
        help="record movie for each scenario. Default value: 0")

    parser.add_argument(
        "--platform",
        "--PLATFORM",
        dest="PLATFORM",
        default="Linux",
        choices=["Linux", "Win7", "Win10"],
        help=
        "Run abdd on the given platform. Acceptable values: Linux, Win7, Win10. Default value: Linux"
    )

    parser.add_argument(
        "--browser",
        "--BROWSER",
        dest="BROWSER",
        default="CH",
        choices=["CH", "IE"],
        help=
        "Run abdd on the given browser. Acceptable values: CH, IE. Default value: CH"
    )

    parser.add_argument(
        "--debugmode",
        "--DEBUGMODE",
        dest="DEBUGMODE",
        default="None",
        choices=["None", "Elements", "Console", "Sources", "Network"],
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
        default="autobdd-test",
        help="Run abdd on the given project. Default value: webtest-example")

    parser.add_argument(
        "--modulelist",
        "--MODULELIST",
        nargs='+',
        dest="MODULELIST",
        default=['All'],
        help="Spece separated list of modules to run"
    )

    parser.add_argument(
        "--reportbase",
        "--REPORTBASE",
        dest="REPORTBASE",
        default=None,
        help=
        "The full path base directory for all reports into. Default: None, report will be archived in test-results under your BDD project"
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
        "--projecttype",
        "--PROJECTTYPE",
        dest="PROJECTTYPE",
        default="Auto",
        choices=["Auto", "Abdd", "Maven"],
        help=
        "project type to specify the suitable runner. Available options are \"Maven\", \"Abdd\", and \"Auto\". Default value: Auto"
    )

    parser.add_argument(
        '--version',
        '-v',
        action='version',
        version='%(prog)s V2.0'
    )

    parser.add_argument('RUNNER_ARGS', nargs=argparse.REMAINDER)

    args = parser.parse_args()

    if len(sys.argv) > 1:
        if sys.argv[1].startswith('+'):
            args = parser.parse_args(shlex.split(open(sys.argv[1][1:]).read()))
    
    return args

def definepath (case, project_name, report_dir_base):
    uri_array = case['uri'].split('/')
    del uri_array[:len(uri_array) - uri_array[::-1].index(project_name)]   # remove any path before project_name inclusive

    # use /features/ as the divider between module_path and feature_path
    module_path_array = uri_array[:uri_array.index('features')]
    feature_path_array = uri_array[uri_array.index('features'):]

    # clear extra path typically for Java projects
    if 'src' in module_path_array: module_path_array.remove('src')              # remove src
    if 'main' in module_path_array: module_path_array.remove('main')            # remove main
    if 'test' in module_path_array: module_path_array.remove('test')            # remove test
    if 'resources' in module_path_array: module_path_array.remove('resources')  # remove resources

    module_path = '/'.join(module_path_array)   # relative path to module
    module_name = module_path_array[0]          # module_name is the first level of module path
    feature_file = feature_path_array.pop()     # 1. get feature file name, 2. reduce file name from feature_path_array
    feature_path = '/'.join(feature_path_array) # relative path to feature without feature file

    report_dir_relative = module_path
    report_dir_full = path.join(report_dir_base, report_dir_relative)

    if not path.exists(report_dir_full):
        os.makedirs(report_dir_full)

    feature_name = ''
    with open(case['uri']) as myfile:
        for line in myfile.readlines():
            if re.search(r'^Feature:', line):                
                feature_name = line
                break
    
    result_base = path.join(report_dir_full)
    result_json = result_base + '/' + feature_name.replace('Feature:', '').strip().replace(' ', '-').lower() + '.json'
    result_run  = result_base + '/' + feature_file.lower() + '.run'

    # Handle space in feature_file
    feature_file = feature_file.replace(' ', r'\ ' )

    # print(module_path, module_name, feature_path, feature_file, result_json, result_run, report_dir_relative)
    return module_path, module_name, feature_path, feature_file, result_json, result_run, report_dir_relative

def run_test(FrameworkPath,
              host,
              platform,
              browser,
              project_base,
              project_name,
              module_full_path,
              feature_path,
              feature_file,
              movie,
              screenshot,
              screenremark,
              debugmode,
              display_size,
              abdd_profile,
              isMaven,
              runner_args,
              report_dir_base,
              report_dir_relative,
              result_json,
              result_run):
    ''' Run Test'''
    cmd = ''
    run_feature = path.join(module_full_path, feature_path, feature_file)
    if platform == 'Linux':
        if isMaven: #isMaven on Linux
            cmd = 'cd ' + module_full_path + ';' + \
                ' PROJECTBASE=' + project_base + \
                ' ABDD_PROJECT=' + project_name + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' SCREENREMARK=' + screenremark + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode +  \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' RUNREPORT=' + os.path.basename(result_run) + \
                ' ' + FrameworkPath + '/framework/scripts/xvfb-runner.sh' + \
                ' mvn clean test -Dbrow ser=\"chrome\" -Dcucumber.options=\"'  + run_feature + \
                ' --plugin pretty --add-plugin json:' + result_json + \
                ' 2>&1 > ' + result_run + ';' + \
                ' cat ' + result_run + ' | ansi2html > ' + result_run + '.html'
        else: #isAbdd on Linux
            cmd = 'cd ' + module_full_path + ';' + \
                ' PROJECTBASE=' + project_base + \
                ' ABDD_PROJECT=' + project_name + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' SCREENREMARK=' + screenremark + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode +  \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' RUNREPORT=' + os.path.basename(result_run) + \
                ' ' + FrameworkPath + '/framework/scripts/xvfb-runner.sh' + \
                ' npx wdio ' + abdd_profile + ' --spec ' + run_feature + \
                ' ' + runner_args + \
                ' 2>&1 > ' + result_run + ';' + \
                ' cat ' + result_run + ' | ansi2html > ' + result_run + '.html'
    elif platform == 'Win7' or platform == 'Win10':
        if isMaven: #isMaven on Windows
            for rdp in host:
                cmd = ''
                lock_file = ''
                time.sleep(random.uniform(0, 3))
                # avoid different process using same SSH PORT simultaneously
                lock_file = '/tmp/rdesktop.' + rdp['SSHHOST'] + ':' + rdp[
                    'SSHPORT'] + '.lock'
                if not os.path.exists(lock_file):
                    open(lock_file, 'a').close()
                    print(' > Running remote Maven command:')
                    cmd = 'cd ' + module_full_path + ';' + \
                        ' PROJECTBASE=' + project_base + \
                        ' ABDD_PROJECT=' + project_name + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' SCREENREMARK=' + screenremark + \
                        ' DEBUGMODE=' + debugmode + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform +  \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' RUNREPORT=' + os.path.basename(result_run) + \
                        ' ' + FrameworkPath + '/framework/scripts/xvfb-runner.sh' + \
                        ' mvn clean test -Dbrow ser=\"chrome\" -Dcucumber.options=\"'  + run_feature + \
                        ' --plugin pretty --add-plugin json:' + result_json + \
                        ' 2>&1 > ' + result_run + ';' + \
                        ' cat ' + result_run + ' | ansi2html > ' + result_run + '.html'
                    break
        else: #isAbdd on Windows
            for rdp in host:
                cmd = ''
                lock_file = ''
                time.sleep(random.uniform(0, 3))
                # avoid different process using same SSH PORT simultaneously
                lock_file = '/tmp/rdesktop.' + rdp['SSHHOST'] + ':' + rdp[
                    'SSHPORT'] + '.lock'
                if not os.path.exists(lock_file):
                    open(lock_file, 'a').close()
                    cmd = 'cd ' + module_full_path + ';' + \
                        ' PROJECTBASE=' + project_base + \
                        ' ABDD_PROJECT=' + project_name + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' SCREENREMARK=' + screenremark + \
                        ' DEBUGMODE=' + debugmode + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform +  \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' RUNREPORT=' + os.path.basename(result_run) + \
                        ' ' + FrameworkPath + '/framework/scripts/xvfb-runner.sh' + \
                        ' npx wdio ' + abdd_profile + ' --spec ' + run_feature + \
                        ' ' + runner_args + \
                        ' 2>&1 > ' + result_run + ';' + \
                        ' cat ' + result_run + ' | ansi2html > ' + result_run + '.html'
                    break
    else:
        assert False, 'Can not process on {}'.format(platform)

    print('\nRunning: {}'.format(run_feature))
    print('Command: {}\n'.format(cmd))
    os.system(cmd)
    return run_feature

def get_scenario_status(scenario_out):
    scenario = json.loads(open(scenario_out).read())
    for element in scenario[0]['elements']:
        steps = element['steps']
        for step in steps:
            status = step['result']['status']
            if status in ['failed', 'skipped', 'notdefined', 'pending', 'ambiguous']:
                return 'failed'
    return 'passed'

class AbddAutoRun:
    '''
    run abdd
    '''

    def __init__(self, arguments):
        '''
            initialize local variables
        '''
        if 'TZ' not in environ:
            os.environ['TZ'] = 'UTC'
        time.tzset()

        if 'FrameworkPath' not in environ:
            self.FrameworkPath = path.join(environ['HOME'], 'Projects',
                                           'AutoBDD')
        else:
            self.FrameworkPath = environ['FrameworkPath']
        os.chdir(self.FrameworkPath)
        self.reportonly = arguments.REPORTONLY
        self.runtime_stamp = arguments.TIMESTAMP if arguments.TIMESTAMP else time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.parallel = arguments.PARALLEL
        self.screenshot = arguments.SCREENSHOT
        self.screenremark = arguments.SCREENREMARK
        self.movie = arguments.MOVIE
        self.platform = arguments.PLATFORM
        self.browser = arguments.BROWSER
        self.debugmode = arguments.DEBUGMODE
        self.projectbase = arguments.PROJECTBASE if arguments.PROJECTBASE else 'test-projects'
        self.project = arguments.PROJECT
        self.projecttype = arguments.PROJECTTYPE
        self.reportbase = arguments.REPORTBASE if arguments.REPORTBASE else path.join(
            self.FrameworkPath, self.projectbase, self.project, 'test-results')
        self.reportpath = arguments.REPORTPATH if arguments.REPORTPATH else '_'.join(
            (self.project, self.runtime_stamp))

        self.modulelist = arguments.MODULELIST
        runner_args = arguments.RUNNER_ARGS
        self.cucumberjs_dryrun_args = ' '.join([w.replace('cucumberOpts.', '').replace('tagExpression', 'tags').replace('=', '=\"') + '\"' for w in runner_args[1:]])
        self.wdio_run_args = ' '.join([w.replace('=', '=\"') + '\"' for w in runner_args[1:]])

        self.display_size = '1920x1200'

        self.project_full_path = path.join(self.FrameworkPath, self.projectbase, self.project)
        self.report_full_path = path.join(self.reportbase, self.reportpath)
        self.isMaven = self.isMavenProject (arguments.PROJECTTYPE)

        # Each runable module should have a abdd.js
        self.abdd_profile = path.join('abdd.js')
        # Create report directory
        if not path.exists(path.join(self.FrameworkPath, self.reportbase)):
            os.makedirs(path.join(self.FrameworkPath, self.reportbase))
        self.report_dir_base = path.join(self.reportbase, self.reportpath)
        try:
            os.makedirs(self.report_dir_base)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
        print('\n*** Report Directory: ***\n {}'.format(self.report_dir_base))

        # remove /tmp/*.lock file
        for item in os.listdir('/tmp/'):
            if item.endswith(".lock"):
                os.remove('/tmp/' + item)

        self.host = []
        self.available_pool_number = 0
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.get_available_host()

        pprint(vars(self))

    def isMavenProject(self, args):
        result = False
        if ( self.projecttype.lower() == "abdd" or self.projecttype.lower() == "abdd"):
            result = False
        elif (self.projecttype.lower() == "maven" or self.projecttype.lower() == "mvn"):
            result = True
        else: #auto-detect
            # print('*** Project Type is set to auto-detect ***')
            for fname in os.listdir (self.project_full_path):
                if "pom.xml" in fname:
                    result = True
                    break
        # print('*** is Maven = {}'.format (result))
        return result

    def create_dryrun_json(self):
        from autorunner_dryrun import AbddDryRun
        dry_run = AbddDryRun(self.projectbase, self.project,
                                self.modulelist, self.platform, self.browser,
                                self.cucumberjs_dryrun_args, self.report_full_path)
        self.run_json = dry_run.create_run_json()
        return self.run_json
        
    def update_tinydb(self, tinyrundb_json, run_json, rerunWhat):
        db = TinyDB(tinyrundb_json, sort_keys=True, indent=4, separators=(',', ': '))
        db.drop_table('_default')
        query = Query()
        runcases = json.loads(open(run_json).read())
        for case in runcases:
            if case['feature'] in db.tables():
                feature_table = db.table(case['feature'])
                if (rerunWhat is not None) and (len(feature_table.search(query.status == rerunWhat)) > 0):
                    feature_table.update({'status': 'rerun'})
            else:
                feature_table = db.table(case['feature'])
                feature_table.insert(case)
        db.close()

    def get_available_host(self):
        '''
        get avaiable host by reading config file
        '''
        config_file = path.join(self.FrameworkPath, 'framework', 'configs', 'abdd_run_host.config')
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
                    if hostdict['Status'] == 'on':  # and hostdict['Platform'] == self.platform:
                        self.available_pool_number += int(hostdict['Thread'])
                        self.host.append(hostdict)
                        print(self.host)

        assert len(
            self.
            host) > 0, 'No host is avilable! Check file: abdd_run_host.config'

    def generate_reports(self, dbfile):
        '''

        '''
        # get run duration
        t1 = self.runtime_stamp
        t2 = self.end_time
        stime = datetime(
            int(t1[:4]), int(t1[4:6]), int(t1[6:8]), int(t1[9:11]),
            int(t1[11:13]), int(t1[13:15]))
        etime = datetime(
            int(t2[:4]), int(t2[4:6]), int(t2[6:8]), int(t2[9:11]),
            int(t2[11:13]), int(t2[13:15]))
        run_duration = str(etime - stime)
        print('Run Duration: {}'.format(run_duration))

        # generate cucumber report json file
        db = TinyDB(dbfile, sort_keys=True, indent=4, separators=(',', ': '))
        db.drop_table('_default')
        query = Query()
        cucumber_report_json = []
        for table in db.tables():
            group = db.table(table)
            reportList = group.search(query.status != 'crashed')
            feature_report = None
            for case in reportList:
                if os.path.exists(case['result_json']): # process new result
                    element = json.loads(open(case['result_json']).read())[0]
                    os.rename(case['result_json'], case['result_json'] + '.processed')
                elif os.path.exists(case['result_json'] + '.processed'): # process existing result
                    element = json.loads(open(case['result_json'] + '.processed').read())[0]
                else:
                    group.update({'status': 'crashed'}, doc_ids=[case.doc_id])
                if not feature_report:
                    feature_report = element
                else:
                    feature_report['elements'].append(element['elements'][0])
            if feature_report is not None:
                cucumber_report_json.append(feature_report)
        db.close()

        report_json_path = os.path.join(self.report_dir_base, 'cucumber-report.json')
        with open(report_json_path, 'w') as fname:
            json.dump(cucumber_report_json, fname, indent=4)

        # generate cucumber HTML report
        report_html_path = report_json_path[:report_json_path.rfind('json')] + 'html'
        
        if self.browser == 'CH':
            report_browser = 'chrome'
            report_browser_ver = subprocess.run('google-chrome --version'.split(), stdout=subprocess.PIPE) \
                .stdout.decode('utf-8') \
                .replace('Google Chrome', '') \
                .strip()
        elif self.browser == 'FF':
            report_browser = 'firefox'
            report_browser_ver = subprocess.run('firefox --version'.split(), stdout=subprocess.PIPE) \
                .stdout.decode('utf-8') \
                .replace('Mozilla Firefox', '') \
                .strip()
        elif self.browser == 'IE':
            report_browser = 'internet explorer'
            report_browser_ver = 'Unknown'
        else:
            report_browser = self.browser
            report_browser_ver = 'Unknown'

        cmd_generate_html_report = path.join(self.FrameworkPath, 'framework', 'scripts', 'generate-reports.js') + ' ' + \
            '--reportJson=' + report_json_path + ' ' + \
            '--reportName=\'AutoBDD HTML Report\' ' +  \
            '--reportTitle=' + self.project + ' ' + \
            '--testPlatform=' + self.platform + ' ' + \
            '--testPlatformVer=\'Ubuntu 20.04\' ' + \
            '--testBrowser=' + report_browser + ' ' + \
            '--testBrowserVer=' + report_browser_ver + ' ' + \
            '--testThreads=' + self.parallel + ' ' + \
            '--testStartTime=' + self.runtime_stamp + ' ' + \
            '--testRunDuration=' + run_duration + ' ' + \
            '--testRunnerArgs="' + self.wdio_run_args + '"'
        print('Generate HTML Report On: {}'.format(report_html_path))
        print(cmd_generate_html_report)
        os.system(cmd_generate_html_report)

        # generate cucumber XML report
        report_xml_path = report_json_path[:report_json_path.rfind('json')] + 'xml'
        cmd_generate_xml_report = 'cat ' + report_json_path + \
                                    ' | cucumber-junit --strict > ' + \
                                    report_xml_path
        print('Generate XML Report On: {}'.format(report_xml_path))
        print(cmd_generate_xml_report)
        os.system(cmd_generate_xml_report)

    def run_in_parallel(self, dbfile):
        '''
        run abdd in parallel

        1. determine parallel pool size base on parallel input or CPU count
        2. from db find case of 'notrun' and 'rerun'

        '''
        # set sub process pool number
        used_pool_number = None
        if self.parallel == 'MAX':
            # using all available rdp host in config file
            used_pool_number = int(self.available_pool_number)
        elif self.parallel == 'CPU':
            # using cpu count
            cpu_count = multiprocessing.cpu_count()
            if self.movie == '1':
                used_pool_number = cpu_count / 1.5
            else:
                used_pool_number = cpu_count
            if used_pool_number < 1:
                used_pool_number = 1
        else:
            used_pool_number = min(int(self.available_pool_number), int(self.parallel))
        
        used_pool_number = int(used_pool_number)
        self.parallel = str(used_pool_number)
        pool = multiprocessing.Pool(used_pool_number)

        print('USED POOL NUMBER: {}'.format(used_pool_number))

        db = TinyDB(dbfile, sort_keys=True, indent=4, separators=(',', ': '))

        # each feature is a table, scenarios are entries in a table
        # here we identify any feature contains scenario that is notrun or failed and run the entire feature
        progress = []
        runCount = 0
        for table in db.tables():
            group = db.table(table)
            query = Query()
            case  = None
            runList = group.search((query.status == 'notrun') | (query.status == 'rerun'))
            runCount += len(runList)
            if len(runList) > 0 :
                case = runList[0]
                if case.doc_id:
                    module_path, module_name, feature_path, feature_file, result_json, result_run , report_dir_relative = definepath(
                    case, self.project, self.report_dir_base)
                    module_full_path = path.join(self.projectbase, self.project, module_path)
                    group.update({'status': 'running', 'result_json': result_json, 'result_run': result_run}, doc_ids=[case.doc_id])
                    r = pool.apply_async(run_test,  args=(self.FrameworkPath,
                                                    self.host,
                                                    self.platform,
                                                    self.browser,
                                                    self.projectbase,
                                                    self.project,
                                                    module_full_path,
                                                    feature_path,
                                                    feature_file,
                                                    self.movie,
                                                    self.screenshot,
                                                    self.screenremark,
                                                    self.debugmode,
                                                    self.display_size,
                                                    self.abdd_profile,
                                                    self.isMaven,
                                                    self.wdio_run_args,
                                                    self.report_dir_base,
                                                    report_dir_relative,
                                                    result_json,
                                                    result_run))
                    progress.append(r)
                else:
                    break
        
        print('Expected total: {}'.format(runCount))
        overall = 0
        while overall < runCount:
            scan = 0
            time.sleep(1)
            for r in progress:
                if r.ready():
                    scan += 1
                    done_feature = r.get()
                    for table in db.tables():
                        group = db.table(table)
                        query = Query()
                        runList = group.search(query.status == 'running')
                        for case in runList:
                            if done_feature in case['uri']:
                                if os.path.exists(case['result_json']) and os.path.getsize(case['result_json']) > 0:
                                    resultString = ''
                                    with open(case['result_json']) as f:
                                        resultString = f.read()
                                    if re.search(r'"status": ?"failed"', resultString):
                                        group.update({'status': 'failed'}, doc_ids=[case.doc_id])
                                    else:
                                        group.update({'status': 'passed'}, doc_ids=[case.doc_id])
                                else:
                                    group.update({'status': 'crashed'}, doc_ids=[case.doc_id])
            if scan > overall:
                overall = scan
                print('Progress: {} of {} done'.format(overall, runCount))

        # all parallel jobs are done
        pool.close()
        pool.join()
        db.close()

        # Wait for test to finish then record the end time
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())

if __name__ == "__main__":
    command_arguments = parse_arguments()
    abdd_run = AbddAutoRun(command_arguments)
    
    if not command_arguments.REPORTONLY:
        print('\nRunning test in parallel\n')
        # first run start from dryrun_json
        run_feature_subjson = abdd_run.create_dryrun_json()
        rundb_json_path = path.join(abdd_run.report_full_path, 'db.subjson')
        abdd_run.update_tinydb(rundb_json_path, run_feature_subjson, None)
        abdd_run.run_in_parallel(rundb_json_path)
        # rerun will re-use previous dryrun_json
        # rerun failed then rerun crashed
        if command_arguments.RERUNFAILED:
            for n in range(0, int(command_arguments.RERUNFAILED)):
                print('\nRerunning failed test iteration: {}\n'.format(n))
                rundb_json_path = path.join(abdd_run.report_full_path, 'db.subjson')
                abdd_run.update_tinydb(rundb_json_path, run_feature_subjson, 'failed')
                abdd_run.run_in_parallel(rundb_json_path)
        if command_arguments.RERUNCRASHED:
            for n in range(0, int(command_arguments.RERUNCRASHED)):
                print('\nRerunning crashed test iteration: {}\n'.format(n))
                rundb_json_path = path.join(abdd_run.report_full_path, 'db.subjson')
                abdd_run.update_tinydb(rundb_json_path, run_feature_subjson, 'crashed')
                abdd_run.run_in_parallel(rundb_json_path)

    if not command_arguments.RUNONLY:
        print('\nGenerating reports\n')
        rundb_json_path = path.join(abdd_run.report_full_path, 'db.subjson')
        abdd_run.generate_reports(rundb_json_path)

