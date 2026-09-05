// prepare for safeQuote
const quote = require('shell-quote').quote;
const parse = require('shell-quote').parse;
const safequote = (str) => { return (str) ? quote(parse(str.replace(/#/g, ''))) : undefined };
module.exports = safequote;