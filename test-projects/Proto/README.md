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