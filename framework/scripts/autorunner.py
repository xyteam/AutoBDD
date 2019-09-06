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
import re
import multiprocessing
import os.path as path
from os import environ
from datetime import datetime
from tinydb import TinyDB, Query
import shlex
from pprint import pprint

DB = None

def definepath (case, isMaven, project_base, project_name, report_dir_base):
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
    
    run_report = path.join(report_dir_full, re.sub('[^A-Za-z0-9\-\.]+', '_', feature_path))
    if int(case['line']) != 0:
        run_report += "_" + str(case['line'])
        run_feature += ":" + str(case['line'])

    #Handle space in feature_file
    run_feature = run_feature.replace(' ', '\ ')

    print(module_path, module_name, feature_path, feature_name, run_feature, run_report, report_dir_relative)

    return module_path, module_name, feature_path, feature_name, run_feature, run_report, report_dir_relative

def run_chimp(index,
              dblock,
              host,
              platform,
              browser,
              project_base,
              project_name,
              report_dir_base,
              movie,
              screenshot,
              debugmode,
              display_size,
              chimp_profile,
              total,
              project_type,
              isMaven,
              tagString):
    ''' Run '''
    time.sleep(random.uniform(1,5))
    #Get matched case from tinydb
    query = Query()
    group = None
    id    = None
    case  = None
    for table in DB.tables():
        group = DB.table(table)
        results = group.search((
            (query.status == 'notrun') | (query.status == 'failed')) & (
                query.platform == platform) & (query.browser == browser))
        if len(results) > 0:
            case = results[0]
            id   = results[0].doc_id
            break

    if not id: return

    dblock.acquire()    
    group.update ({'status': 'running'}, doc_ids=[id])
    dblock.release()

    module_path, module_name, feature_path, feature_name, run_feature, run_report, report_dir_relative = definepath(
        case, isMaven, project_base, project_name, report_dir_base)
    
    module_full_path = path.join(project_base, project_name, module_path)
    
    if platform == 'Linux':
        time.sleep(random.uniform(0, 1))

        cmd = ""
        if isMaven: #isMaven on Linux
            print (" > Running Maven command")
            cmd = 'cd ' + module_full_path + ';' + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode + \
                ' MODULE=' + module_name + \
                ' BROWSER=' + browser + \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' xvfb-run --auto-servernum --server-args=\"-screen 0 ' + display_size + 'x16\"' + \
                ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"' + feature_path + \
                ' --plugin pretty --add-plugin json:' + run_report + '.subjson\"' + \
                ' 2>&1 > ' + run_report + '.run'

        else: #isChimpy on Linux
            print (" > Running Chimpy command")
            cmd = 'cd ' + module_full_path + ';' + \
                ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                ' RELATIVEREPORTDIR=' + report_dir_relative + \
                ' MOVIE=' + movie + \
                ' SCREENSHOT=' + screenshot + \
                ' BROWSER=' + browser + \
                ' DEBUGMODE=' + debugmode + \
                ' MODULE=' + module_name + \
                ' BROWSER=' + browser + \
                ' DISPLAYSIZE=' + display_size + \
                ' PLATFORM=' + platform + \
                ' xvfb-run --auto-servernum --server-args="-screen 0 ' + display_size + 'x16"' + \
                ' chimpy ' + chimp_profile + ' ' + feature_path + \
                ' ' + tagString + \
                ' --format=json:' + run_report + '.subjson' \
                ' 2>&1 > ' + run_report + '.run'
    elif platform == 'Win7' or platform == 'Win10':
        if isMaven: #isMaven on Windows
            for rdp in host:
                cmd = ''
                lock_file = ''
                time.sleep(random.uniform(0, 1))
                # avoid different process using same SSH PORT simultaneously
                lock_file = '/tmp/rdesktop.' + rdp['SSHHOST'] + ':' + rdp[
                    'SSHPORT'] + '.lock'
                if not os.path.exists(lock_file):
                    open(lock_file, 'a').close()
                    cmd = 'cd ' + module_full_path + ';' + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' DEBUGMODE=' + debugmode + \
                        ' MODULE=' + module_name + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform + \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' xvfb-run --auto-servernum --server-args="-screen 0 ' + display_size + 'x16"' + \
                        ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"' + feature_path + \
                        ' --plugin pretty --add-plugin json:' + run_report + '.subjson\"' + \
                        ' 2>&1 > ' + run_report + '.run'
                    time.sleep(random.uniform(1, 2))
                    break
        else: #isChimpy on Windows
            for rdp in host:
                cmd = ''
                lock_file = ''
                time.sleep(random.uniform(0, 1))
                # avoid different process using same SSH PORT simultaneously
                lock_file = '/tmp/rdesktop.' + rdp['SSHHOST'] + ':' + rdp[
                    'SSHPORT'] + '.lock'
                if not os.path.exists(lock_file):
                    open(lock_file, 'a').close()
                    cmd = 'cd ' + module_full_path + ';' + \
                        ' REPORTDIR=' + report_dir_base + '/' + report_dir_relative + \
                        ' RELATIVEREPORTDIR=' + report_dir_relative + \
                        ' MOVIE=' + movie + \
                        ' SCREENSHOT=' + screenshot + \
                        ' DEBUGMODE=' + debugmode + \
                        ' MODULE=' + module_name + \
                        ' BROWSER=' + browser + \
                        ' DISPLAYSIZE=' + display_size + \
                        ' PLATFORM=' + platform + \
                        ' SSHHOST=' + rdp['SSHHOST'] + \
                        ' SSHPORT=' + rdp['SSHPORT'] + \
                        ' xvfb-run --auto-servernum --server-args="-screen 0 ' + display_size + 'x16"' + \
                        ' chimpy ' + chimp_profile + ' ' + feature_path + \
                        ' ' + tagString + \
                        ' --format=json:' + run_report + '.subjson' + \
                        ' 2>&1 > ' + run_report + '.run'
                    time.sleep(random.uniform(1, 2))
                    break
    else:
        assert False, 'Can not process on {}'.format(platform)

    print('RUNNING #{}: {}'.format(index, run_feature))
    print(cmd)

    time.sleep(1)
    os.system(cmd)

    # update test case status
    print('Update status on: {}'.format(group))

    dblock.acquire()
    group.update({'status': 'runned', "run_feature": run_report + '.subjson'}, doc_ids=[id])
    dblock.release()
    
    time.sleep(1)
    print('COMPLETED: {} of {}\'\''.format(index, total))

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
        default='CPU',
        help=
        "chimp parallel run number, if CPU is used, without MOVIE count is CPU - 1, with MOVIE count is CPU/2, minimum id 1"
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
        default="webtest-example",
        help="Run chimp on the given project. Default value: webtest-example")

    parser.add_argument(
        "--runlevel", "--RUNLEVEL",
        dest="RUNLEVEL",
        default="Feature",
        help="Run automation by 'Feature' or by 'Scenario' level. defalue value: Feature")

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
        default=['All'],
        help="Spece separated list of modules to run.")

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
        "--tags",
        "--TAGS",
        nargs='+',
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
        "--projecttype",
        "--PROJECTTYPE",
        dest="PROJECTTYPE",
        default="Auto",
        choices=["Auto", "Chimpy", "Maven"],
        help=
        "project type to specify the suitable runner. Available options are \"Maven\", \"Chimpy\", and \"Auto\". Default value: Auto"
    )

    parser.add_argument(
        '--version', '-v', action='version', version='%(prog)s V1.0')

    if sys.argv[1].startswith('+'):
        args = parser.parse_args (shlex.split (open (sys.argv[1][1:]).read()))
    else:
        args = parser.parse_args()

    # print('\nInput parameters:')
    # for arg in vars(args):
    #     print('{:*>15}: {}'.format(arg, getattr(args, arg)))

    return args

