Feature: webdriver hub page

  As a QA Engineer
  I want to open the Selenium Standalone Hub page with a browser and investigate its features

  Scenario: Visit Webdriver Hub - check page element
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

  Scenario: Visit Webdriver Hub - check page image
    When  I visit "http://localhost:4444/wd/hub"
    And   I should see the "Selenium_CreateSession_button" image on the page
    When  I click the "Selenium_CreateSession_button" image on the page
    Then  I should see the "Selenium_CreateNewSession_modal" image on the screen
    