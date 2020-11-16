@VAR
Feature: test vars

  As a QA Engineer
  I want to env vars used in test cases

  Scenario: test vars
    When  :browser: I open the path "VAR:testVars.root_path"
    And   :browser: I scroll to the element "VAR:testVars.logo_id"
    Then  :screen: I should see the "VAR:testVars.logo_imageName" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "VAR:testVars.logo_imageText"
