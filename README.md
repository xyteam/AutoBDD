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

#### To use the framework as test runner

  * To download and display help message
    * docker run xyteam/autobdd-run:1.0.0
  * To run built-in demo
    * cd ~/Projects/AutoBDD/scripts && docker-compose run autobdd-run "--project webtest-example --module test-webpage test-download test-postman"
    * check report in  ~/Projects/AutoBDD/webtest-example/bdd_reports/ folder
  * To run your own BDD project
    * cp -r  ~/Projects/AutoBDD/webtest-example ~/Projects/my_awesome_bdd_project     # copy example project as your own
    * export BDD_PROJECT=my_awesome_bdd_project
    * cd ~/Projects/AutoBDD/scripts && docker-compose run autobdd-run "--project ${BDD_PROJECT} --module All"
    * test report will be inside ~/Projects/my_awesome_bdd_project/bdd_reports/ folder

#### To use the framework as BDD test development env

  * Setup
    * docker pull xyteam/autobdd-dev:1.0.0    # download docker image 
    * ssh-keygen -b 4096                      # prepare ssh keys
    * cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys   # allow self keyless ssh sign-in
    * cd ~/Projects && git clone my_awesome_bdd_project # git clone your project into ~/Projects/ folder
  * Spin up autobdd-dev docker container
    * export BDD_PROJECT=my_awesome_bdd_project
    * cd ~/Projects/AutoBDD/scripts && docker-compose run -d autobdd-dev
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
    * cd test-projects/my_awesome_bdd_project/
    * cd to a test sub-module (folder) and run chimpy
  * To debug in webdriverio repl
    autobdd-dev comes with a built in wdio repl debugger where you can interact with your test target via browser GUI and wdio repl UI.
    * cd ~/Projects/AutoBDD && export DISPLAY=:1 chromeDriverVersion=75.0.3770.8 && .autoPathrc.sh
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