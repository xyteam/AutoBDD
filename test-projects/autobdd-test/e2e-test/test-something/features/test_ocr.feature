@OCR
Feature: test ocr

  As a QA Engineer
  I want to test ocr

  Scenario: test screen area ocr
    When  :browser: I open the path "/"
    Then  :screen: I expect that the screen area does contain the text "Official Build"

  Scenario: test screen center area ocr
    When  :browser: I open the path "/"
    Then  :screen: I expect that the "Screen-200" image does contain the text "Profile Path:"

  Scenario: test target image ocr
    When  :browser: I open the path "/"
    Then  :screen: I expect that the "chromeLogo" image does contain the text "chrome"
