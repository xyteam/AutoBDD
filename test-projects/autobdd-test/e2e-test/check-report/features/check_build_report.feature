@Report
Feature: test build report

  As a QA Engineer
  I want to inspect my automation build report

  Scenario: download drivers
    When  :browser: I open the file "~/Projects/AutoBDD/test-projects/autobdd-test/test-results/build-test/index.html"
    Then  :browser: I expect that the page title does equal the text "Multiple Cucumber HTML Reporter"
    And   :browser: I expect that the element "div.total" inside the 1st parent element "table.chart" does contain the text "4"
    And   :browser: I expect that the 1st element "table.tile_info" does match the regex "Passed[\s]+100.00 %[\s]+Failed[\s]+0.00 %"
    And   :browser: I expect that the element "div.total" inside the 2nd parent element "table.chart" does contain the text "6"
    And   :browser: I expect that the 2nd element "table.tile_info" does match the regex "Passed[\s]+100.00 %[\s]+Failed[\s]+0.00 %"
