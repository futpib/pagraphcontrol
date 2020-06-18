/* global document */

const {
	merge,
} = require('ramda');

const r = require('r-dom');

const {
	GraphView: GraphViewBase,
	Node: NodeBase,
	Edge: EdgeBase,
	GraphUtils,
} = require('react-digraph');

const math = require('mathjs');

const d3 = require('d3');

const { size } = require('../../constants/view');

class GraphView extends GraphViewBase {
	constructor(props) {
		super(props);

		if (props.layoutEngine) {
			this.layoutEngine = props.layoutEngine;
		}

		Object.assign(this, {
			_super_handleZoomStart: this.handleZoomStart,
			handleZoomStart: this.constructor.prototype.handleZoomStart.bind(this),
			_super_handleZoomEnd: this.handleZoomEnd,
			handleZoomEnd: this.constructor.prototype.handleZoomEnd.bind(this),

			_super_handleNodeMove: this.handleNodeMove,
			handleNodeMove: this.constructor.prototype.handleNodeMove.bind(this),

			_super_getEdgeComponent: this.getEdgeComponent,
			getEdgeComponent: this.constructor.prototype.getEdgeComponent.bind(this),

			_super_getNodeComponent: this.getNodeComponent,
			getNodeComponent: this.constructor.prototype.getNodeComponent.bind(this),

			_super_handleNodeMouseEnter: this.handleNodeMouseEnter,
			handleNodeMouseEnter: this.constructor.prototype.handleNodeMouseEnter.bind(this),
		});
	}

	static getDerivedStateFromProps(props, state) {
		const derivedState = super.getDerivedStateFromProps(props, state);

		if (props.layoutEngine) {
			derivedState.nodes = props.layoutEngine.adjustNodes(derivedState.nodes, derivedState.nodesMap);
		}

		if (props.moved && props.selected) {
			const edgeKey = `${props.moved.source}_${props.moved.target}`;
			const nodeKey = `key-${props.selected.id}`;

			if (derivedState.edgesMap[edgeKey] && derivedState.nodesMap[nodeKey]) {
				derivedState.previousMoved = props.moved;

				derivedState.draggingEdge = true;
				derivedState.draggedEdge = props.moved;

				derivedState.edgeEndNode = props.selected;

				derivedState.hoveredNode = true;
				derivedState.hoveredNodeData = props.selected;

				derivedState.selectedNodeObj = {
					nodeId: null,
					node: null,
				};
			}
		} else if (!props.moved && state.previousMoved) {
			derivedState.previousMoved = null;

			derivedState.draggingEdge = false;
			derivedState.draggedEdge = null;

			derivedState.edgeEndNode = null;

			derivedState.hoveredNode = false;
			derivedState.hoveredNodeData = null;
		}

		return derivedState;
	}

	shouldComponentUpdate(nextProps, nextState) {
		return super.shouldComponentUpdate(nextProps, nextState)
			|| this.state.edgeEndNode !== nextState.edgeEndNode;
	}

	componentDidUpdate(previousProps, previousState) {
		const { nodeKey } = this.props;

		if (this.state.edgeEndNode !== previousState.edgeEndNode) {
			if (previousState.edgeEndNode) {
				const previousNode = document.querySelector('#node-' + previousState.edgeEndNode[nodeKey]);
				previousNode.classList.remove('targeted');
			}

			if (this.state.edgeEndNode) {
				const node = document.querySelector('#node-' + this.state.edgeEndNode[nodeKey]);
				node.classList.add('targeted');
			}
		}

		if (!previousProps.moved && this.props.moved) {
			this.removeEdgeElement(this.props.moved.source, this.props.moved.target);
		} else if (previousProps.moved && !this.props.moved) {
			const container = document.querySelector('#edge-custom-container');
			if (container) {
				container.remove();
			}
		}

		if (this.props.selected
			&& this.props.moved
			&& (
				previousProps.selected !== this.props.selected
				|| previousProps.moved !== this.props.moved
			)
			&& this.state.draggedEdge
		) {
			this.dragEdge();
		}

		super.componentDidUpdate(previousProps, previousState);
	}

