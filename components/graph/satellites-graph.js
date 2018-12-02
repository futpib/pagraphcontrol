/* global document */

const {
	map,
	prop,
	groupBy,
	flatten,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const plusMinus = require('../../utils/plus-minus');

const memoize = require('../../utils/memoize');

const {
	GraphView: GraphViewBase,
} = require('./base');

const originalEdgeToSatelliteNode = edge => ({
	id: `${edge.target}__satellite__${edge.id}`,
	type: 'satellite',

	edge: edge.id,
	edgeType: edge.type,

	source: edge.source,
	sourceType: edge.source.type,

	target: edge.target,
	targetType: edge.target.type,
});

const originalEdgeAndSatelliteNodeToSatelliteEdge = (edge, satelliteNode) => {
	const satelliteEdge = {
		id: edge.id,
		source: edge.source,
		target: satelliteNode.id,
		originalTarget: edge.target,
		index: edge.index,
		type: edge.type,
	};

	satelliteEdgeToOriginalEdge.set(satelliteEdge, edge);
	return satelliteEdge;
};

const originalEdgeToSatellites = memoize(edge => {
	const satelliteNode = originalEdgeToSatelliteNode(edge);
	const satelliteEdge = originalEdgeAndSatelliteNodeToSatelliteEdge(edge, satelliteNode);
	return { satelliteEdge, satelliteNode };
});

const Satellite = () => r(React.Fragment);

const satelliteSpread = 36;

const satelliteEdgeToOriginalEdge = new WeakMap();

class SatellitesGraphView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			originalEdgesByTargetNodeKey: {},
			satelliteNodesByTargetNodeKey: {},
			satelliteEdges: [],
			selected: null,
		};

		this.graphViewRef = this.props.graphViewRef || React.createRef();

		Object.assign(this, {
			onSwapEdge: this.onSwapEdge.bind(this),
			onNodeMove: this.onNodeMove.bind(this),

			onSelectEdge: this.onSelectEdge.bind(this),
			onEdgeMouseDown: this.onEdgeMouseDown.bind(this),
			onCreateEdge: this.onCreateEdge.bind(this),

			renderNode: this.renderNode.bind(this),
			renderNodeText: this.renderNodeText.bind(this),

			renderEdge: this.renderEdge.bind(this),
			renderEdgeText: this.renderEdgeText.bind(this),

			afterRenderEdge: this.afterRenderEdge.bind(this),
		});
	}

	static getDerivedStateFromProps(props) {
		const originalEdgesByTargetNodeKey = groupBy(prop('target'), props.edges);

		let { selected, moved } = props;

		const satelliteEdges = [];

		const satelliteNodesByTargetNodeKey = map(edges => map(edge => {
			const {
				satelliteNode,
				satelliteEdge,
			} = originalEdgeToSatellites(edge);

			if (edge === selected) {
				selected = satelliteEdge;
			}

			if (edge === moved) {
				moved = satelliteEdge;
			}

			satelliteEdges.push(satelliteEdge);

			return satelliteNode;
		}, edges), originalEdgesByTargetNodeKey);

		const satelliteNodes = flatten(map(node => {
			const satelliteNodes = satelliteNodesByTargetNodeKey[node.id] || [];
			SatellitesGraphView.repositionSatellites(node, satelliteNodes);
			return satelliteNodes.concat(node);
		}, props.nodes));

		return {
			originalEdgesByTargetNodeKey,
			satelliteNodesByTargetNodeKey,
			satelliteEdges,
			satelliteNodes,

			selected,
			moved,
		};
	}

	static repositionSatellites(position, satelliteNodes) {
		const offsetY = (satelliteNodes % 2) ? 0 : (satelliteSpread / 2);

		satelliteNodes.forEach((satelliteNode, i) => {
			if (satelliteNode.edgeType === 'monitorSource') {
				satelliteNode.x = position.x;
				satelliteNode.y = position.y;
				return;
			}
			satelliteNode.x = position.x;
			satelliteNode.y = position.y +
				offsetY +
				(satelliteSpread * plusMinus(i)) +
				((satelliteSpread / 2) * ((satelliteNodes.length + 1) % 2));
		});
	}

	onSwapEdge(sourceNode, targetNode, edge) {
		this.props.onSwapEdge(sourceNode, targetNode, edge);

		const { nodeKey } = this.props;

		const createdEdgeId = `edge-${sourceNode[nodeKey]}-${targetNode[nodeKey]}-container`;
		const createdEdge = document.getElementById(createdEdgeId);
		createdEdge.remove();
		this.graphViewRef.current.forceUpdate();
	}

	onCreateEdge(source, target) {
		const { nodeKey, onCreateEdge } = this.props;
		onCreateEdge(source, target);
		this.graphViewRef.current.removeEdgeElement(source[nodeKey], target[nodeKey]);
	}

	onNodeMove(position, nodeId, shiftKey) {
		const { nodeKey } = this.props;
		const satelliteNodes = this.state.satelliteNodesByTargetNodeKey[nodeId];
		if (satelliteNodes) {
			this.constructor.repositionSatellites(position, satelliteNodes);
			satelliteNodes.forEach(satelliteNode => {
				this.graphViewRef.current.handleNodeMove(satelliteNode, satelliteNode[nodeKey], shiftKey);
			});
		}
	}

	onSelectEdge(edge) {
		const originalEdge = satelliteEdgeToOriginalEdge.get(edge);
		if (this.props.onSelectEdge) {
			this.props.onSelectEdge(originalEdge || edge);
		}
	}

	onEdgeMouseDown(event, edge) {
		const originalEdge = satelliteEdgeToOriginalEdge.get(edge);
		if (this.props.onEdgeMouseDown) {
			this.props.onEdgeMouseDown(event, originalEdge || edge);
		}
	}

	renderNode(nodeRef, dgo, key, selected, hovered) {
		if (dgo.type !== 'satellite') {
			return this.props.renderNode(nodeRef, dgo, key, selected, hovered);
		}

		return r(Satellite);
	}

	renderNodeText(dgo, ...rest) {
		if (dgo.type !== 'satellite') {
			return this.props.renderNodeText(dgo, ...rest);
		}

		return r(React.Fragment);
	}

	renderEdge(...args) {
		return this.props.renderEdge(...args);
	}

	renderEdgeText(...args) {
		return this.props.renderEdgeText(...args);
	}

	afterRenderEdge(id, element, edge, edgeContainer) {
		const originalEdge = satelliteEdgeToOriginalEdge.get(edge);
		this.props.afterRenderEdge(id, element, originalEdge || edge, edgeContainer);
	}

	render() {
		const {
			satelliteEdges: edges,
			satelliteNodes: nodes,

			selected,
			moved,
		} = this.state;

		return r(GraphViewBase, {
			...this.props,

			selected,
			moved,

			ref: this.graphViewRef,

			nodes,
			edges,

			onSwapEdge: this.onSwapEdge,
			onNodeMove: this.onNodeMove,

			onSelectEdge: this.onSelectEdge,

			onCreateEdge: this.onCreateEdge,

			onEdgeMouseDown: this.onEdgeMouseDown,

			renderNode: this.renderNode,
			renderNodeText: this.renderNodeText,

			renderEdge: this.renderEdge,
			renderEdgeText: this.renderEdgeText,

			afterRenderEdge: this.props.afterRenderEdge && this.afterRenderEdge,
		});
	}
}

module.exports = { SatellitesGraphView };
