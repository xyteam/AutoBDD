Feature: drag and drop page

  As a QA Engineer
  I want to test drag and drop page

  Scenario: test drag and drop page
    When  I visit "http://localhost:8082/"
    Then  I should see the "Drag_me" image on the screen
    And  I should see the "Dropzone" image on the screen
    When  I drag "Drag_me" and drop to "Dropzone"
    Then  I should not see the "Dropzone" image on the screen


