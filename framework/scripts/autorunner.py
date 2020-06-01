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

def definepath (case, project_name, report_dir_base):
    uri_array = case['uri'].split('/')
    del uri_array[:len(uri_array) - uri_array[::-1].index(project_name)]   # remove any path before project_name inclusive
    run_feature = '/'.join(uri_array)

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
    feature_path = '/'.join(feature_path_array) # relative path to feature including feature file
    feature_name = feature_path_array[-1]       # feature file name

    report_dir_relative = module_path
    report_dir_full = path.join(report_dir_base, report_dir_relative)

    if not path.exists(report_dir_full):
        os.makedirs(report_dir_full)
    
    run_result = path.join(report_dir_full, re.sub('[^A-Za-z0-9\-\.]+', '_', feature_path)) + '.subjson'
    run_report = path.join(report_dir_full, re.sub('[^A-Za-z0-9\-\.]+', '_', feature_path)) + '.run'

    # Handle space in feature_file
    run_feature = run_feature.replace(' ', '\ ')

    # print(module_path, module_name, feature_path, feature_name, run_result, run_report, report_dir_relative)
    return module_path, module_name, feature_path, feature_name, run_result, run_report, report_dir_relative

def run_test(FrameworkPath,
              host,
              platform,
              browser,
              project_base,
              project_name,
              module_full_path,
              feature_file,
              movie,
              screenshot,
              screenremark,
              debugmode,
              display_size,
              chimp_profile,
              isMaven,
              argstring,
              report_dir_base,
              report_dir_relative,
              run_result,
              run_report):
    ''' Run Test'''
    cmd = ''
    run_feature = path.join(module_full_path, feature_file)
    if platform == 'Linux':
        if isMaven: #isMaven on Linux
            cmd = 'cd ' + module_full_path + ';' + \
                ' PROJECTBASE=' + project_base + \
                ' PROJECTNAME=' + project_name + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' SCREENREMARK=' + screenremark + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode + \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' RUNREPORT=' + os.path.basename(run_report) + \
                ' ' + FrameworkPath + '/framework/scripts/xvfb-run-safe.sh --server-args=\"-screen 0 ' + display_size + 'x24\"' + \
                ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"' + feature_file + \
                ' --plugin pretty --add-plugin json:' + run_result + \
                ' 2>&1 > ' + run_report + ';' + \
                ' cat ' + run_report + ' | ansi2html > ' + run_report + '.html'
        else: #isChimpy on Linux
            cmd = 'cd ' + module_full_path + ';' + \
                ' PROJECTBASE=' + project_base + \
                ' PROJECTNAME=' + project_name + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' SCREENREMARK=' + screenremark + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode + \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' RUNREPORT=' + os.path.basename(run_report) + \
                ' ' + FrameworkPath + '/framework/scripts/xvfb-run-safe.sh --server-args="-screen 0 ' + display_size + 'x24"' + \
                ' chimpy ' + chimp_profile + ' ' + feature_file + \
                ' --format=json:' + run_result + \
                ' ' + argstring + \
                ' 2>&1 > ' + run_report + ';' + \
                ' cat ' + run_report + ' | ansi2html > ' + run_report + '.html'
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
                        ' PROJECTNAME=' + project_name + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' SCREENREMARK=' + screenremark + \
                        ' DEBUGMODE=' + debugmode + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform + \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' RUNREPORT=' + os.path.basename(run_report) + \
                        ' ' + FrameworkPath + '/framework/scripts/xvfb-run-safe.sh --server-args="-screen 0 ' + display_size + 'x24"' + \
                        ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"' + feature_file + \
                        ' --plugin pretty --add-plugin json:' + run_result + \
                        ' 2>&1 > ' + run_report + ';' + \
                        ' cat ' + run_report + ' | ansi2html > ' + run_report + '.html'
                    break
        else: #isChimpy on Windows
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
                        ' PROJECTNAME=' + project_name + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' SCREENREMARK=' + screenremark + \
                        ' DEBUGMODE=' + debugmode + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform + \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' RUNREPORT=' + os.path.basename(run_report) + \
                        ' ' + FrameworkPath + '/framework/scripts/xvfb-run-safe.sh --server-args="-screen 0 ' + display_size + 'x24"' + \
                        ' chimpy ' + chimp_profile + ' ' + feature_file + \
                        ' --format=json:' + run_result + \
                        ' ' + argstring + \
                        ' 2>&1 > ' + run_report + ';' + \
                        ' cat ' + run_report + ' | ansi2html > ' + run_report + '.html'
                    break
    else:
        assert False, 'Can not process on {}'.format(platform)

    print('\nRunning: {}'.format(run_feature))
    print('Command: {}\n'.format(cmd))
    os.system(cmd)
    return run_feature

