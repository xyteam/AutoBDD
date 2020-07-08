@ENV
Feature: test envs

  As a QA Engineer
  I want to env vars used in test cases

  Scenario: test envs
    When  I open the path "ENV:ROOTPATH"
    And   I scroll to the element "ENV:LOGOID"
    Then  I should see the "ENV:LOGO_FILENAME" image on the screen
    And   I expect that the "last-seen" image does contain the text "ENV:LOGO_TEXT"
