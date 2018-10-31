# Proto

This project is a prototype test project for the framework. The purpose of this project is to test the integration of test project with the AutoBDD framework. In theory user can reference to this Proto project to add new test projects.

To run test in Proto project:

1. Source AutoBDD env vars:
```
$ cd <path-to>/AutoBDD
$ npm install     # This step only need to be done once when package.json is updated
$ . .autoPathrc
```
2. To run all tests in the Examples suite:
```
$ cd test-projects/Proto/Examples
$ DISPLAY=:0 chimp $FrameworkPath/framework_chimp.js
```
3. To run a particular test with Screenshot and Movie, controllable independently:
```
$ cd test-projects/Proto/Examples
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimp $FrameworkPath/framework_chimp.js features/visit_github.feature:7
```
and check out the screenshot and movie in the same folder
4. To run with local selenium-standalone
    4.1 In GUI launch System Tools -> LXTerminal
    4.2 In GUI LXTerminal start selenium-standalone in debug mode
    ```
    $ cd ~/runProjects/AutoBDD
    $ . .autoPathrc
    $ DISPLAY=:0 selenium-standalone start --config=./global/configs/selenium-standalone_config.js -- -debug true
    ```
    4.3 In any terminal run test with 
    ```
    $ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 LOCALSELPORT=4444 chimp $FrameworkPath/framework_chimp.js features/visit_github.feature:7
    ```
5. To run with local selenium-standlone and with full debug mode
    5.1 Stop the local selenium-standalone (see 4.2) by Control-C in the terminal
    5.2 Start the test with full debug mode:
    ```
    $ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 LOCALSELPORT=4444 chimp $FrameworkPath/framework_chimp.js features/visit_github.feature:7 -- -debug=true
    ```
    5.3 Wait for the browser to be launched once for the test to get the browser version then disappear,
    5.4 Start the selenium-standalone as in 4.2.
    