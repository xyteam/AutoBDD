const checkContainsAnyTextOrValue = require('./checkContainsAnyTextOrValue');

module.exports = (element, type, falseCase) => {
    // is Empty == undefined == not contain any TextOrValue
    // is not Empty == contains some TextOrValue

    checkContainsAnyTextOrValue(element, !!!falseCase, type);
};
