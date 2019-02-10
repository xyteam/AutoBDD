#!/usr/bin/env python
'''
Type python autorunner.py --help for more informantion
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

def definepath (case, isMaven, features_path, index, report_dir):
    uri_array = case['uri'].split('/')

    if isMaven:
        modulepath_length = 3  #[project_base]/[project_name]/[module]
        featurespath_length = len(filter(None, features_path.split('/')))
        runfile_length = modulepath_length + featurespath_length
        module_index = modulepath_length - 1
    else:
        modulepath_length = -2 #...[..]/[test.feature]
        runfile_length = -2
        module_index = -1 #for chimpy, it will get the xxx.features (xxx as module)

    module_path = '/'.join(uri_array[0:modulepath_length])
    module = uri_array[module_index].split('.')[0]
    run_file = '/'.join(uri_array[runfile_length:]) + ":" + str(case['line'])
    report_file = report_dir + '/' + case['uri'].replace('/', '_') + "-" + str(index)

    return module_path, module, run_file, report_file

def run_chimp(index, 
              host, 
              platform, 
              browser, 
              report_dir, 
              movie, 
              screenshot,
              debugmode, 
              display_size, 
              chimp_profile, 
              project_type, 
              features_path):
    ''' Run '''
    if platform == 'Linux':
        print ("\n### CHIMPY RUN START - {} ### =====================================".format(index))
        time.sleep(random.uniform(0, 2))
        #Get matched case from tinydb
        case = Query()

        results = DB.search((case.status == 'notrun') & (
            case.platform == platform) & (case.browser == browser))
        print (" > results {}".format(results))
        if len(results) == 0:
            return
        case = results[0]
        DB.update({'status': 'running'}, doc_ids=[case.doc_id])
 
        # uri_array = case['uri'].split('/')
        # print ("    > uri_array -->     {}".format(uri_array))
        # module_path = '/'.join(uri_array[0:-2])
        # print ("    > module_Path -->   {}".format(module_path))
        # module = uri_array[-1].split('.')[0]
        # print ("    > module -->        {}".format(module))
        # report_file = report_dir + '/' + case['uri'].replace('/', '_') + "-" + str(index)
        # print ("    > report_file -->   {}".format(report_file))
        # run_file = '/'.join(uri_array[-2:]) + ':' + str(case['line'])    
        # print ("    > run_file -->>     {}".format(run_file))

        module_path, module, run_file, report_file = definepath (case, 
                                                                 isMaven, 
                                                                 features_path, 
                                                                 index, 
                                                                 report_dir)

        
        time.sleep(random.uniform(0, 1))
        cmd = ""
        if isMaven:
            print (" > Running Maven command")
            print ("    > Actual runfile --> {}".format(run_file))
            print ("    > module_Path -->    {}".format(module_path))
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
                ' mvn clean test -Dbrowser=\"chrome\" -Dcucumber.options=\"' + path.join (features_path, run_file) + \
                ' --plugin pretty --add-plugin json:' + report_file + '.json\"' + \
                ' 2>&1 > ' + report_file + '.run'
        else:
            print (" > Running Chimpy command")
            print ("    > Actual runfile --> {}".format(run_file))
            print ("    > module_Path -->    {}".format(module_path))
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

        
        print('RUNNING #{}: {}'.format(index, run_file))
        # print(cmd)

        print ("==== ACTUAL COMMAND EXECUTED ====")
        print (cmd)
        print ("==== END OF COMMAND ====")

        os.system(cmd)


        # update test case status
        DB.update({'status': 'runned'}, doc_ids=[case.doc_id])
        print ("### CHIMPY RUN END ### =====================================\n\n")

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

    parser = argparse.ArgumentParser(fromfile_prefix_chars='@', description=descript)

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
        "--dryrunout",
        "--DRYRUNOUT",
        dest="DRYRUNOUT",
        default=None,
        help="The path for dry run json file")

    parser.add_argument(
        "--projecttype",
        "--PROJECTTYPE",
        dest="PROJECTTYPE",
        default="Auto",
        help=
        "project type to specify the suitable runner. Available options are \"Maven\", \"Chimpy\", and \"Auto\". Default value: Auto"
    )

    parser.add_argument(
        "--featurespath",
        "--FEATURESPATH",
        dest="FEATUREPATH",
        default="src/test/resources/",
        help=
        "Path to features directory from module. Default value: src/test/resources/"
    )
    parser.add_argument(
        '--version', '-v', action='version', version='%(prog)s V1.0')

    if sys.argv[1].startswith('@'):
        args = parser.parse_args (shlex.split (open (sys.argv[1][1:]).read()))
    else:
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
        self.projecttype = arguments.PROJECTTYPE
        self.featurespath = arguments.FEATUREPATH
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
        self.dryrunout = arguments.DRYRUNOUT
        self.display = ':99'
        self.display_size = '1920x1200'

        self.project_full_path = path.join(self.FrameworkPath,
                                           self.projectbase, self.project)
        self.isMaven = self.isMavenProject (arguments.PROJECTTYPE)

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

        print ("Framework path  : " + self.FrameworkPath)
        print ("Report base     : " + self.reportbase)
        print ("Report path     : " + self.reportpath)
        print ("Report directory: " + self.report_dir)
        print ("Project full    : " + self.project_full_path)
        print ("Chimp profile   : " + self.chimp_profile)

        if arguments.RERUN is not None:
            print ("Rerun path      : " + self.rerun)
        else:
            print ("NO RERUN ")

        self.marray = {}
        self.sarray = {}
        self.features_count = 0
        self.scenarios_count = 0
        self.runarray = []
        self.host = []
        self.thread_count = 0
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())
        self.get_available_host()

    def isMavenProject(self, args):
        result = False
        if ( self.projecttype.lower() == "chimp" or self.projecttype.lower() == "chimpy"):
            result = False
        elif (self.projecttype.lower() == "maven" or self.projecttype.lower() == "mvn"):
            result = True
        else: #auto-detect
            print ("*** Project Type is set to auto-detect ***")
            for fname in os.listdir (self.project_full_path):
                print ( " > FILE : {}".format (fname))
                if "pom.xml" in fname:
                    result = True
                    break
            # for root, directories, filenames in os.walk (self.project_full_path):       
            #     for filename in filenames:
            #         print ("   > FILE : {}".format(path.join(root,filename)))
            #         if "pom.xml" in filename:
            #             print (" ** found POM at : {}".format(path.join(root,filename)))
            #             result = True
            #             break
        print ( "*** is Maven = {}".format (result))
        return result

    def get_dry_run_out(self):
        if self.dryrunout:
            print ( "DRY RUN PATH FOUND")
            assert path.exists(self.dryrunout)
            assert self.dryrunout.endswith('.json')
        else:
            print ( "DRY RUN PATH NOT FOUND")
            from autorunner_dryrun import ChimpDryRun
            dry_run = ChimpDryRun(self.projectbase, self.project,
                                  self.modulelist, self.platform, self.browser, self.isMaven,
                                  self.tags, self.featurespath)
            self.dryrunout = dry_run.get_dry_run_results()

    def is_rerun(self):
        if self.rerun is None:
            return False
        return True

    def init_tinydb(self):
        runcases = json.loads(open(self.dryrunout).read())
        print("run cases tinydb")
        self.scenarios_count = len(runcases)
        print ( "Scenario number in tinydb --> {}".format(self.scenarios_count))
        i = 0
        for case in runcases:      
            i += 1
            case['status'] = 'notrun'            
            print ("Case {} --> {}\n".format(i,case))
            DB.insert(case)
        print("end run cases tinydb")

    def get_available_host(self):
        '''
        get avaiable host by reading config file
        '''
        config_file = path.join(self.FrameworkPath, 'framework', 'configs',
                                'chimp_run_host.config')
        assert path.exists(config_file), '{} is not exits'.format(config_file)

        print ("Config file     : " + config_file)

        with open(config_file) as fname:
            head = fname.readline()
            print (" >> HEAD : " + head)
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
        print('scenario count: {}'.format(self.scenarios_count))

        pool = Pool(pool_number)

        for index in range(1, self.scenarios_count + 1):
            
            pool.apply_async(
                run_chimp,
                args=(index, self.host, self.platform, self.browser,
                      self.report_dir, self.movie, self.screenshot,
                      self.debugmode, self.display_size, self.chimp_profile ,
                      self.projecttype, self.featurespath, self.isMaven))
        pool.close()
        pool.join()

        # Wait for test to finish then record the end time
        self.end_time = time.strftime("%Y%m%d_%H%M%S%Z", time.gmtime())


if __name__ == "__main__":
    command_arguments = parse_arguments()
    chimp_run = ChimpAutoRun(command_arguments)
    
    if chimp_run.is_rerun():
        'chimp_run.get_rerun_out()'
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
