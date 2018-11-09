
const r = require('r-dom');

const {
	GraphView: GraphViewBase,
	Edge: EdgeBase,
	GraphUtils,
} = require('react-digraph');

const math = require('mathjs');

class GraphView extends GraphViewBase {
	constructor(props) {
		super(props);

		Object.assign(this, {
			_super_handleNodeMove: this.handleNodeMove,
			handleNodeMove: this.constructor.prototype.handleNodeMove.bind(this),

			_super_getEdgeComponent: this.handleNodeMove,
			getEdgeComponent: this.constructor.prototype.getEdgeComponent.bind(this),
		});
	}

	handleNodeMove(position, nodeId, shiftKey) {
		this._super_handleNodeMove(position, nodeId, shiftKey);
		if (this.props.onNodeMove) {
			this.props.onNodeMove(position, nodeId, shiftKey);
		}
	}

	getEdgeComponent(edge) {
		if (!this.props.renderEdge) {
			return this._super_getEdgeComponent(edge);
		}

		const sourceNodeMapNode = this.getNodeById(edge.source);
		const sourceNode = sourceNodeMapNode ? sourceNodeMapNode.node : null;
		const targetNodeMapNode = this.getNodeById(edge.target);
		const targetNode = targetNodeMapNode ? targetNodeMapNode.node : null;
		const { targetPosition } = edge;
		const { edgeTypes, edgeHandleSize, nodeSize, nodeKey, renderEdgeText } = this.props;
		const selected = this.isEdgeSelected(edge);

		return r(this.props.renderEdge || Edge, {
			data: edge,
			edgeTypes,
			edgeHandleSize,
			nodeSize,
			sourceNode,
			targetNode: targetNode || targetPosition,
			nodeKey,
			isSelected: selected,
			renderEdgeText,
		});
	}
}

const size = 120;

EdgeBase.calculateOffset = function (nodeSize, source, target) {
	const arrowVector = math.matrix([ target.x - source.x, target.y - source.y ]);
	const offsetLength = Math.max(0, Math.min((0.75 * size), (math.norm(arrowVector) / 2) - 40));
	const offsetVector = math.dotMultiply(arrowVector, (offsetLength / math.norm(arrowVector)) || 0);

	return {
		xOff: offsetVector.get([ 0 ]),
		yOff: offsetVector.get([ 1 ]),
	};
};

class Edge extends EdgeBase {
	render() {
		const { data } = this.props;
		const id = `${data.source || ''}_${data.target}`;
		const className = GraphUtils.classNames('edge', {
			selected: this.props.isSelected,
		});

		return r.g({
			className: 'edge-container',
			'data-source': data.source,
			'data-target': data.target,
		}, [
			r.g({
				className,
			}, [
				r.path({
					className: 'edge-path',
					d: this.getPathDescription(data) || undefined,
				}),
				this.props.renderEdgeText && r(this.props.renderEdgeText, {
					data,
					transform: this.getEdgeHandleTranslation(),
				}),
			]),
			r.g({
				className: 'edge-mouse-handler',
			}, [
				r.path({
					className: 'edge-overlay-path',
					ref: this.edgeOverlayRef,
					id,
					'data-source': data.source,
					'data-target': data.target,
					d: this.getPathDescription(data) || undefined,
				}),
			]),
		]);
	}
}

module.exports = {
	GraphView,
	Edge,
};
