Feature: drag and drop page

  As a QA Engineer
  I want to test drag and drop page

  Scenario: test drag and drop page
    When  I visit "https://bestvpn.org/html5demos/drag/"
    Then  I should see the "target_drop_box" image on the screen
    When  I drag "object_five" and drop to "target_drop_box"
    Then  I should not see the "object_five" image on the screen
    When  I drag "object_four" and drop to "target_drop_box"
    Then  I should not see the "object_four" image on the screen
    When  I drag "object_three" and drop to "target_drop_box"
    Then  I should not see the "object_three" image on the screen
    When  I drag "object_two" and drop to "target_drop_box"
    Then  I should not see the "object_two" image on the screen
    When  I drag "object_one" and drop to "target_drop_box"
    Then  I should not see the "object_one" image on the screen

