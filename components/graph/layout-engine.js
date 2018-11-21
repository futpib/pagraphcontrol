
const {
	filter,
} = require('ramda');

const { size } = require('../../constants/view');

const plusMinus = require('../../utils/plus-minus');

const margin = size / 10;
const step = size + (2 * margin);

const offsetY = 1080 / 2;

const centerColumnsCount = 5;

module.exports = class LayoutEngine {
	constructor() {
		Object.assign(this, {
			size,
			margin,
		});
	}

	nodesIntersect(a, b) {
		if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) {
			return undefined;
		}

		return (((a.x - size - margin) < b.x) && (b.x < (a.x + size + margin))) &&
			(((a.y - size - margin) < b.y) && (b.y < (a.y + size + margin)));
	}

	calculatePosition(node) {
		return node;
	}

	adjustNodes(nodes) {
		const targetClientsColumnHeight = Math.round(filter(
			x => x.type === 'sink' || x.type === 'source',
			nodes,
		).length * 0.75);

		const estimatedColumnHeights = {
			total: 0,

			get(k) {
				return this[k] || 0;
			},

			inc(k) {
				this[k] = this[k] || 0;
				this[k] += 1;
				this.total += 1;
				return this[k];
			},
		};

		const nodeColumn = node => Math.round(node.x / step) - 2;

		const unpositionedNodes = nodes.filter(node => {
			if (node.type === 'satellite') {
				return false;
			}

			if (node.x !== undefined) {
				estimatedColumnHeights.inc(nodeColumn(node));
				return false;
			}

			return true;
		});

		unpositionedNodes.forEach(node => {
			if (node.type === 'source') {
				node.x = 0 * step;
			} else if (node.type === 'sink') {
				node.x = 8 * step;
			} else {
				let targetCol = node.index % centerColumnsCount;
				if (estimatedColumnHeights.get(2) < targetClientsColumnHeight) {
					targetCol = 2;
				}
				node.x = (2 * step) + (targetCol * step);
			}

			const columnHeight = estimatedColumnHeights.inc(nodeColumn(node));

			const direction = Math.sign(plusMinus(node.index));

			node.y = offsetY + (direction * (Math.floor(columnHeight / 2) - 1) * (size + margin));

			let intersected = true;
			let iterations = 0;
			while (intersected && iterations < 10) {
				intersected = false;
				for (const otherNode of nodes) {
					if (otherNode.type === 'satellite') {
						continue;
					}

					if (otherNode === node) {
						continue;
					}

					iterations += 1;

					if (this.nodesIntersect(node, otherNode)) {
						node.y += direction * (size + margin);
						intersected = true;
					}
				}
			}
		});

		return nodes;
	}

	getPositionForNode(node) {
		return this.calculatePosition(node);
	}
};
