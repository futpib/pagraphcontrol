
const { size } = require('../../constants/view');

const margin = size / 10;
const step = size + (2 * margin);

function nodesIntersect(a, b) {
	if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) {
		return undefined;
	}

	return (((a.x - size - margin) < b.x) && (b.x < (a.x + size + margin))) &&
		(((a.y - size - margin) < b.y) && (b.y < (a.y + size + margin)));
}

module.exports = class LayoutEngine {
	constructor(graphViewProps) {
		this.graphViewProps = graphViewProps;
	}

	calculatePosition(node) {
		return node;
	}

	adjustNodes(nodes) {
		nodes.forEach(node => {
			if (node.type === 'satellite') {
				return;
			}

			if (node.x !== undefined) {
				return;
			}

			if (node.type === 'source') {
				node.x = 0 * step;
			} else if (node.type === 'sink') {
				node.x = 8 * step;
			} else {
				node.x = (2 * step) + ((node.index % 5) * step);
			}

			node.y = 0;

			for (const otherNode of nodes) {
				if (otherNode.type === 'satellite') {
					continue;
				}

				if (otherNode === node) {
					continue;
				}

				if (nodesIntersect(node, otherNode)) {
					node.y += size + margin;
				}
			}
		});

		return nodes;
	}

	getPositionForNode(node) {
		return this.calculatePosition(node);
	}
};
