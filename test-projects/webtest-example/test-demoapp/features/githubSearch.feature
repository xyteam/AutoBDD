Feature: Github test
    As a Developer in Test
    I want to search for webdriverio repository
    So that I can use it in my future tests

Scenario: open URL
    Given I open the url "https://github.com/"
    Then  I expect the url to contain "github.com"
    And   I expect that the title is "The world's leading software development platform · GitHub"

Scenario: search for webdriverio repository
    Given I open the url "https://github.com/search"
    And   the element "[placeholder='Search GitHub']" not contains any text
    And   I clear the inputfield "[placeholder='Search GitHub']"
    And   I add "webdriverio" to the inputfield "[placeholder='Search GitHub']"
    And   I press "Space"
    And   I add "selenium" to the inputfield "[placeholder='Search GitHub']"
    When  I press "Enter"
    Then  I expect that element ".header-search-input" contains the text "webdriverio selenium"
    And   I expect that element ".repo-list-item:first-child" contains the text "A Node.js bindings implementation for the W3C WebDriver protocol"
