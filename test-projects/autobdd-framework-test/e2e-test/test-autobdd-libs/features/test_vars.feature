@VAR
Feature: test vars

  As a QA Engineer
  I want to test variables referencing

  Scenario: test prject vars in default var file
    # var root_path is defined in project/testfiles/testVars.js
    When  :browser: I open the path "VAR:root_path"
    Then  :screen: I should see the "VAR:logo_imageName" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "VAR:logo_imageText"

  Scenario: test prject vars in specific var file
    When  :browser: I open the path "/"
    # var logo_fullxpath is defined in project/testfiles/myProjectVars.js
    And   :browser: I scroll to the element "VAR:myProjectVars.logo_fullxpath"
    Then  :screen: I should see the "VAR:logo_imageName" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "VAR:logo_imageText"

  Scenario: test module vars in default var file
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "#logo"
    # var logo_imageName is defined in test-autobdd-libs/testfiles/testVars.js
    Then  :screen: I should see the "VAR:logo_imageName" image on the screen

  Scenario: test module vars in specific var file
    When  :browser: I open the path "/"
    # var logo_xpath is defined in test-autobdd-libs/testfiles/myModuleVars.js
    And   :browser: I scroll to the element "VAR:myModuleVars.logo_xpath"
    Then  :screen: I should see the "chromeLogo" image on the screen
  
    Scenario: test vars referenced as VAR:name
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "VAR:myProjectVars.logo_fullxpath"
    Then  :screen: I should see the "VAR:logo_imageName" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "VAR:logo_imageText"

    Scenario: test vars referenced as Var{name}
    When  :browser: I open the path "/"
    And   :browser: I scroll to the element "Var{myProjectVars.logo_fullxpath}"
    Then  :screen: I should see the "Var{logo_imageName}" image on the screen
    And   :screen: I expect that the "last-seen" image does contain the text "Var{logo_imageText}"
