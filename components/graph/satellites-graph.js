/* global document */

const {
	map,
	prop,
	groupBy,
	flatten,
	addIndex,
	mapObjIndexed,
	values,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const plusMinus = require('../../utils/plus-minus');

const {
	GraphView: GraphViewBase,
} = require('./base');

const mapIndexed = addIndex(map);

const Satellite = () => r(React.Fragment);

const satelliteSpread = 36;

class GraphView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			edgesByTargetNodeKey: {},
			satelliteNodesByTargetNodeKey: {},
		};

		this.graph = React.createRef();

		Object.assign(this, {
			onSwapEdge: this.onSwapEdge.bind(this),
			onNodeMove: this.onNodeMove.bind(this),

			renderNode: this.renderNode.bind(this),
			renderNodeText: this.renderNodeText.bind(this),
		});
	}

	static getDerivedStateFromProps(props) {
		const { nodeKey, edgeKey } = props;

		const edgesByTargetNodeKey = groupBy(prop('target'), props.edges);
		const satelliteNodesByTargetNodeKey = map(map(edge => ({
			[nodeKey]: `${edge.target}__satellite__${edge[edgeKey]}`,
			edge: edge[edgeKey],
			source: edge.source,
			target: edge.target,
			type: 'satellite',
		})), edgesByTargetNodeKey);

		return { edgesByTargetNodeKey, satelliteNodesByTargetNodeKey };
	}

	static repositionSatellites(position, satelliteNodes) {
		satelliteNodes.forEach((satelliteNode, i) => {
			satelliteNode.x = position.x;
			satelliteNode.y = position.y +
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
		this.graph.current.forceUpdate();
	}

	onNodeMove(position, nodeId, shiftKey) {
		const { nodeKey } = this.props;
		const satelliteNodes = this.state.satelliteNodesByTargetNodeKey[nodeId];
		if (satelliteNodes) {
			this.constructor.repositionSatellites(position, satelliteNodes);
			satelliteNodes.forEach(satelliteNode => {
				this.graph.current.handleNodeMove(satelliteNode, satelliteNode[nodeKey], shiftKey);
			});
		}
	}

	renderNode(nodeRef, dgo, key, selected, hovered) {
		if (dgo.type !== 'satellite') {
			return this.props.renderNode(nodeRef, dgo, key, selected, hovered);
		}

		return r(Satellite);
	}

	renderNodeText(dgo) {
		if (dgo.type !== 'satellite') {
			return this.props.renderNodeText(dgo);
		}

		return r(React.Fragment);
	}

	render() {
		const { nodeKey } = this.props;
		const { edgesByTargetNodeKey, satelliteNodesByTargetNodeKey } = this.state;

		const nodes = flatten(map(node => {
			const satelliteNodes = satelliteNodesByTargetNodeKey[node[nodeKey]] || [];
			this.constructor.repositionSatellites(node, satelliteNodes);
			return satelliteNodes.concat(node);
		}, this.props.nodes));

		const edges = flatten(values(mapObjIndexed((edges, target) => mapIndexed((edge, i) => ({
			id: edge.id,
			source: edge.source,
			target: satelliteNodesByTargetNodeKey[target][i][nodeKey],
			originalTarget: edge.target,
			index: edge.index,
			type: edge.type,
		}), edges), edgesByTargetNodeKey)));

		return r(GraphViewBase, {
			...this.props,

			ref: this.graph,

			nodes,
			edges,

			onSwapEdge: this.onSwapEdge,
			onNodeMove: this.onNodeMove,

			renderNode: this.renderNode,
			renderNodeText: this.renderNodeText,
		});
	}
}

module.exports = { GraphView };