def parse_arguments():
    '''
    parse command line arguments
    '''
    descript = "This python scripts can be used to run chimp/maven in parallel and generate cucumber report. "
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
        "chimp parallel run number, if CPU is used, without MOVIE count is CPU - 1, with MOVIE count is CPU/2, minimum id 1"
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
        "Run chimp on the given platform. Acceptable values: Linux, Win7, Win10. Default value: Linux"
    )

    parser.add_argument(
        "--browser",
        "--BROWSER",
        dest="BROWSER",
        default="CH",
        choices=["CH", "IE"],
        help=
        "Run chimp on the given browser. Acceptable values: CH, IE. Default value: CH"
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
        default="simple-test",
        help="Run chimp on the given project. Default value: webtest-example")

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
        "The full path base directory for all reports into. Default: None, report will be archived in bdd_reports under your BDD project"
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
        "--argstring",
        "--ARGSTRING",
        dest="ARGSTRING",
        default='',
        help="Additoinal Cucumber Args in a quoted string"
    )

    parser.add_argument(
        "--projecttype",
        "--PROJECTTYPE",
        dest="PROJECTTYPE",
        default="Auto",
        choices=["Auto", "Chimpy", "Maven"],
        help=
        "project type to specify the suitable runner. Available options are \"Maven\", \"Chimpy\", and \"Auto\". Default value: Auto"
    )

    parser.add_argument(
        '--version',
        '-v',
        action='version',
        version='%(prog)s V1.0'
    )

    args = parser.parse_args()
    if len(sys.argv) > 1:
        if sys.argv[1].startswith('+'):
            args = parser.parse_args(shlex.split(open(sys.argv[1][1:]).read()))
    return args

def get_scenario_status(scenario_out):
    scenario = json.loads(open(scenario_out).read(), encoding='utf-8')
    for element in scenario[0]['elements']:
        steps = element['steps']
        for step in steps:
            status = step['result']['status']
            if status in ['failed', 'skipped', 'notdefined', 'pending', 'ambiguous']:
                return 'failed'
    return 'passed'

