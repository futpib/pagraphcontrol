
const {
	map,
	values,
	flatten,
	memoizeWith,
	pick,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const {
	GraphView,
	Edge,
} = require('react-digraph');

const math = require('mathjs');

const { pulse: pulseActions } = require('../../actions');

const { getPaiByTypeAndIndex } = require('../../selectors');

Edge.calculateOffset = function (nodeSize, source, target) {
	const arrowVector = math.matrix([ target.x - source.x, target.y - source.y ]);
	const offsetLength = Math.max(0, Math.min((0.85 * size), (math.norm(arrowVector) / 2) - 40));
	const offsetVector = math.dotMultiply(arrowVector, (offsetLength / math.norm(arrowVector)) || 0);

	return {
		xOff: offsetVector.get([ 0 ]),
		yOff: offsetVector.get([ 1 ]),
	};
};

const weakmapId_ = new WeakMap();
const weakmapId = o => {
	if (!weakmapId_.has(o)) {
		weakmapId_.set(o, String(Math.random()));
	}
	return weakmapId_.get(o);
};

const dgoToPai = new WeakMap();

const memoize = memoizeWith(weakmapId);

const key = pao => `${pao.type}-${pao.index}`;

const sourceKey = pai => {
	if (pai.clientIndex === -1) {
		return `module-${pai.moduleIndex}`;
	}
	return `client-${pai.clientIndex}`;
};

const targetKey = pai => {
	if (pai.type === 'sinkInput') {
		return `sink-${pai.sinkIndex}`;
	}
	return `source-${pai.sourceIndex}`;
};

const paoToNode = memoize(pao => ({
	id: key(pao),
	index: pao.index,
	type: pao.type,
}));

const paiToEdge = memoize(pai => ({
	source: sourceKey(pai),
	target: targetKey(pai),
	index: pai.index,
	type: pai.type,
}));

const graphConfig = {
	nodeTypes: {},

	nodeSubtypes: {},

	edgeTypes: {
		sinkInput: {
			shapeId: '#sinkInput',
			shape: r('symbol', {
				viewBox: '0 0 50 50',
				id: 'sinkInput',
				key: '0',
			}, r.circle({
				cx: '25',
				cy: '25',
				r: '8',
				fill: 'currentColor',
			})),
		},
		sourceOutput: {
			shapeId: '#sourceOutput',
			shape: r('symbol', {
				viewBox: '0 0 50 50',
				id: 'sourceOutput',
				key: '0',
			}, r.circle({
				cx: '25',
				cy: '25',
				r: '8',
				fill: 'currentColor',
			})),
		},
	},
};

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

const size = 120;
const s2 = size / 2;

const Sink = () => r.path({
	d: d()
		.moveTo(-s2, 0)
		.lineTo(-s2 * 1.3, -s2)
		.lineTo(s2, -s2)
		.lineTo(s2, s2)
		.lineTo(-s2 * 1.3, s2)
		.close()
		.toString(),
});

const Source = () => r.path({
	d: d()
		.moveTo(s2 * 1.3, 0)
		.lineTo(s2, s2)
		.lineTo(-s2, s2)
		.lineTo(-s2, -s2)
		.lineTo(s2, -s2)
		.close()
		.toString(),
});

const Client = () => r.path({
	d: d()
		.moveTo(s2 * 1.3, 0)
		.lineTo(s2, s2)
		.lineTo(-s2 * 1.3, s2)
		.lineTo(-s2, 0)
		.lineTo(-s2 * 1.3, -s2)
		.lineTo(s2, -s2)
		.close()
		.toString(),
});

const Module = Client;

const gridDotSize = 2;
const gridSpacing = 36;
const renderDefs = () => r(React.Fragment, [
	r.pattern({
		id: 'background-pattern',
		key: 'background-pattern',
		width: gridSpacing,
		height: gridSpacing,
		patternUnits: 'userSpaceOnUse',
	}, r.circle({
		className: 'grid-dot',
		cx: (gridSpacing || 0) / 2,
		cy: (gridSpacing || 0) / 2,
		r: gridDotSize,
	})),

	r('marker', {
		id: 'start-arrow',
		viewBox: '0 -8 16 16',
		refX: '8',
		markerWidth: '16',
		markerHeight: '16',
		orient: 'auto',
	}, r.path({
		className: 'arrow',
		d: 'M 16,-8 L 0,0 L 16,8',
	})),
]);

const renderNode = (nodeRef, data, key, selected, hovered) => r({
	sink: Sink,
	source: Source,
	client: Client,
	module: Module,
}[data.type], {
	selected,
	hovered,
});

const DebugText = ({ dgo, pai, open = false }) => r.div({
	style: {
		fontSize: '50%',
	},
}, [
	open && JSON.stringify(dgo, null, 2),
	open && JSON.stringify(pai, null, 2),
]);

const SinkText = ({ dgo, pai }) => r.div([
	r.div({
		title: pai.name,
	}, pai.description),
	r(DebugText, { dgo, pai }),
]);

const SourceText = ({ dgo, pai }) => r.div([
	r.div({
		title: pai.name,
	}, pai.description),
	r(DebugText, { dgo, pai }),
]);

const ClientText = ({ dgo, pai }) => r.div([
	r.div({
	}, pai.name),
	r(DebugText, { dgo, pai }),
]);

const ModuleText = ({ dgo, pai }) => r.div([
	r.div({
		title: pai.properties.module.description,
	}, pai.name),
	r(DebugText, { dgo, pai }),
]);

const renderNodeText = dgo => r('foreignObject', {
	x: -s2,
	y: -s2,
}, r.div({
	style: {
		width: size,
		height: size,

		padding: 2,

		whiteSpace: 'pre',
	},
}, r({
	sink: SinkText,
	source: SourceText,
	client: ClientText,
	module: ModuleText,
}[dgo.type] || ModuleText, {
	dgo,
	pai: dgoToPai.get(dgo),
})));

const afterRenderEdge = (id, element, edge, edgeContainer) => {
	if (edge.type) {
		edgeContainer.classList.add(edge.type);
	}
};

class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: null,
		};
	}

	onSelectNode(selected) {
		this.setState({ selected });
	}

	onCreateNode() {
		
	}

	onUpdateNode() {
	}

	onDeleteNode() {
	}

	onSelectEdge() {
	}

	onCreateEdge() {
	}

	onSwapEdge(sourceNode, targetNode, edge) {
		if (edge.type === 'sinkInput') {
			this.props.moveSinkInput(edge.index, targetNode.index);
		} else {
			this.props.moveSourceOutput(edge.index, targetNode.index);
		}
	}

	onDeleteEdge() {}

	render() {
		const nodes = map(paoToNode, flatten(map(values, [
			this.props.objects.sinks,
			this.props.objects.sources,
			this.props.objects.clients,
			this.props.objects.modules,
		])));
		const edges = map(paiToEdge, flatten(map(values, [
			this.props.infos.sinkInputs,
			this.props.infos.sourceOutputs,
		])));

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

		nodes.forEach(node => {
			const pai = getPaiByTypeAndIndex(node.type, node.index)({ pulse: this.props });
			dgoToPai.set(node, pai);
		});

		return r.div({
			id: 'graph',
			style: {},
		}, r(GraphView, {
			nodeKey: 'id',

			nodes,
			edges,

			selected: this.state.selected,

			...graphConfig,

			onSelectNode: this.onSelectNode.bind(this),
			onCreateNode: this.onCreateNode.bind(this),
			onUpdateNode: this.onUpdateNode.bind(this),
			onDeleteNode: this.onDeleteNode.bind(this),
			onSelectEdge: this.onSelectEdge.bind(this),
			onCreateEdge: this.onCreateEdge.bind(this),
			onSwapEdge: this.onSwapEdge.bind(this),
			onDeleteEdge: this.onDeleteEdge.bind(this),

			showGraphControls: false,

			edgeArrowSize: 16,

			backgroundFillId: '#background-pattern',

			renderDefs,
			renderNode,
			renderNodeText,
			afterRenderEdge,
		}));
	}
}

module.exports = connect(
	state => state.pulse,
	dispatch => bindActionCreators(pick([
		'moveSinkInput',
		'moveSourceOutput',
	], pulseActions), dispatch),
)(Graph);
