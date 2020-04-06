@Report
Feature: test build report

  As a QA Engineer
  I want to inspect my automation build report

  Scenario: download drivers
    When  I open the file "~/Projects/AutoBDD/test-projects/simple-test/bdd_reports/build-test/index.html"
    Then  I expect that the page title does equal the text "Multiple Cucumber HTML Reporter"
    And   I expect that the 1st element ".chart table" matches the text "Passed\n100.00 %"
    And   I expect that the 1st element ".chart table" matches the text "Failed\n0.00 %"
    And   I expect that the 2nd element ".chart table" matches the text "Passed\n100.00 %"
    And   I expect that the 2nd element ".chart table" matches the text "Failed\n0.00 %" 