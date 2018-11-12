
const {
	memoizeWith,
} = require('ramda');

const weakmapId_ = new WeakMap();
const weakmapId = o => {
	if (!weakmapId_.has(o)) {
		weakmapId_.set(o, String(Math.random()));
	}
	return weakmapId_.get(o);
};

const memoize = memoizeWith(weakmapId);

module.exports = memoize;
