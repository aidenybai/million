'use strict';

const all = require('./all');

module.exports = Object.assign({}, all, {
  languageOptions: all.languageOptions,
  rules: {
    "millionjs/check-block-declaration": 2,
    "millionjs/check-block-calling": 2,
    "millionjs/avoid-array-map-in-block": 2,
    "millionjs/avoid-spread-attributes": 2,
    "millionjs/validate-block-import": 2,
    "millionjs/ensure-complier-is-being-used": 2,
    "millionjs/avoid-non-deterministic-returns": 2,
   
  },
});

// this is so the `languageOptions` property won't be warned in the new config system
Object.defineProperty(module.exports, 'languageOptions', { enumerable: false });
