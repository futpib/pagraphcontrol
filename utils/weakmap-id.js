
let counter = 0;
const weakmap = new WeakMap();
const weakmapId = o => {
	if (!weakmap.has(o)) {
		weakmap.set(o, String(counter++));
	}
	return weakmap.get(o);
};

module.exports = weakmapId;
