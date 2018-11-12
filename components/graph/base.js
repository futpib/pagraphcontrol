/* global document */

const r = require('r-dom');

const {
	GraphView: GraphViewBase,
	Node: NodeBase,
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

			_super_getEdgeComponent: this.getEdgeComponent,
			getEdgeComponent: this.constructor.prototype.getEdgeComponent.bind(this),

			_super_getNodeComponent: this.getNodeComponent,
			getNodeComponent: this.constructor.prototype.getNodeComponent.bind(this),
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return super.shouldComponentUpdate(nextProps, nextState) ||
			this.state.edgeEndNode !== nextState.edgeEndNode;
	}

	componentDidUpdate(prevProps, prevState) {
		const { nodeKey } = this.props;

		if (this.state.edgeEndNode !== prevState.edgeEndNode) {
			if (prevState.edgeEndNode) {
				const prevNode = document.getElementById('node-' + prevState.edgeEndNode[nodeKey]);
				prevNode.classList.remove('targeted');
			}
			if (this.state.edgeEndNode) {
				const node = document.getElementById('node-' + this.state.edgeEndNode[nodeKey]);
				node.classList.add('targeted');
			}
		}

		super.componentDidUpdate(prevProps, prevState);
	}

	getNodeComponent(id, node) {
		const { nodeTypes, nodeSubtypes, nodeSize, renderNode, renderNodeText, nodeKey } = this.props;
		return r(Node, {
			key: id,
			id,
			data: node,
			nodeTypes,
			nodeSize,
			nodeKey,
			nodeSubtypes,
			onNodeMouseEnter: this.handleNodeMouseEnter,
			onNodeMouseLeave: this.handleNodeMouseLeave,
			onNodeMove: this.handleNodeMove,
			onNodeUpdate: this.handleNodeUpdate,
			onNodeSelected: this.handleNodeSelected,
			renderNode,
			renderNodeText,
			isSelected: this.state.selectedNodeObj.node === node,
			layoutEngine: this.layoutEngine,
			viewWrapperElem: this.viewWrapper.current,
		});
	}

	handleNodeMove(position, nodeId, shiftKey) {
		this._super_handleNodeMove(position, nodeId, shiftKey);
		if (this.props.onNodeMove) {
			this.props.onNodeMove(position, nodeId, shiftKey);
		}
	}

	getEdgeComponent(edge, nodeMoving) {
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
			nodeMoving,
			renderEdgeText,
		});
	}

	syncRenderEdge(edge, nodeMoving = false) {
		if (!edge.source) {
			return;
		}

		const idVar = edge.target ? `${edge.source}-${edge.target}` : 'custom';
		const id = `edge-${idVar}`;
		const element = this.getEdgeComponent(edge, nodeMoving);
		this.renderEdge(id, element, edge, nodeMoving);

		if (this.isEdgeSelected(edge)) {
			const container = document.getElementById(`${id}-container`);
			container.parentNode.appendChild(container);
		}
	}
}

const size = 120;

class Node extends NodeBase {
	constructor(props) {
		super(props);

		Object.assign(this, {
			_super_handleDragEnd: this.handleDragEnd,
			handleDragEnd: this.constructor.prototype.handleDragEnd.bind(this),
		});
	}

	handleDragEnd(...args) {
		this.oldSibling = null;
		return this._super_handleDragEnd(...args);
	}
}

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
			className: 'edge-container ' + (this.props.className || ''),
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
				this.props.renderEdgeText && !this.props.nodeMoving && r(this.props.renderEdgeText, {
					data,
					transform: this.getEdgeHandleTranslation(),
					selected: this.props.isSelected,
				}),
			]),
		]);
	}
}

module.exports = {
	GraphView,
	Edge,
};
