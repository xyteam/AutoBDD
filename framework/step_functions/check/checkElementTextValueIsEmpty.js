const checkContainsAnyTextOrValue = require('./checkContainsAnyTextOrValue');

module.exports = async (element, type, falseCase) => {
    // is Empty == undefined == not contain any TextOrValue
    // is not Empty == contains some TextOrValue

    await checkContainsAnyTextOrValue(element, !!!falseCase, type);
};
