
const size = 200;

module.exports = class LayoutEngine {
	constructor(graphViewProps) {
		this.graphViewProps = graphViewProps;
	}

	calculatePosition(node) {
		return node;
	}

	adjustNodes(nodes, nodesMap) {
		nodes.forEach(node => {
			if (node.x !== undefined) {
				return;
			}

			if (node.type === 'source') {
				node.x = 0 * size;
			} else if (node.type === 'sink') {
				node.x = 10 * size;
			} else {
				node.x = (2 * size) + (Math.round(6 * Math.random()) * size);
			}

			node.y = Math.random() * 1200;
		});

		return nodes;
	}

	getPositionForNode(node) {
		return this.calculatePosition(node);
	}
};
