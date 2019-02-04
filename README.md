### AutoBDD
BDD Automation Framework

Powerful, Flexible and Easy-to-Use BDD Automation Framework

* Powerful - Test any local or remote target in single or parallel manner
* Flexible - Runs on any local desktop or cloud system
* Easy-To-Use - Most of the technical configurations are simplified to single-command actions

#### Philosophy
##### Low Entry Bar

  * **Given** any BDD test project
  * **When** you use the AutoBDD framework
  * **Then** you can Test Anything
  * **And** Test Remote Target
  * **And** Code Less, Test More

##### High Performance

  * **And** Your test project can:
    * Deploy Anywhere
    * Test in Parallel
    * Jenkins Ready
    * Integrate with Any Service

#### At A Glance
##### Platform:

  * Linux Based (Ubuntu 1804)
    * real browsers
    * rdp
    * virtual X env
    * screenshot and movie tools
    * ssh tools
    * docker
    * jenkins
##### Framework:

  * Chimpy-JS
    * Cucumber-JS
    * WebdriverIO
    * Selenium
  * Framework Tools
    * Secured Remote Control
      * Screen
      * Keyboard
      * Mouse
      * CMD Shell
      * File System
    * Image and Movie Capturing
    * Parellel Test Runner
  * Easy 3rd Party Tools Integration
    * Local Jenkins CI
    * Cucumber Reporter
    * Jira/TestRail/TestLink
    * Precanned Test Steps

#### To build the framework
AutoBDD can be run on any Ubuntu 18.04 system with necessary tools. The installation of the tools are automated into Vagrant configuration files which you can deploy with a few commands.
Refer to the [xyPlatform README.md](https://github.com/xyteam/xyPlatform) for detail steps

Here is a high level summary of the steps:
  * To Spin up l1804Base VM
    * In Windows cygwin bash or MacOS terminal bash:
      * create $HOME/Projects folder
      * git clone xyPlatform and AutoBDD projects
      * cd xyPlatform/lubuntu
      * vagrant up l1804Base
      * vagrant ssh l1804Base
  * To Build AutoBDD
    * In l1804Base bash shell
    ```
    $ spr
    $ cd ~/Run/AutoBDD
    $ npm install
    $ . .autoPathrc.sh
  ```
#### To see example test project in action:

[Example Test Project README.md](./test-projects/webtest-example/README.md)

