
const {
	map,
	values,
	flatten,
	path,
	filter,
	forEach,
	merge,
	repeat,
	defaultTo,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const d = require('../../utils/d');
const memoize = require('../../utils/memoize');

const {
	pulse: pulseActions,
	icons: iconsActions,
} = require('../../actions');

const {
	getPaiByTypeAndIndex,
	getDerivedMonitorSources,
} = require('../../selectors');

const {
	PA_VOLUME_NORM,
} = require('../../constants/pulse');

const { size } = require('../../constants/view');

const VolumeSlider = require('../../components/volume-slider');

const {
	GraphView,
} = require('./satellites-graph');

const {
	Edge,
} = require('./base');

const LayoutEngine = require('./layout-engine');

const dgoToPai = new WeakMap();

const key = pao => `${pao.type}-${pao.index}`;

const sourceKey = pai => {
	if (pai.type === 'monitorSource') {
		return `sink-${pai.sinkIndex}`;
	}
	if (pai.clientIndex === -1) {
		return `module-${pai.moduleIndex}`;
	}
	return `client-${pai.clientIndex}`;
};

const targetKey = pai => {
	if (pai.type === 'monitorSource') {
		return `source-${pai.sourceIndex}`;
	}
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

const paoToEdge = memoize(pao => ({
	id: key(pao),
	source: sourceKey(pao),
	target: targetKey(pao),
	index: pao.index,
	type: pao.type,
}));

const getPaiIcon = memoize(pai => {
	return null ||
		path([ 'properties', 'application', 'icon_name' ], pai) ||
		path([ 'properties', 'device', 'icon_name' ], pai);
});

const graphConfig = {
	nodeTypes: {},

	nodeSubtypes: {},

	edgeTypes: {},
};

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

const Marker = ({ id, d }) => r('marker', {
	id,
	viewBox: '0 -8 18 16',
	refX: '16',
	markerWidth: '16',
	markerHeight: '16',
	orient: 'auto',
}, r.path({
	className: 'arrow',
	d,
}));

const sourceArrowPathDescription = 'M 16,-8 L 0,0 L 16,8';
const sinkArrowPathDescription = 'M 2,-8 L 18,0 L 2,8';

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

	r(Marker, {
		id: 'my-source-arrow',
		d: sourceArrowPathDescription,
	}),

	r(Marker, {
		id: 'my-sink-arrow',
		d: sinkArrowPathDescription,
	}),

	// WORKAROUND: `context-fill` did not work
	r(Marker, {
		id: 'my-source-arrow-selected',
		d: sourceArrowPathDescription,
	}),

	r(Marker, {
		id: 'my-sink-arrow-selected',
		d: sinkArrowPathDescription,
	}),
]);

const renderNode = (nodeRef, data, key, selected, hovered) => r({
	sink: Sink,
	source: Source,
	client: Client,
	module: Module,
}[data.type] || Module, {
	selected,
	hovered,
});

const getVolumesForThumbnail = ({ pai, state }) => {
	const { lockChannelsTogether } = state.preferences;
	let volumes = (pai && pai.channelVolumes) || [];
	if (lockChannelsTogether) {
		if (volumes.every(v => v === volumes[0])) {
			volumes = [
				volumes.reduce((a, b) => Math.max(a, b)),
			];
		}
	}
	return volumes;
};

