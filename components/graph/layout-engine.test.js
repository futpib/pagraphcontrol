
const test = require('ava');

const LayoutEngine = require('./layout-engine');

const n = (x, y) => ({ x, y });

test('nodesIntersect', t => {
	const l = new LayoutEngine();
	const { size, margin } = l;

	const true_ = (x1, y1, x2, y2) => t.true(l.nodesIntersect(n(x1, y1), n(x2, y2)));
	const false_ = (x1, y1, x2, y2) => t.false(l.nodesIntersect(n(x1, y1), n(x2, y2)));

	[
		[ 0, 0 ],
		[ 500, 500 ],
		[ -500, -500 ],
	].forEach(([ x0, y0 ]) => {
		true_(x0, y0, x0, y0);

		false_(x0, y0, x0 + size + margin, y0);
		false_(x0, y0, x0, y0 + size + margin);

		true_(x0, y0, x0 + size + margin - 1, y0);
		true_(x0, y0, x0, y0 + size + margin - 1);

		true_(x0, y0, x0 + size + margin - 1, y0 + size + margin - 1);
	});
});
