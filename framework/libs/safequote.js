// prepare for safeQuote
const quote = require('shell-quote').quote;
const parse = require('shell-quote').parse;
const safequote = (str) => { return (str) ? quote(parse(str)) : undefined };
module.exports = safequote;