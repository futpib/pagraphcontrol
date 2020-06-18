
const test = require('ava');

const { map, range } = require('ramda');

const plusMinus = require('./plus-minus');

test('plusMinus', t => {
	t.deepEqual(
		map(plusMinus, range(0, 7)),
		[ 0, -1, 1, -2, 2, -3, 3 ],
	);
});
