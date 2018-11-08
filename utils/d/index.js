
class D {
	constructor(s = '') {
		this._s = s;
	}

	_next(...args) {
		return new this.constructor([ this._s, ...args ].join(' '));
	}

	moveTo(x, y) {
		return this._next('M', x, y);
	}

	lineTo(x, y) {
		return this._next('L', x, y);
	}

	close() {
		return this._next('z');
	}

	toString() {
		return this._s;
	}
}

const d = () => new D();

module.exports = d;
