const { When } = require('@cucumber/cucumber');

When(
    /^:project: I scroll to the element "([^"]*)?"$/,
        async (elem) => {
            await (await $(elem)).isExisting();
            await (await $(elem)).scrollIntoView();
            await (await $(elem)).isDisplayed();
        }
    );