def get_scenario_status(scenario_out):
    scenario = json.loads(open(scenario_out).read())
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
        self.rumtime_stamp = arguments.TIMESTAMP if arguments.TIMESTAMP else time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.parallel = arguments.PARALLEL
        self.screenshot = arguments.SCREENSHOT
        self.movie = arguments.MOVIE
        self.platform = arguments.PLATFORM
        self.browser = arguments.BROWSER
        self.runlevel = arguments.RUNLEVEL
        self.debugmode = arguments.DEBUGMODE
        self.projectbase = arguments.PROJECTBASE if arguments.PROJECTBASE else 'test-projects'
        self.project = arguments.PROJECT
        self.projecttype = arguments.PROJECTTYPE
        self.reportbase = arguments.REPORTBASE if arguments.REPORTBASE else path.join(
            self.FrameworkPath, self.projectbase, self.project, 'bdd_reports')
        self.reportpath = arguments.REPORTPATH if arguments.REPORTPATH else '_'.join(
            (self.project, self.rumtime_stamp))

        self.modulelist = arguments.MODULELIST
        self.tagString = '--tags "' + ' '.join(arguments.TAGS) + '"' if arguments.TAGS else None
        self.dryrun_cases = arguments.RUNCASE
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

        self.rerun_dir = None
        if arguments.RERUN is not None:
            self.rerun_dir = path.join(
                path.abspath(path.join(self.report_dir_base, '..')),
                arguments.RERUN)
            assert path.exists(self.rerun_dir), '{} is not exits'.format(
                self.rerun_dir)

        # remove /tmp/*.lock file
        for item in os.listdir('/tmp/'):
            if item.endswith(".lock"):
                os.remove('/tmp/' + item)

        self.run_count = 0
        self.host = []
        self.thread_count = 0
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
            # print ("*** Project Type is set to auto-detect ***")
            for fname in os.listdir (self.project_full_path):
                if "pom.xml" in fname:
                    result = True
                    break
        # print ( "*** is Maven = {}".format (result))
        return result

    def get_dry_run_out(self):
        if self.dryrun_cases:
            assert path.exists(self.dryrun_cases)
        else:
            from autorunner_dryrun import ChimpDryRun
            dry_run = ChimpDryRun(self.projectbase, self.project,
                                  self.modulelist, self.platform, self.browser,
                                  self.tagString, self.report_full_path)
            self.dryrun_cases = dry_run.get_dry_run_results()

    def is_rerun(self):
        return True if self.rerun_dir else False

    @staticmethod
    def new_tinydb(report_path):
        tinydb_path = path.join(report_path, 'db.subjson')
        return TinyDB(tinydb_path, indent=4)

    def copy_db_file(self):
        shutil.copy2(path.join(self.rerun_dir, 'db.subjson'), self.report_dir_base)

    def init_tinydb(self):
        if self.is_rerun():
            for table in DB.tables():
                group = DB.table(table)
                for item in group:
                    status = get_scenario_status(item['run_feature'])
                    if status is not 'passed':
                        self.run_count += 1
                    group.update({'status': status}, doc_ids=[item.doc_id])
        else:
            runcases = json.loads(open(self.dryrun_cases).read())
            if self.runlevel.strip().lower() == 'feature':
                for case in runcases:
                    if case['feature'] not in DB.tables():
                        case['run_feature'] = None
                        case['line'] = 0
                        table = DB.table(case['feature'])
                        table.insert(case)
                self.run_count = len(DB.tables())
            else:
                #print ( "Scenario number in tinydb --> {}".format(self.run_count))
                for case in runcases:
                    case['run_feature'] = None
                    table = DB.table(case['feature'])
                    table.insert(case)
                    #print ("Case --> {}\n".format(case))
                self.run_count = len(runcases)

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
                        print (self.host)

        assert len(
            self.
            host) > 0, 'No host is avilable! Check file: chimp_run_host.config'
        # print('\n*** Avaliable Host: ***')
        # for item in self.host:
        #     print(item)
        # print('Maximum thread count: {}'.format(self.thread_count))
        # print('*** \n ')

    def generate_reports(self):
        '''

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

        # generate cucumber report json file
        query = Query()
        cucumber_report_json = []
        for table in DB.tables():
            group = DB.table(table)
            results = group.search((query.status == 'runned') | (query.status == 'passed'))
            feature_report = None
            for item in results:
                element = json.loads(open(item['run_feature']).read())[0]
                if not feature_report:
                    feature_report = element
                else:
                    feature_report['elements'].append(element['elements'][0])
            cucumber_report_json.append(feature_report)

        report_json_path = os.path.join(self.report_dir_base, 'cucumber-report.json')
        with open(report_json_path, 'w') as fname:
            json.dump(cucumber_report_json, fname, indent=4)

        if self.is_rerun():
            for fname in os.listdir(self.rerun_dir):
                if fname.startswith('Passed_') and fname.endswith('.png'):
                    shutil.copy2(path.join(self.rerun_dir, fname), self.report_dir_base)

        # generate cucumber HTML report
        report_html_path = report_json_path[:report_json_path.rfind('json')] + 'html'
        cmd_generate_html_report = path.join(self.FrameworkPath, 'framework', 'scripts', 'generate-reports.js') + ' ' + \
            '--reportJson=' + report_json_path + ' ' + \
            '--reportName=\'AutoBDD HTML Report\' ' +  \
            '--reportTitle=' + self.project + ' ' + \
            '--testPlatform=' + self.platform + ' ' + \
            '--testPlatformVer=\'Ubuntu 18.04\' ' + \
            '--testBrowser=' + self.browser + ' ' + \
            '--testThreads=' + self.parallel + ' ' + \
            '--testStartTime=' + self.rumtime_stamp + ' ' + \
            '--testRunDuration=' + run_duration + ' ' + \
            '--testRerunPath=' + str(self.rerun_dir) + ' ' + \
            '--testRunTags="' + self.tagString + '"'
        print('Generate HTML Report On: {}'.format(report_html_path))
        print(cmd_generate_html_report)
        os.system(cmd_generate_html_report)

        # generate cucumber XML report
        report_xml_path = report_json_path[:report_json_path.rfind('json')] + 'xml'
        cmd_generate_xml_report = 'cat ' + report_json_path + \
                                    ' | cucumber-junit > ' + \
                                    report_xml_path
        print('Generate XML Report On: {}'.format(report_xml_path))
        print(cmd_generate_xml_report)
        os.system(cmd_generate_xml_report)

    def run_in_parallel(self):
        '''
        run chimp in parallel
        '''
        # set sub process pool number
        if self.parallel == 'MAX':
            # using all available rdp host in config file
            pool_number = int(self.thread_count)
        elif self.parallel == 'CPU':
            # using cpu count
            cpu_count = multiprocessing.cpu_count()
            if self.movie == '1':
                pool_number = cpu_count / 2
            else:
                pool_number = cpu_count - 1                
            if pool_number < 1:
                pool_number = 1
        else:
            pool_number = min(int(self.thread_count), int(self.parallel))
        self.parallel = str(pool_number)
        print('POOL NUMBER: {}'.format(pool_number))
        print('TOTAL {}(s): {}'.format(self.runlevel.upper(), self.run_count))

        pool = multiprocessing.Pool(pool_number)
        manager = multiprocessing.Manager()
        lock = manager.Lock()
        for index in range(1, self.run_count + 1):
            pool.apply_async(
                run_chimp,
                args=(index, lock, self.host, self.platform, self.browser,
                    self.projectbase, self.project, self.report_dir_base,
                    self.movie, self.screenshot,
                    self.debugmode, self.display_size, self.chimp_profile ,
                    self.run_count, self.projecttype,
                    self.isMaven, self.tagString))
        pool.close()
        pool.join()

        # Wait for test to finish then record the end time
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())


if __name__ == "__main__":
    command_arguments = parse_arguments()
    chimp_run = ChimpAutoRun(command_arguments)

    if chimp_run.is_rerun():
        chimp_run.copy_db_file()
    else:
        chimp_run.get_dry_run_out()
    DB = chimp_run.new_tinydb(chimp_run.report_dir_base)
    if '_default' in DB.tables():
        DB.purge_table('_default')
    chimp_run.init_tinydb()

    if command_arguments.RUNONLY:
        chimp_run.run_in_parallel()
    elif command_arguments.REPORTONLY:
        chimp_run.generate_reports()
    else:
        chimp_run.run_in_parallel()
        chimp_run.generate_reports()
    DB.close()
