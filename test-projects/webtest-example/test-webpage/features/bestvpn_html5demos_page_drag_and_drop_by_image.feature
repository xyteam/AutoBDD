Feature: bestvpn html5demos page - drag and drop page by image

  As a QA Engineer
  I want to test bestvpn html5demos page - drag and drop page by image
  
  Scenario: Test bestvpn html5demos page - drag and drop page by image
    When  I open the url "https://bestvpn.org/html5demos/drag/"
    When  I drag "NordVPN" and drop to "target_drop_box"
    And   I hover the "target_drop_box" image on the screen
    Then  I should not see the "NordVPN" image on the screen
    Then  I should see the "target_drop_box" image on the screen
    When  I drag "BestVPN" and drop to "target_drop_box"
    And   I hover the "target_drop_box" image on the screen
    Then  I should not see the "BestVPN" image on the screen
    When  I drag "ExpressVPN" and drop to "target_drop_box"
    And   I hover the "target_drop_box" image on the screen
    Then  I should not see the "ExpressVPN" image on the screen
    When  I drag "UnblockNetflixVPN" and drop to "target_drop_box"
    And   I hover the "target_drop_box" image on the screen
    Then  I should not see the "UnblockNetflixVPN" image on the screen
    When  I drag "VPNServices" and drop to "target_drop_box"
    And   I hover the "target_drop_box" image on the screen
    Then  I should not see the "VPNServices" image on the screen