	getMouseCoordinates(...args) {
		if (this.props.selected && this.props.moved) {
			return [
				this.props.selected.x,
				this.props.selected.y,
			];
		}

		return super.getMouseCoordinates(...args);
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
			onNodeMouseDown: this.props.onNodeMouseDown,
			onNodeMouseEnter: this.handleNodeMouseEnter,
			onNodeMouseLeave: this.handleNodeMouseLeave,
			onNodeDragStart: this.props.onNodeDragStart,
			onNodeDragEnd: this.props.onNodeDragEnd,
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

	handleZoomStart(...args) {
		if (this.props.onZoomStart) {
			this.props.onZoomStart();
		}

		return this._super_handleZoomStart(...args);
	}

	handleZoomEnd(...args) {
		if (this.props.onZoomEnd) {
			this.props.onZoomEnd();
		}

		return this._super_handleZoomEnd(...args);
	}

	handleNodeMove(position, nodeId, shiftKey) {
		this._super_handleNodeMove(position, nodeId, shiftKey);
		if (this.props.onNodeMove) {
			this.props.onNodeMove(position, nodeId, shiftKey);
		}
	}

	handleNodeMouseEnter(event, data, hovered) {
		if (hovered && !this.state.hoveredNode) {
			this.setState({
				hoveredNode: true,
				hoveredNodeData: data,
			});
		} else if (!hovered && this.state.draggingEdge) {
			this.setState({
				edgeEndNode: data,
			});
		} else {
			this.setState({
				hoveredNode: true,
				hoveredNodeData: data,
			});
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
			onEdgeMouseDown: this.props.onEdgeMouseDown,
		});
	}

	syncRenderEdge(edge, nodeMoving = false) {
		if (!edge.source) {
			return;
		}

		// XXX WORKAROUND: this can be called from `requestAnimationFrame` callback after the edge has already been removed.
		// Might be a react-digraph bug.
		const edgeKey = [ edge.source, edge.target ].join('_');
		if (edge.source && edge.target && !this.state.edgesMap[edgeKey]) {
			return;
		}

		const idVar = edge.target ? `${edge.source}-${edge.target}` : 'custom';
		const id = `edge-${idVar}`;
		const element = this.getEdgeComponent(edge, nodeMoving);
		this.renderEdge(id, element, edge, nodeMoving);

		if (this.isEdgeSelected(edge)) {
			const container = document.querySelector(`#${id}-container`);
			container.parentNode.append(container);
		}
	}
}

GraphView.defaultProps = merge(GraphViewBase.defaultProps, {
	layoutEngineType: null,
});

class Node extends NodeBase {
	constructor(props) {
		super(props);

		Object.assign(this, {
			_super_handleDragStart: this.handleDragStart,
			handleDragStart: this.constructor.prototype.handleDragStart.bind(this),

			_super_handleDragEnd: this.handleDragEnd,
			handleDragEnd: this.constructor.prototype.handleDragEnd.bind(this),

			handleMouseDown: this.constructor.prototype.handleMouseDown.bind(this),
		});
	}

	componentDidMount() {
		d3
			.select(this.nodeRef.current)
			.on('mousedown', this.handleMouseDown);

		super.componentDidMount();
	}

	componentWillUnmount() {
		d3
			.select(this.nodeRef.current)
			.on('mousedown', null);

		super.componentWillUnmount();
	}

	handleMouseDown() {
		if (this.props.onNodeMouseDown) {
			this.props.onNodeMouseDown(d3.event, this.props.data);
		}
	}

	handleDragStart(...args) {
		if (this.props.onNodeDragStart) {
			this.props.onNodeDragStart(...args);
		}

		return this._super_handleDragStart(...args);
	}

	handleDragEnd(...args) {
		if (this.props.onNodeDragEnd) {
			this.props.onNodeDragEnd(...args);
		}

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
	constructor(props) {
		super(props);

		Object.assign(this, {
			handleMouseDown: this.constructor.prototype.handleMouseDown.bind(this),
		});
	}

	componentDidMount() {
		d3
			.select(this.edgeOverlayRef.current)
			.on('mousedown', this.handleMouseDown);
	}

	componentWillUnmount() {
		d3
			.select(this.edgeOverlayRef.current)
			.on('mousedown', null);
	}

	handleMouseDown() {
		if (this.props.onEdgeMouseDown) {
			this.props.onEdgeMouseDown(d3.event, this.props.data);
		}
	}

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
