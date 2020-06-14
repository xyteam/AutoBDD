#### AutoBDD v2: converted to webdriverio

#### TLDR:

```
mkdir -p ~/Projects; cd ~/Projects; \
git clone https://github.com/xyteam/AutoBDD-example.git; \
cd AutoBDD-example/docker; \
docker-compose run --rm example-run "--parallel=2 --screenshot=3 --movie=1"
```
Open the HTML test report in ~/Projects/AutoBDD-example/bdd_reports/
You will see the HTML report with step screenshots and test case movie.

## AutoBDD (v2)

  BDD Automation Framework

  Powerful, Flexible and Easy-to-Use BDD Automation Framework

  * Powerful - Automate anything you can see and operate on any desktop, local or remote, Web or non-Web.

  * Flexible - Runs on any local desktop, cloud system or CI/CD system, single thread or in parallel.

  * Easy-To-Use - Write test cases in plain English sentences, single command execution anywhere.

#### Simple to use

  * AutoBDD lets you focus on your test.
  
  * Everything else will automagically work out for you.

  * Just download AutoBDD-example and give it a try:

  **[xyteam/AutoBDD-example](https://github.com/xyteam/AutoBDD-example)**

  * And rename AutoBDD-example project as your own.

#### Under the hood:

##### Platform:

  * Linux Base (Ubuntu 20.04)
    
    * xvfb desktop environment
    
      *  real web browser
    
      *  real file system
    
      *  keyboard-mouse-screen control
    
    * development tools (nodejs, python, java, etc.)

  * Screen, Keyboard and Mouse Libraries
    
    * sikulixapi (screen and images)
    
    * robot-js (keyboard and mouse)
    
    * tesseract-ocr (screen or browser image to text)

##### Framework:

  * Automation Tools
    
    * CI/CD Runner
    
      * parellel test runner
    
      * automatic cucumber and junit report generator
    
      * pre-canned runner control -- runner will handle docker image download and running automagically
    
    * Local Development Runner
    
      * full GUI - WYSIWYT -- what you see is what you test
    
      * auto project mount - WYWIWYT -- what you write is what you test
    
      * pre-canned runner control -- runner can be controlled with 2 simple docker-compose commands (up and down)
  
  * Popular 3rd Party Libraries
  
    * webdriverio (v6)
  
    * cucumber-js (v6)
  
    * HTML report with step screenshots and test case movie
  
    * very rich pre-canned cucumber steps (over 150 steps)
  
  * Framework Provided Libries
  
    * keyboard-mouse control
  
      * in cucumber BDD statements
  
      * in js library
  
    * remote access
  
      * remote desktop
  
      * remote command console
  
      * remote filesystem access
    
#### Special mentions

  * Demo-App application and Precanned Cucumber-JS Steps are taken from **[webdriverio/cucumber-boilerplate](https://github.com/webdriverio/cucumber-boilerplate)**
  
  * Image Regognizing library is taken from **[RaiMan/SikuliX1](https://github.com/RaiMan/SikuliX1)**
  
  * Keyboard and Mouse control library is taken from **[octalmage/robotjs](https://github.com/octalmage/robotjs)**
  
  * Framework Control libraries are taken from **[webdriverio/webdriverio](https://github.com/webdriverio/webdriverio)** 
  
  * And many other open-source npm libraries listed in **[package.json](https://github.com/xyteam/AutoBDD/blob/master/package.json)**