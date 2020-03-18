@OCR
Feature: test ocr

  As a QA Engineer
  I want to test ocr

  Scenario: test ocr
    When  I open the path "/"
    Then  I expect that the "chromeLogo" image does contain the text "chrome"
    Then  I expect that the screen area does contain the text "Official Build"
    Then  I expect that the "Screen-20" image does contain the text "Official Build"