const VolumeThumbnail = ({ pai, state }) => {
	if (state.preferences.hideVolumeThumbnails) {
		return r(React.Fragment);
	}
	const normVolume = PA_VOLUME_NORM;
	const baseVolume = defaultTo(normVolume, pai && pai.baseVolume);

	const volumes = getVolumesForThumbnail({ pai, state });
	const muted = !pai || pai.muted;

	const step = size / 32;
	const padding = 2;
	const width = size - 8;
	const height = ((1 + volumes.length) * step);

	return r.svg({
		classSet: {
			'volume-thumbnail': true,
			'volume-thumbnail-muted': muted,
		},
		height: (2 * padding) + height,
	}, [
		r.line({
			className: 'volume-thumbnail-ruler-line',
			x1: padding,
			x2: padding,
			y1: padding,
			y2: padding + height,
		}),

		baseVolume && r.line({
			className: 'volume-thumbnail-ruler-line',
			x1: padding + ((baseVolume / normVolume) * width),
			x2: padding + ((baseVolume / normVolume) * width),
			y1: padding,
			y2: padding + height,
		}),

		r.line({
			className: 'volume-thumbnail-ruler-line',
			x1: padding + width,
			x2: padding + width,
			y1: padding,
			y2: padding + height,
		}),

		...volumes.map((v, i) => {
			const a = Math.min(v / normVolume, baseVolume / normVolume);
			const b = Math.min(v / normVolume, 1);
			const c = v / normVolume;

			return r(React.Fragment, [
				r.line({
					className: 'volume-thumbnail-volume-line',
					x1: padding,
					x2: padding + (a * width),
					y1: padding + ((1 + i) * step),
					y2: padding + ((1 + i) * step),
				}),

				r.line({
					className: 'volume-thumbnail-volume-line volume-thumbnail-volume-line-warning',
					x1: padding + (a * width),
					x2: padding + (b * width),
					y1: padding + ((1 + i) * step),
					y2: padding + ((1 + i) * step),
				}),

				r.line({
					className: 'volume-thumbnail-volume-line volume-thumbnail-volume-line-error',
					x1: padding + (b * width),
					x2: padding + (c * width),
					y1: padding + ((1 + i) * step),
					y2: padding + ((1 + i) * step),
				}),
			]);
		}),
	]);
};

const getVolumes = ({ pai, state }) => {
	const { lockChannelsTogether } = state.preferences;
	let volumes = (pai && pai.channelVolumes) || [];
	if (lockChannelsTogether) {
		volumes = [
			volumes.reduce((a, b) => Math.max(a, b)),
		];
	}
	return { volumes, lockChannelsTogether };
};

const VolumeControls = ({ pai, state }) => {
	const { maxVolume } = state.preferences;
	const { volumes, lockChannelsTogether } = getVolumes({ pai, state });
	const baseVolume = pai && pai.baseVolume;
	const muted = !pai || pai.muted;

	return r.div({
		className: 'volume-controls',
	}, [
		...volumes.map((v, channelIndex) => r(VolumeSlider, {
			muted,
			baseVolume,
			normVolume: PA_VOLUME_NORM,
			maxVolume: PA_VOLUME_NORM * maxVolume,
			value: v,
			onChange: v => {
				if (pai.type === 'sink') {
					if (lockChannelsTogether) {
						state.setSinkVolumes(pai.index, repeat(v, pai.sampleSpec.channels));
					} else {
						state.setSinkChannelVolume(pai.index, channelIndex, v);
					}
				} else if (pai.type === 'source') {
					if (lockChannelsTogether) {
						state.setSourceVolumes(pai.index, repeat(v, pai.sampleSpec.channels));
					} else {
						state.setSourceChannelVolume(pai.index, channelIndex, v);
					}
				} else if (pai.type === 'sinkInput') {
					if (lockChannelsTogether) {
						state.setSinkInputVolumes(pai.index, repeat(v, pai.sampleSpec.channels));
					} else {
						state.setSinkInputChannelVolume(pai.index, channelIndex, v);
					}
				} else if (pai.type === 'sourceOutput') {
					if (lockChannelsTogether) {
						state.setSourceOutputVolumes(pai.index, repeat(v, pai.sampleSpec.channels));
					} else {
						state.setSourceOutputChannelVolume(pai.index, channelIndex, v);
					}
				}
			},
		})),
	]);
};

const DebugText = ({ dgo, pai, state }) => r.div({
	style: {
		fontSize: '50%',
	},
}, state.preferences.showDebugInfo ? [
	JSON.stringify(dgo, null, 2),
	JSON.stringify(pai, null, 2),
] : []);

const SinkText = ({ dgo, pai, state, selected }) => r.div([
	r.div({
		className: 'node-name',
		title: pai.name,
	}, pai.description),
	!selected && r(VolumeThumbnail, { pai, state }),
	selected && r(VolumeControls, { pai, state }),
	r(DebugText, { dgo, pai, state }),
]);

const SourceText = ({ dgo, pai, state, selected }) => r.div([
	r.div({
		className: 'node-name',
		title: pai.name,
	}, pai.description),
	!selected && r(VolumeThumbnail, { pai, state }),
	selected && r(VolumeControls, { pai, state }),
	r(DebugText, { dgo, pai, state }),
]);

const ClientText = ({ dgo, pai, state }) => r.div([
	r.div({
		className: 'node-name',
		title: path('properties.application.process.binary'.split('.'), pai),
	}, pai.name),
	r(DebugText, { dgo, pai, state }),
]);

