Feature: file download

  As a QA Engineer
  I want to open browser to download a few files and investigate file contents

  Scenario: File Open and Download - check PDF file
    When  I open the site "http://www.orimi.com/pdf-test.pdf"
    Then  I should see the "Yukon_Logo" image on the screen
    When  I download the PDF file by clicking "PDF_download_icon"
    Then  the downloaded PDF file should contain "PDF Test File"

  Scenario: File Download - check XLS file
    When  I download the XLS file by going to URL "https://www.sample-videos.com/xls/Sample-Spreadsheet-10-rows.xls"
    Then  the downloaded XLS file should contain 10 rows


