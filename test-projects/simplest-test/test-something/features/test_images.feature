@IMAGE
Feature: test images

  As a QA Engineer
  I want to test image

  Scenario: test images
    When  I open the path "/"
    And   I scroll to the element "#logo"
    Then  I should see the "chromeLogo" image on the screen
