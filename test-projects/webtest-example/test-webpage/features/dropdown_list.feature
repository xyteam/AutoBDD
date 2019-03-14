Feature: dropdown list

  As a QA Engineer
  I want to try out dropdown list automation:
    1. click page elements
    2. click page images

  Scenario: Click Drop-Down List - by webelement
    When  I open the url "http://localhost:8082"
    Then  I should see the page title to contain "demo app"
    When  I scroll to element "footer"
    Then  I should see the "Option #1" option on the page
    When  I click the "Option #1" option on the page
    Then  I should see the "Option #2" option on the page
    # And   I should see the "Option #3" option on the page
    # And   I should see the "Option #4" option on the page

  Scenario: Click Drop-Down List - by image
    Given I open the url "http://localhost:8082"
    When  I scroll to element "footer"
    Then  I should see the "First_option" image on the screen
    When  I click the "First_option" image on the screen
    Then  I should see the "First_option_Opened" image on the screen