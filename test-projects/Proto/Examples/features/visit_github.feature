Feature: Use browser inside steps

  As a developer
  I want to open browser and visit github 

  @watch
  Scenario: Visit Github
    When  I visit "https://github.com/"
    Then  I should see the title contains the keyword of "github"

    