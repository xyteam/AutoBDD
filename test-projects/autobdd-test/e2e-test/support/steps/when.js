const { When } = require('@cucumber/cucumber');

When(
    /^:project: I scroll to the element "([^"]*)?"$/,
        (elem) => {
            $(elem).isExisting();
            $(elem).scrollIntoView();
            $(elem).isDisplayed();
        }
    );