const ModuleText = ({ dgo, pai, state }) => r.div([
	r.div({
		className: 'node-name',
		title: pai.properties.module.description,
	}, pai.name),
	r(DebugText, { dgo, pai, state }),
]);

const renderNodeText = state => (dgo, i, selected) => {
	const pai = dgoToPai.get(dgo);

	if (!pai) {
		return r(React.Fragment);
	}

	return r('foreignObject', {
		x: -s2,
		y: -s2,
	}, r.div({
		className: 'node-text',
		style: {
			width: size,
			height: size,

			backgroundImage: (icon => icon && `url(${icon})`)(state.icons[getPaiIcon(pai)]),
		},
	}, r({
		sink: SinkText,
		source: SourceText,
		client: ClientText,
		module: ModuleText,
	}[dgo.type] || ModuleText, {
		dgo,
		pai,
		state,
		selected,
	})));
};

const renderEdge = props => r(Edge, {
	classSet: {
		[props.data.type]: true,
	},
	...props,
});

const renderEdgeText = state => ({ data: dgo, transform, selected }) => {
	const pai = dgo.type && getPaiByTypeAndIndex(dgo.type, dgo.index)({ pulse: state });

	return r('foreignObject', {
		transform,
	}, r.div({
		className: 'edge-text',
		style: {
			width: size,
			height: size,
		},
	}, [
		pai && (!selected) && r(VolumeThumbnail, { pai, state }),
		pai && selected && r(VolumeControls, { pai, state }),
		r(DebugText, { dgo, pai, state }),
	]));
};

const layoutEngine = new LayoutEngine();

