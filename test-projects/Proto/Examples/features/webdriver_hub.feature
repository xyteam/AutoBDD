Feature: Use browser inside steps

  As a developer
  I want to open browser and visit Selenium Standalone

  @watch
  Scenario: Visit Webdriver Hub - check page title
    When  I visit "http://localhost:4444/wd/hub"
    Then  I should see the page title to contain the keyword "webdriver hub"
    And   I should see the image of "Selenium_CreateSession_Button" on the page



    

    