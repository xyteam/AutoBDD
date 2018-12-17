Feature: webdriver hub page

  As a QA Engineer
  I want to inviestigate a few items at the Selenium Webdriver Hub page:
    1. page elements - Create Session
    2. page images - Create Session

  Scenario: Check Webdriver Hub page elements - Create Session
    When  I visit "http://localhost:4444/wd/hub"
    Then  I should see the page title to contain "webdriver hub"
    When  I click the "Create Session" button on the page
    Then  I should see the "Create a New Session" modal-dialog
    And   the "Create a New Session" modal-dialoag should contain these select-option
    | browser_name      |
    | android           |  
    | chrome            |  
    | firefox           |  
    | internet explorer |  
    | iphone            |  
    | opera             |  

  Scenario: Check Webdriver Hub page images - Create Session
    When  I visit "http://localhost:4444/wd/hub"
    And   I should see the "Selenium_CreateSession_button" image on the page
    When  I click the "Selenium_CreateSession_button" image on the page
    Then  I should see the "Selenium_CreateNewSession_modal" image on the screen
    When  I click the "Selenium_SelectBrowsers_dropDownClosed" image on the page
    Then  I should see the "Selenium_SelectBrowsers_dropDownOpened" image on the page