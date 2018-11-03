# Proto

This project is a prototype test project for the framework. The purpose of this project is to test the integration of test project with the AutoBDD framework. In theory user can reference to this Proto project to add new test projects.

#### To run test in Proto project:

###### First source AutoBDD env vars:
```
$ cd <path-to>/AutoBDD
$ npm install     # This step only need to be done once when package.json is updated
$ . .autoPathrc
```

###### Then run any of the examples below

* To run test independently from the framework:
```
$ cd test-projects/Proto/Examples
$ DISPLAY=:0 chimp --browser=chrome features/webdriver_hub.feature
```

* To run all tests in the Examples suite:
```
$ cd test-projects/Proto/Examples
$ DISPLAY=:0 chimp $FrameworkPath/framework_chimp.js
```

* To run a particular test by line number with Screenshot and Movie, controllable independently:
```
$ cd test-projects/Proto/Examples
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
```
    and check out the screenshot and movie in the same folder.

* To run with full automatic mode

    * Local Linux with chrome (default)
    ```
    $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
    ```

    * Remote Windows 10/7 with CH/IE
        * Needs to start win10desktop01 or win7desktop01 respectively in xyPlatform as target
        * Win10 and CH
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=CH chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
        ```

        * Win10 and IE
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=IE chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
        ```

        * Win7 and CH
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=CH chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
        ```

        * Win7 and IE
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=IE chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7        
        ```

* To run with local selenium-standalone

    * In GUI launch System Tools -> LXTerminal

    * In GUI LXTerminal start selenium-standalone in debug mode
    ```
    $ cd ~/runProjects/AutoBDD
    $ . .autoPathrc
    $ DISPLAY=:0 selenium-standalone start --config=./framework/configs/selenium-standalone_config.js -- -debug true
    ```

    * In any terminal run test with 
    ```
    $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 LOCALSELPORT=4444 chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7
    ```

* To run with local selenium-standlone and with full debug mode
    
    Due to chimp session manager needs to find the brower version it will try to start a selenium-standalone automatically then close it. In auto selenium mode this will not be a problem, in manual selenium mode becuase the version retriving part is auto thus manual selenium-standalone needs ot yield for that part.

    * Stop the local selenium-standalone by Control-C in the terminal

    * Start the test with full debug mode:
    ```
    $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 LOCALSELPORT=4444 chimp $FrameworkPath/framework_chimp.js features/webdriver_hub.feature:7 -- -debug=true
    ```

    * Wait for the browser to be launched once for the test to get the browser version then disappear

    * Start the selenium-standalone

