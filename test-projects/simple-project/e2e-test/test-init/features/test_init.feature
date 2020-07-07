@Init
Feature: test init

  As a QA Engineer
  I want to initialize my automation test environment

  Scenario: download drivers
    Given I open the path "/"
    Then  I expect the full URL to contain "version"
