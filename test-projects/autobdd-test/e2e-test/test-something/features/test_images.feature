@IMAGE
Feature: test images

  As a QA Engineer
  I want to test image

  Scenario: test images
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "#logo"
    Then  :screen: I should see the "chromeLogo" image on the screen
