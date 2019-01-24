# webtest-example

The purpose of this project is to demo the AutoBDD framework. In theory user can replicate this project their new test projects.

#### To run test in this project:

###### Assuming you have built this project:
```
$ spr
$ cd ~/Run/AutoBDD
$ npm install       # run only once on fresh ~/Run folder or new package added to the package.json
$ . .autoPathrc
```

###### Setup apps for the demo
```
$ npm run install-selenium
$ npm start
```

###### Run the demo
```
$ npm run test-init
$ npm test
```

and monitor the test run in the vagrant guest GUI console
* To run a particular test by line number or by scenario name with Screenshot and Movie:
```

$ cd test-projects/webtest-example/test-webpage
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimpy features/webdriver_hub.feature:8
or
$ SCREENSHOT=1 MOVIE=1 DISPLAY=:0 chimpy features/webdriver_hub.feature --name="Check Webdriver Hub page elements - Create Session"
```
    and check out the screenshot and movie in the same folder.

* To run with full automatic mode

    * Local Linux with chrome (default)
    ```
    $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 chimpy features/webdriver_hub.feature:8
    ```

    * Remote Windows 10/7 with CH/IE
        * Needs to start win10desktop01 or win7desktop01 respectively in xyPlatform as the remote target.
        * Win10 and CH
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=CH chimpy features/webdriver_hub.feature:8
        ```

        * Win10 and IE
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=21022 PLATFORM=Win10 BROWSER=IE chimpy features/webdriver_hub.feature:8
        ```

        * Win7 and CH
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=CH chimpy features/webdriver_hub.feature:8
        ```

        * Win7 and IE
        ```
        $ DISPLAY=:0 SCREENSHOT=1 MOVIE=1 SSHHOST=10.0.2.2 SSHPORT=11022 PLATFORM=Win7 BROWSER=IE chimpy features/webdriver_hub.feature:8        
        ```


