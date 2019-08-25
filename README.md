### TLDR:

```
mkdir -p ~/Projects; cd ~/Projects; \
git clone https://github.com/xyteam/webtest-example.git; \
cd webtest-example; \
export BDD_PROJECT=$(basename ${PWD}); \
cd docker; \
docker-compose run --rm test-run "--tags @SmokeTest --movie=1"
```
Open the HTML BDD test report in ~/Projects/webtest-example/bdd_reports/

### AutoBDD
BDD Automation Framework

Powerful, Flexible and Easy-to-Use BDD Automation Framework

* Powerful - Automate anything you can see on a PC, local or remote, Web or non-Web
* Flexible - Runs on any local desktop or cloud system, single thread or parallel
* Easy-To-Use - Executabled docker, single command execution

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

#### Try Out

**[xyteam/webtest-example](https://github.com/xyteam/webtest-example)**

#### Special Mentions
  * Demo-App application and Precanned Cucumber-JS Steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
  * Image Regognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
  * Keyboard and Mouse control library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
  * Framework Control libraries are taken from **[TheBrainFamily/chimpy](https://github.com/TheBrainFamily/chimpy)** and its dependency node modules which include:
      * cucumber-js
      * v4.webdriverio
  * And many other open-source npm libraries
