Feature: Use browser inside steps

  As a developer
  I want to open browser and visit Selenium Standalone

  @watch
  Scenario: Visit Webdriver Hub
    When  I visit "http://localhost:4444/wd/hub"
    # When  I visit "http://localhost:4444/wd/hub/static/resource/hub.html"
    Then  I should see the title contains the keyword of "webdriver hub"

    