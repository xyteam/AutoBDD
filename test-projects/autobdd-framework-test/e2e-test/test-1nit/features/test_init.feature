@Init
Feature: test init

  As a QA Engineer
  I want to initialize my automation test environment by running a simple test to trigger the download of the necessary webdrivers

  Scenario: trigger download drivers
    Given :browser: I open the path "/"
    Then  :browser: I expect the full URL to contain "version"