class ChimpAutoRun:
    '''
    run chimp
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
            self.FrameworkPath, self.projectbase, self.project, 'bdd_reports')
        self.reportpath = arguments.REPORTPATH if arguments.REPORTPATH else '_'.join(
            (self.project, self.runtime_stamp))

        self.modulelist = arguments.MODULELIST
        self.argstring = arguments.ARGSTRING
        self.display_size = '1920x1200'

        self.project_full_path = path.join(self.FrameworkPath, self.projectbase, self.project)
        self.report_full_path = path.join(self.reportbase, self.reportpath)
        self.isMaven = self.isMavenProject (arguments.PROJECTTYPE)

        # Each runable module should have a chimp.js
        self.chimp_profile = path.join('chimp.js')
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
        if ( self.projecttype.lower() == "chimp" or self.projecttype.lower() == "chimpy"):
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
        from autorunner_dryrun import ChimpDryRun
        dry_run = ChimpDryRun(self.projectbase, self.project,
                                self.modulelist, self.platform, self.browser,
                                self.argstring, self.report_full_path)
        self.run_json = dry_run.create_run_json()
        return self.run_json
        
    def update_tinydb(self, tinyrundb_json, run_json, rerunWhat):
        db = TinyDB(tinyrundb_json, sort_keys=True, indent=4, separators=(',', ': '))
        db.drop_table('_default')
        query = Query()
        runcases = json.loads(open(run_json).read(), encoding='utf-8')
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
        config_file = path.join(self.FrameworkPath, 'framework', 'configs', 'chimp_run_host.config')
        assert path.exists(config_file), '{} is not exits'.format(config_file)

        with open(config_file, encoding='utf-8') as fname:
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
            host) > 0, 'No host is avilable! Check file: chimp_run_host.config'

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
            for item in reportList:
                element = json.loads(open(item['run_result'], encoding='utf-8').read())[0]
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
            '--testPlatformVer=\'Ubuntu 18.04\' ' + \
            '--testBrowser=' + report_browser + ' ' + \
            '--testBrowserVer=' + report_browser_ver + ' ' + \
            '--testThreads=' + self.parallel + ' ' + \
            '--testStartTime=' + self.runtime_stamp + ' ' + \
            '--testRunDuration=' + run_duration + ' ' + \
            '--testRunArgs="' + self.argstring + '"'
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
        run chimp in parallel

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
                used_pool_number = cpu_count / 2
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
            if len(runList) > 0:
                case = runList[0]
                if case.doc_id:
                    module_path, module_name, feature_path, feature_name, run_result, run_report, report_dir_relative = definepath(
                    case, self.project, self.report_dir_base)
                    module_full_path = path.join(self.projectbase, self.project, module_path)
                    group.update({'status': 'running', 'run_result': run_result, 'run_report': run_report}, doc_ids=[case.doc_id])
                    r = pool.apply_async(run_test,  args=(self.FrameworkPath,
                                                    self.host,
                                                    self.platform,
                                                    self.browser,
                                                    self.projectbase,
                                                    self.project,
                                                    module_full_path,
                                                    feature_path,
                                                    self.movie,
                                                    self.screenshot,
                                                    self.screenremark,
                                                    self.debugmode,
                                                    self.display_size,
                                                    self.chimp_profile,
                                                    self.isMaven,
                                                    self.argstring,
                                                    self.report_dir_base,
                                                    report_dir_relative,
                                                    run_result,
                                                    run_report))
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
                                if os.path.exists(case['run_result']) and os.path.getsize(case['run_result']) > 0:
                                    resultString = ''
                                    failedString = '"status": "failed"'
                                    with open(case['run_result'], encoding='utf-8') as f:
                                        resultString = f.read()
                                    if (resultString.find(failedString) >= 0):
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
    chimp_run = ChimpAutoRun(command_arguments)
    rundb_json_path = path.join(chimp_run.report_full_path, 'db.subjson')
    
    if not command_arguments.REPORTONLY:
        print('\nRunning test in parallel\n')
        # first run start from dryrun_json
        run_feature_subjson = chimp_run.create_dryrun_json()
        chimp_run.update_tinydb(rundb_json_path, run_feature_subjson, None)
        chimp_run.run_in_parallel(rundb_json_path)
        # rerun will re-use previous dryrun_json
        if command_arguments.RERUNFAILED:
            for n in range(0, int(command_arguments.RERUNFAILED)):
                print('\nRerunning failed test iteration: {}\n'.format(n))
                chimp_run.update_tinydb(rundb_json_path, run_feature_subjson, 'failed')
                chimp_run.run_in_parallel(rundb_json_path)
        if command_arguments.RERUNCRASHED:
            for n in range(0, int(command_arguments.RERUNCRASHED)):
                print('\nRerunning crashed test iteration: {}\n'.format(n))
                chimp_run.update_tinydb(rundb_json_path, run_feature_subjson, 'crashed')
                chimp_run.run_in_parallel(rundb_json_path)

    if not command_arguments.RUNONLY:
        print('\nGenerating reports\n')
        chimp_run.generate_reports(rundb_json_path)

