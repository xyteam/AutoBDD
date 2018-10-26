# AutoBDD
BDD Automation Framework

Powerful, Flexible and Easy to use automation framework that puts complete control back to the users:

  * Describe user behaviors in BDD
  * Implement test exactly as described
  * Test exactly as described
  * Report exactly as described

###### Framework Philosophy
This framework is built on the following philosophy:
  * Product Requirement can be translated into Test Requirements in High-Level BDD statements.
  * High-level BDD can be further translated into Actionable BDD statements (test cases).
  * Actionable BDD statements can be implemented into test scripts

###### Framework Provided Interfaces
The framework provides session libraries for the controls of screen, keyboard, mouse, browser, file system and API to allow test code to take full control of the test target.

  * ssh_session: shell access and port mapping of remote computer.
  * screen_session: controls screen, keyboard and mouse of local or remote computer.
      Local: through assigned X environment
      Remote: through RDP over local X environment
  * browser_session: controls local or remote browser through selenium based webdriver
  * file_session: controls local or remote file system
      Local: direct access
      Remote: through sshfs
  * api_session: controls API request and response.

###### Framework Provided Reporting features
The framework provides control on screenshot and movie recording along with raw test result in JSON files for each test case.
The framework also provides commands to compile test case level JSON files into test suite level JSON files and run level master JSON file.
JSON file at any level can be compiled into collaspable HTML report which can drill down to individual test case and test steps with screenshots and replable movie.

###### Framework Provided Run features
Test can be run in paralleled X environments on the controller system itself, and farm out to remote PCs.
Currently the framework only supports a single controller. We are considering to add master/slave controllers to further flatten out the parallel control.
Controller is dockerized. It can be run in any local or cloud CI environment.
