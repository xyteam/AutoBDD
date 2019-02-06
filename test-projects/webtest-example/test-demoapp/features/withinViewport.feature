Feature: Viewport test
    As a Developer in Test
    I want to visit the Google result page for the term "test"
    And make sure I have the logo within the viewport and make sure the footer is not

    Scenario: Header in viewport, footer outside viewport
        Given I open the url "/"
        And   I have a screen that is 1024 by 768 pixels
        And   I pause for 1000ms
        When  I scroll to element "h1"
        Then  I expect that element "h1" is within the viewport
        And   I expect that element "footer" is not within the viewport

    Scenario: Footer in viewport, header outside viewport
        Given I open the url "/"
        And   I have a screen that is 1024 by 768 pixels
        And   I pause for 1000ms
        When  I scroll to element "footer"
        Then  I expect that element "footer" is within the viewport
        And   I expect that element "h1" is not within the viewport

  Scenario: Check demo page images - Drop-Down List
    Given I open the url "/"
    When  I scroll to element "footer"
    When  I click the "First_option" image on the screen
    Then  I should see the "First_option_Opened" image on the screen