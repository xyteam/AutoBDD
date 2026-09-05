@IMAGE
Feature: test images

  As a QA Engineer
  I want to test image

  Scenario: test image file provided by framework
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "#logo"
    # image chromeLogo is provided at framework level
    Then  :screen: I should see the "chromeLogo" image on the screen

  Scenario: test image file provided by project
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "#logo"
    # image myGoogleLogo is provided at project/testimages folder
    Then  :screen: I should see the "myGoogleLogo" image on the screen

  Scenario: test last seen image is referenced as "last-seen" image
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "#logo"
    Then  :screen: I should see the "myGoogleLogo" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "chrome"