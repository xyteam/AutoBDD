### TLDR:

```
mkdir -p ~/Projects; cd ~/Projects; \
git clone https://github.com/xyteam/AutoBDD-example.git; \
cd AutoBDD-example/docker; \
docker-compose run --rm example-run "--tags @SmokeTest --movie=1"
```
Open the HTML test report in ~/Projects/AutoBDD-example/bdd_reports/
You will see BDD test report with screenshots and video.

## AutoBDD

BDD Automation Framework

Powerful, Flexible and Easy-to-Use BDD Automation Framework

* Powerful - Automate anything you can see and operate on any desktop, local or remote, Web or non-Web.
* Flexible - Runs on any local desktop, cloud system or CI/CD system, single thread or in parallel.
* Easy-To-Use - Write test cases in plain English sentences, single command execution anywhere.

### At a glance

#### Platform:

  * Linux Base (Ubuntu 1804)
    * local or remote desktops
      * local X desktops via virtual frame buffer
      * remote desktops via RDP or VNC over ssh
    * screenshot and movie recording tools
    * ssh tools
    * jenkins
    * development tools (nodejs, python, java, etc.)

#### Framework:

  * Automation Tools
    * Cucumber-JS
    * Precanned Cucumber Steps
    * Cucumber Reporting
    * Parellel Test Runner
    * Automatic Image and Movie Capturing
  * Web Browser Libraries
    * webdriverio (js)
    * webdriver (java)
  * Screen, Keyboard and Mouse Libraries
    * Sikulix (Screen and Text)
    * Robot-JS (Keyboard and Mouse)
    * Tesseract-OCR (Image to Text)
  * Remote Access Libraries
    * CMD Shell
    * SSH Console
    * File System
  * Easy 3rd Party Tools Integration
    * Jira
    * TestRail
    * TestLink

### AutoBDD Docker Images

This project publishes two docker images :

autobdd-run: AutoBDD running env. Run your BDD test anywhere (local desktop or cloud CI/CD).
autobdd-dev: AutoBDD development env. Run this container on your PC to develop and run your BDD test locally.

### Simple to use

AutoBDD lets you focus on your test. You do not need to maintain the automation framework. Everything will workout for you automagically.
Just download AutoBDD-example, rename it, and starting automating. This project pre-configured everything you need to download, run and use the two docker images.

**[xyteam/AutoBDD-example](https://github.com/xyteam/AutoBDD-example)**

### Special mentions

  * Demo-App application and Precanned Cucumber-JS Steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
  * Image Regognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
  * Keyboard and Mouse control library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
  * Framework Control libraries are taken from **[TheBrainFamily/chimpy](https://github.com/TheBrainFamily/chimpy)** and its dependency node modules which include:
      * cucumber-js
      * v4.webdriverio
  * And many other open-source npm libraries
