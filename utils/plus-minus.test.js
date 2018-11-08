
import test from 'ava';

import { map, range } from 'ramda';

import plusMinus from './plus-minus';

test(t => {
	t.deepEqual(
		map(plusMinus, range(0, 7)),
		[ 0, -1, 1, -2, 2, -3, 3 ],
	);
});
