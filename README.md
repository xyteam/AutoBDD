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
  * **Then** you can test anything on screen
  * **And** you can test anything on network
  * **And** test any local or remote target
  * **And** code less and achieve more

##### High Capability

  * **And** Your test project can:
    * deploy anywhere
    * run in parallel
    * jenkins ready
    * integrate with other services

#### At A Glance
##### Platform:

  * Linux Base (Ubuntu 1804)
    * local or remote desktops
      * local X desktops via virtual frame buffer
      * remote desktops via RDP or VNC over ssh
    * screenshot and movie recording tools
    * ssh tools
    * docker
    * jenkins
    * development tools (nodejs, python, java, etc.)
##### Framework:

  * Automation Tools
    * Cucumber-JS
    * Precanned Cucumber Steps
    * Cucumber Reporting
    * Parellel Test Runner
    * Automatic Image and Movie Capturing
  * Web Browser Libraries
    * webdriverio (js)
    * webdriver (java)
  * Screen and Robot Libraries
    * Sikulix (Screen)
    * Robot-JS (Keyboard and Mouse)
  * Remote Access Libraries
    * CMD Shell
    * File System
  * Easy 3rd Party Tools Integration
    * Local Jenkins CI
    * Jira/TestRail/TestLink

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

