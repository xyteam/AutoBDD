@INIT
Feature: test init

  As a QA Engineer
  I want to initialize my automation test environment

  Scenario: download drivers
    When  I open the path "/"
    Then  I expect the url to contain "version"