class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: null,
		};

		this._requestedIcons = new Set();

		Object.assign(this, {
			onSelectNode: this.onSelectNode.bind(this),
			onCreateNode: this.onCreateNode.bind(this),
			onUpdateNode: this.onUpdateNode.bind(this),
			onDeleteNode: this.onDeleteNode.bind(this),
			onNodeMouseDown: this.onNodeMouseDown.bind(this),

			onSelectEdge: this.onSelectEdge.bind(this),
			onCreateEdge: this.onCreateEdge.bind(this),
			onSwapEdge: this.onSwapEdge.bind(this),
			onDeleteEdge: this.onDeleteEdge.bind(this),
			onEdgeMouseDown: this.onEdgeMouseDown.bind(this),
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !(
			(nextProps.objects === this.props.objects) &&
				(nextProps.infos === this.props.infos) &&
				(nextProps.preferences === this.props.preferences) &&
				(nextProps.icons === this.props.icons) &&
				(nextState.selected === this.state.selected)
		);
	}

	componentDidMount() {
		this.getIconPath('audio-volume-muted');
	}

	componentDidUpdate() {
		forEach(pai => {
			const icon = getPaiIcon(pai);
			if (icon) {
				this.getIconPath(icon);
			}
		}, flatten(map(values, [
			this.props.infos.sinks,
			this.props.infos.sources,
			this.props.infos.clients,
			this.props.infos.modules,
		])));
	}

	getIconPath(icon) {
		if (!this._requestedIcons.has(icon) && !this.props.icons[icon]) {
			this.props.getIconPath(icon, 128);
		}
		this._requestedIcons.add(icon);
	}

	onSelectNode(selected) {
		this.setState({ selected });
	}

	onCreateNode() {
	}

	onUpdateNode() {
	}

	onDeleteNode(selected) {
		const pai = dgoToPai.get(selected);

		if (selected.type === 'client') {
			this.props.killClientByIndex(selected.index);
		} else if (selected.type === 'module') {
			this.props.unloadModuleByIndex(selected.index);
		} else if (
			(selected.type === 'sink' || selected.type === 'source') &&
				pai &&
				typeof pai.moduleIndex === 'number'
		) {
			this.props.unloadModuleByIndex(pai.moduleIndex);
		}
	}

	onNodeMouseDown(event, data) {
		const pai = dgoToPai.get(data);
		if (pai && event.button === 1) {
			if (pai.type === 'sink') {
				this.props.setSinkMute(pai.index, !pai.muted);
			} else if (pai.type === 'source') {
				this.props.setSourceMute(pai.index, !pai.muted);
			}
		}
	}

	onSelectEdge(selected) {
		this.setState({ selected });
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

	onDeleteEdge(selected) {
		if (selected.type === 'sinkInput') {
			this.props.killSinkInputByIndex(selected.index);
		} else if (selected.type === 'sourceOutput') {
			this.props.killSourceOutputByIndex(selected.index);
		}
	}

	onEdgeMouseDown(event, data) {
		const pai = dgoToPai.get(data);
		if (pai && event.button === 1) {
			if (pai.type === 'sinkInput') {
				this.props.setSinkInputMuteByIndex(pai.index, !pai.muted);
			} else if (pai.type === 'sourceOutput') {
				this.props.setSourceOutputMuteByIndex(pai.index, !pai.muted);
			}
		}
	}

	render() {
		let edges = map(paoToEdge, flatten(map(values, [
			this.props.objects.sinkInputs,
			this.props.objects.sourceOutputs,
			this.props.derivations.monitorSources,
		])));

		const connectedNodeKeys = new Set();
		edges.forEach(edge => {
			connectedNodeKeys.add(edge.source);
			connectedNodeKeys.add(edge.target);
		});

		const filteredNodeKeys = new Set();

		const nodes = filter(node => {
			if ((this.props.preferences.hideDisconnectedClients && node.type === 'client') ||
				(this.props.preferences.hideDisconnectedModules && node.type === 'module') ||
				(this.props.preferences.hideDisconnectedSources && node.type === 'source') ||
				(this.props.preferences.hideDisconnectedSinks && node.type === 'sink')
			) {
				if (!connectedNodeKeys.has(node.id)) {
					return false;
				}
			}

			const pai = dgoToPai.get(node);
			if (pai) {
				if (this.props.preferences.hideMonitors &&
					pai.properties.device &&
					pai.properties.device.class === 'monitor'
				) {
					return false;
				}

				if (this.props.preferences.hidePulseaudioApps) {
					const binary = path([ 'properties', 'application', 'process', 'binary' ], pai) || '';
					const name = path([ 'properties', 'application', 'name' ], pai) || '';
					if (binary.startsWith('pavucontrol') ||
						binary.startsWith('kmix') ||
						name === 'paclient.js'
					) {
						return false;
					}
				}
			}

			filteredNodeKeys.add(node.id);
			return true;
		}, map(paoToNode, flatten(map(values, [
			this.props.objects.sinks,
			this.props.objects.sources,
			this.props.objects.clients,
			this.props.objects.modules,
		]))));

		edges = filter(edge => {
			if (this.props.preferences.hideMonitorSourceEdges && edge.type === 'monitorSource') {
				return false;
			}
			return filteredNodeKeys.has(edge.source) && filteredNodeKeys.has(edge.target);
		}, edges);

		nodes.forEach(node => {
			const pai = getPaiByTypeAndIndex(node.type, node.index)({ pulse: this.props });
			dgoToPai.set(node, pai);
		});

		edges.forEach(edge => {
			const pai = getPaiByTypeAndIndex(edge.type, edge.index)({ pulse: this.props });
			dgoToPai.set(edge, pai);
		});

		return r.div({
			id: 'graph',
			style: {},
		}, r(GraphView, {
			nodeKey: 'id',
			edgeKey: 'id',

			nodes,
			edges,

			selected: this.state.selected,

			...graphConfig,

			onSelectNode: this.onSelectNode,
			onCreateNode: this.onCreateNode,
			onUpdateNode: this.onUpdateNode,
			onDeleteNode: this.onDeleteNode,
			onNodeMouseDown: this.onNodeMouseDown,

			onSelectEdge: this.onSelectEdge,
			onCreateEdge: this.onCreateEdge,
			onSwapEdge: this.onSwapEdge,
			onDeleteEdge: this.onDeleteEdge,
			onEdgeMouseDown: this.onEdgeMouseDown,

			showGraphControls: false,

			edgeArrowSize: 64,

			layoutEngine,

			backgroundFillId: '#background-pattern',

			renderDefs,

			renderNode,
			renderNodeText: renderNodeText(this.props),

			renderEdge,
			renderEdgeText: renderEdgeText(this.props),
		}));
	}
}

module.exports = connect(
	state => ({
		objects: state.pulse.objects,
		infos: state.pulse.infos,

		derivations: {
			monitorSources: getDerivedMonitorSources(state),
		},

		icons: state.icons,

		preferences: state.preferences,
	}),
	dispatch => bindActionCreators(merge(pulseActions, iconsActions), dispatch),
)(Graph);
