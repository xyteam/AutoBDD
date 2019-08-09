### To run BDD test project

  * To run your awesome BDD project
    * mkdir -p ~/Projects && cd ~/Projects && git clone my_awesome_bdd_project
    * export BDD_PROJECT=my_awesome_bdd_project
    * cd ~/Projects/AutoBDD && docker-compose run autobdd-run "--project ${BDD_PROJECT} --module All"
    * test report will be inside ~/Projects/my_awesome_bdd_project/bdd_reports/ folder

  * To try out webtest-example project
    * git clone webtest-example as your awesome BDD project to try out the above steps

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

#### To use the framework as BDD test development env

  * Setup
    * ssh-keygen -b 4096                      # prepare ssh keys
    * cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys   # allow self keyless ssh sign-in
    * cd ~/Projects && git clone my_awesome_bdd_project # git clone your project into ~/Projects/ folder
  * Spin up autobdd-dev docker container
    * export BDD_PROJECT=my_awesome_bdd_project
    * cd ~/Projects/AutoBDD && docker-compose run -d autobdd-dev
  * Access autobdd-dev docker container
    * GUI: vnc://localhost:5901
    * Shell via ssh:
      * SSH: ssh -o StrictHostKeyChecking=no ${USER}@localhost -p 2222
    * Shell via docker exec
      * docker-compose exec autobdd-dev /bin/bash
      * su - your_username
  * To run test
    * export DISPLAY=:1
    * cd ~/Projects/AutoBDD && . .autoPathrc.sh
    * cd ~/Projects/AutoBDD/test-projects && mkdir -p ${BDD_PROJECT} && sudo mount -o bind ~/Projects/${BDD_PROJECT} ${BDD_PROJECT}
    * cd to a test sub-module (folder) and run chimpy commands:
      * chimpy
      * chimpy features/feature_file
      * chimpy features/feature_file:line_num
      * chimpy features/feature_file --name "partial scenario name"
  * Debug BDD/browser test in webdriverio repl
    autobdd-dev comes with a built in wdio repl debugger where you can interact with your test target via browser GUI and wdio repl UI.
    * To debug within test:
      * add browser.debug(); statement and run test
      * or add "And I debug browser" in scenario
      * caviar, you cannot tab or use arrow in this debug shell
      * counter-caviar, you can tab or use arrow in the below debug shell (independent debug session)
    * To run independent debug session
      * cd ~/Projects/AutoBDD && export DISPLAY=:1 chromeDriverVersion=75.0.3770.140 && .autoPathrc.sh
      * selenium-standalone install --config=framework/configs/selenium-standalone_config.js
      * nohup selenium-standalone start --config=framework/configs/selenium-standalone_config.js &
      * node_modules/webdriverio/bin/wdio repl chrome
      * in repl shell, type browser. then tab will expose all webdriverio API (v4)

#### Contribute
  There are still a lot of room to be improved in this project. Please contact me if you want to become an contributor.

#### Special Mentions
  * Demo-App application and Precanned Cucumber-JS Steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
  * Image Regognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
  * Keyboard and Mouse control library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
  * Framework Control libraries are taken from **[TheBrainFamily/chimpy](https://github.com/TheBrainFamily/chimpy)** and its dependency node modules which include:
      * cucumber-js
      * v4.webdriverio
  * And many other open-source npm libraries
