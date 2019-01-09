Feature: postman collection

  As a QA Engineer
  I want to use postman to run my collectioin test

  Background: User have postman collection files
    Given I have a postman environment file "Restful-Booker.postman_environment"
    And   I have a postman collection file "Restful-Booker.postman_collection"

  Scenario: Run postman collection test - in newman commandline
    When  I run the postman collection in newman commandline
    Then  the postman test should not have failure
