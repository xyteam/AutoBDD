Feature: drag and drop page

  As a QA Engineer
  I want to test drag and drop page

  Scenario: Drag to dropzone - by webelement
    When  I visit "http://localhost:8082/"
    And   I scroll to element "head"
    Then  I expect that element "#draggable" is visible
    And   I expect that element "#droppable" is visible
    When  I drag element "#draggable" to element "#droppable"
    Then  I expect that element "#droppable" contains the text "Dropped!"

  Scenario: Drag to dropzone - by image
    When  I visit "http://localhost:8082/"
    Then  I should see the "Drag_me" image on the screen
    And   I should see the "Dropzone" image on the screen
    When  I drag "Drag_me" and drop to "Dropzone"
    Then  I should not see the "Dropzone" image on the screen


