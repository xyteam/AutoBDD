@IMAGE
Feature: test step files provided by project

  As a test project member
  I want to test step files povided by my own project

  Scenario: test step files provided by project
    When  :browser: I open the path "/"
    # :project: step is provided in autodd-test/e2e-test/project/support/steps folder
    And   :project: I scroll to the element "#logo"
    Then  :screen: I should see the "myGoogleLogo" image on the screen
