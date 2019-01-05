module.exports = function() {
    this.Given(/^I am preparing to run postman test$/, function () {
        browser.url('data: text/html, %3Ccenter%3E%3Ch1%3Epostman%20test%20is%20running%20in%20background%3C%2Fh1%3E%3C%2Fcenter%3E');
    });
};