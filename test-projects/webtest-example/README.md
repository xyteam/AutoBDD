# webtest-example

The purpose of this project is to demo the AutoBDD framework. In theory user can replicate this project as their new test projects.

#### Demo

###### Build AutoBDD Framework (only run once if not already):
```
$ spr
$ cd ~/Run/AutoBDD
$ npm install
$ . .autoPathrc
```

###### Setup apps for the demo
```
$ npm run install-selenium
$ npm start
```

###### Run the demo
```
$ npm run test-init
$ npm test
```
and monitor the test run in the vagrant guest GUI console

#### Run Single Test with Screenshot and Movie:
```
$ cd test-projects/webtest-example/test-webpage
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimpy features/webdriver_hub.feature:8
or
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimpy features/webdriver_hub.feature --name="Check Webdriver Hub page elements - Create Session"
```
    and check out the screenshot and movie in the same folder.

#### Run Test with Additional Control

###### Local Linux with chrome (default)
```
$ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 chimpy features/webdriver_hub.feature:8
```
###### Remote Windows 10/7 with CH/IE

Needs to start win10desktop01 or win7desktop01 respectively in xyPlatform as the remote target.

######## Win10 and CH
```
$ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=CH chimpy features/webdriver_hub.feature:8
```

######## Win10 and IE
```
$ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=IE chimpy features/webdriver_hub.feature:8
```

######## Win7 and CH
```
$ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=CH chimpy features/webdriver_hub.feature:8
```

######## Win7 and IE
```
$ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=IE chimpy features/webdriver_hub.feature:8        
```

#### Run Test with Framework Automation

###### Run Test
```
$ cd ~/Run/AutoBDD
$ ./framework/scripts/chimp_autorun.py --help   # to see all the control options
$ ./framework/scripts/chimp_autorun.py --parallel 2 --modulelist test-webpage test-download test-postman test-java
```

    When the test is done, go to the report directory listed in

    "*** Report Directory: ***"

    section to review the test results:

###### Results Folder Files

    cucumber-report.html            <- master test report in collaspable HTML format
    cucumber-report.html.json.html  <- master test report one page HTML format
    cucumber-report.html.json       <- master test result in cucumber JSON format
    *.png                           <- final screenshot
    *.mp4                           <- movie
    *.json                          <- individual test run result in cucumber JSON format
    *.run                           <- individual test run log
