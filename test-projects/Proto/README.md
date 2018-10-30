# Proto

This project is a prototype test project for the framework. The purpose of this project is to test the integration of test project with the AutoBDD framework. In theory user can reference to this Proto project to add new test projects.

To run test in Proto project:

1. Source AutoBDD env vars:
```
$ cd <path-to>/AutoBDD
$ npm install     # This step only need to be done once when package.json is updated
$ . .autoPathrc
```
2. Run Test:
```
$ cd test-projects/Proto/Examples
$ DISPLAY=:0 chimp $FrameworkPath/framework_chimp.js
```
