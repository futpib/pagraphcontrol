
const {
	memoizeWith,
} = require('ramda');

const weakmapId = require('./weakmap-id');

const memoize = memoizeWith(weakmapId);

module.exports = memoize;
