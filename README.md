# AutoBDD
BDD Automation Framework

Powerful, Flexible and Easy-to-Use BDD Automation Framework

* Powerful - Test any local or remote target in single or parallel manner
* Flexible - Runs on any local desktop or cloud system
* Easy-To-Use - Most of the technical configurations are simplified to single-command actions

###### Philosophy
Low Entry Bar
  * **Given** any BDD test project
  * **When** you use the AutoBDD framework
  * **Then** you can Test Anything
  * **And** Test Remote Target
  * **And** Code Less, Test More

High Performance
  * **And** Your test project can:
    * Deploy Anywhere
    * Test in Parallel
    * Jenkins Ready
    * Integrate with Any Service

###### At A Glance
Platform:
  * Linux Based (Ubuntu 1804)
    * Load with many tools
        * browser
        * rdp
        * virtual X env
        * screenshot and movie tools
        * ssh tools
        * docker
        * jenkins
Framework:
  * Chimpy-JS
    * Cucumber-JS
    * WebdriverIO
    * Selenium
    * Robot-JS
    * Sikulix
  * Framework Tools
    * XVFB-Runner
    * Jenkins Node and Jobs
  * 3rd Party Tools
    * Cucumber-Report
    * Demo-App

###### To build the framework
AutoBDD can be run on any Ubuntu 18.04 system with a list of tools installed. We have created a vagrant configuration which you can deplly with a few commands.
Refer to [xyPlatform README.md](https://github.com/xyteam/xyPlatform)
  * Spin up l1804Base VM
  * (Windows) cygwin $ or (MacOS) bash $
  * vagrant ssh l1804Base
  Inside l1804Base bash
```
$ spr
$ cd ~/Run/AutoBDD
$ npm install
$ . .autoPathrc.sh
```
###### To see it in action:
[Prototype Test Project README.md](./test-projects/webtest-example/README.md)

