/* global document */

const {
	all,
	allPass,
	bind,
	compose,
	defaultTo,
	filter,
	find,
	flatten,
	forEach,
	keys,
	map,
	max,
	merge,
	min,
	omit,
	path,
	pick,
	prop,
	reduce,
	repeat,
	sortBy,
	values,
	scan,
	range,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { HotKeys } = require('react-hotkeys');

const { PopupMenu, MenuItem } = require('@futpib/react-electron-menu');

const d = require('../../utils/d');
const memoize = require('../../utils/memoize');

const {
	pulse: pulseActions,
	icons: iconsActions,
} = require('../../actions');

const {
	getPaiByTypeAndIndex,
	getDerivedMonitorSources,

	getClientSinkInputs,
	getModuleSinkInputs,

	getClientSourceOutputs,
	getModuleSourceOutputs,

	getSinkSinkInputs,

	getDefaultSinkPai,
	getDefaultSourcePai,
} = require('../../selectors');

const {
	PA_VOLUME_NORM,
} = require('../../constants/pulse');

const { size } = require('../../constants/view');

const VolumeSlider = require('../../components/volume-slider');

const { keyMap } = require('../hot-keys');

const {
	GraphView,
} = require('./satellites-graph');

const {
	Edge,
} = require('./base');

const LayoutEngine = require('./layout-engine');

const maximum = reduce(max, -Infinity);
const clamp = (v, lo, hi) => min(hi, max(lo, v));

const leftOf = (x, xs) => {
	const i = ((xs.indexOf(x) + xs.length - 1) % xs.length);
	return xs[i];
};

const rightOf = (x, xs) => {
	const i = ((xs.indexOf(x) + 1) % xs.length);
	return xs[i];
};

const selectionObjectTypes = {
	order: [
		'source',
		'sourceOutput',
		'client|module',
		'sinkInput',
		'sink',
	],

	left(type) {
		return leftOf(type, this.order);
	},

	right(type) {
		return rightOf(type, this.order);
	},

	fromPulseType(type) {
		if (type === 'client' || type === 'module') {
			return 'client|module';
		}
		return type;
	},

	toPulsePredicate(type) {
		type = this.fromPulseType(type);
		if (type === 'client|module') {
			return o => (o.type === 'client' || o.type === 'module');
		}
		return o => o.type === type;
	},
};

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

const renderBackground = ({
	gridSize = 40960,
	onMouseDown,
}) => r.rect({
	className: 'background',
	x: -(gridSize || 0) / 4,
	y: -(gridSize || 0) / 4,
	width: gridSize,
	height: gridSize,
	fill: 'url(#background-pattern)',
	onMouseDown,
});

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
				maximum(volumes),
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
			const a = min(v / normVolume, baseVolume / normVolume);
			const b = min(v / normVolume, 1);
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
			maximum(volumes),
		];
	}
	return { volumes, lockChannelsTogether };
};

const VolumeControls = ({ pai, state }) => {
	const { maxVolume, volumeStep } = state.preferences;
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
			volumeStep,
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

const Icon = ({ state, name, ...props }) => {
	const src = state.icons[name];

	if (!src) {
		return r(React.Fragment);
	}

	return r.img({
		className: 'node-name-icon',
		src,
		...props,
	});
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
	}, [
		state.serverInfo.defaultSinkName === pai.name && r(React.Fragment, [
			r(Icon, {
				state,
				name: 'starred',
				title: 'Default sink',
			}),
			' ',
		]),
		r.span({
			title: pai.name,
		}, pai.description),
	]),
	!selected && r(VolumeThumbnail, { pai, state }),
	selected && r(VolumeControls, { pai, state }),
	r(DebugText, { dgo, pai, state }),
]);

const SourceText = ({ dgo, pai, state, selected }) => r.div([
	r.div({
		className: 'node-name',
	}, [
		state.serverInfo.defaultSourceName === pai.name && r(React.Fragment, [
			r(Icon, {
				state,
				name: 'starred',
				title: 'Default source',
			}),
			' ',
		]),
		r.span({
			title: pai.name,
		}, pai.description),
	]),
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

class BackgroundContextMenu extends React.PureComponent {
	render() {
		return r(PopupMenu, {
			onClose: this.props.onClose,
		}, [
			r(MenuItem, {
				label: 'Create',
			}, [
				r(MenuItem, {
					label: 'Loopback',
					onClick: this.props.onLoadModuleLoopback,
				}),

				r(MenuItem, {
					label: 'Simultaneous output',
					onClick: this.props.onLoadModuleCombineSink,
				}),

				r(MenuItem, {
					label: 'Null output',
					onClick: this.props.onLoadModuleNullSink,
				}),
			]),

			r(MenuItem, {
				label: 'Load a module...',
				onClick: this.props.onLoadModule,
			}),
		]);
	}
}

class GraphObjectContextMenu extends React.PureComponent {
	render() {
		return r(PopupMenu, {
			onClose: this.props.onClose,
		}, [
			this.props.canSetAsDefault() && r(React.Fragment, [
				r(MenuItem, {
					label: 'Set as default',
					onClick: this.props.onSetAsDefault,
				}),
				r(MenuItem.Separator),
			]),

			this.props.canDelete() && r(MenuItem, {
				label: 'Delete',
				onClick: this.props.onDelete,
			}),
		]);
	}
}

const backgroundSymbol = Symbol('graph.backgroundSymbol');

class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: null,
			moved: null,
			contexted: null,
		};

		this._requestedIcons = new Set();

		Object.assign(this, {
			onBackgroundMouseDown: this.onBackgroundMouseDown.bind(this),

			onSelectNode: this.onSelectNode.bind(this),
			onCreateNode: this.onCreateNode.bind(this),
			onUpdateNode: this.onUpdateNode.bind(this),
			onDeleteNode: this.onDeleteNode.bind(this),
			onNodeMouseDown: this.onNodeMouseDown.bind(this),

			onSelectEdge: this.onSelectEdge.bind(this),
			canCreateEdge: this.canCreateEdge.bind(this),
			onCreateEdge: this.onCreateEdge.bind(this),
			onSwapEdge: this.onSwapEdge.bind(this),
			onDeleteEdge: this.onDeleteEdge.bind(this),
			onEdgeMouseDown: this.onEdgeMouseDown.bind(this),

			onContextMenuClose: this.onContextMenuClose.bind(this),

			canContextMenuSetAsDefault: this.canContextMenuSetAsDefault.bind(this),
			onContextMenuSetAsDefault: this.onContextMenuSetAsDefault.bind(this),

			canContextMenuDelete: this.canContextMenuDelete.bind(this),
			onContextMenuDelete: this.onContextMenuDelete.bind(this),

			onLoadModuleLoopback: this.onLoadModuleLoopback.bind(this),
			onLoadModuleCombineSink: this.onLoadModuleCombineSink.bind(this),
			onLoadModuleNullSink: this.onLoadModuleNullSink.bind(this),
		});
	}

	static getDerivedStateFromProps(props, state) {
		let edges = map(paoToEdge, flatten(map(values, [
			props.objects.sinkInputs,
			props.objects.sourceOutputs,
			props.derivations.monitorSources,
		])));

		const connectedNodeKeys = new Set();
		edges.forEach(edge => {
			if (edge.type === 'monitorSource') {
				return;
			}
			connectedNodeKeys.add(edge.source);
			connectedNodeKeys.add(edge.target);
		});

		const filteredNodeKeys = new Set();

		const nodes = filter(node => {
			if ((props.preferences.hideDisconnectedClients && node.type === 'client') ||
				(props.preferences.hideDisconnectedModules && node.type === 'module') ||
				(props.preferences.hideDisconnectedSources && node.type === 'source') ||
				(props.preferences.hideDisconnectedSinks && node.type === 'sink')
			) {
				if (!connectedNodeKeys.has(node.id)) {
					return false;
				}
			}

			const pai = dgoToPai.get(node);
			if (pai) {
				if (props.preferences.hideMonitors &&
					pai.properties.device &&
					pai.properties.device.class === 'monitor'
				) {
					return false;
				}

				if (props.preferences.hidePulseaudioApps) {
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
			props.objects.sinks,
			props.objects.sources,
			props.objects.clients,
			props.objects.modules,
		]))));

		edges = filter(edge => {
			if (props.preferences.hideMonitorSourceEdges && edge.type === 'monitorSource') {
				return false;
			}
			return filteredNodeKeys.has(edge.source) && filteredNodeKeys.has(edge.target);
		}, edges);

		nodes.forEach(node => {
			const pai = getPaiByTypeAndIndex(node.type, node.index)({ pulse: props });
			dgoToPai.set(node, pai);
		});

		edges.forEach(edge => {
			const pai = getPaiByTypeAndIndex(edge.type, edge.index)({ pulse: props });
			dgoToPai.set(edge, pai);
		});

		let { selected, moved, contexted } = state;

		if (contexted && contexted !== backgroundSymbol && selected !== contexted) {
			contexted = null;
		}

		if (selected) {
			selected = find(x => x.id === selected.id, nodes) ||
				find(x => x.id === selected.id, edges);
		}

		if (moved) {
			moved = find(x => x.id === moved.id, nodes) ||
				find(x => x.id === moved.id, edges);
		}

		if (contexted && contexted !== backgroundSymbol) {
			contexted = find(x => x.id === contexted.id, nodes) ||
				find(x => x.id === contexted.id, edges);
		}

		return {
			nodes,
			edges,

			selected,
			moved,
			contexted,
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !(
			(nextProps.serverInfo === this.props.serverInfo) &&
				(nextProps.objects === this.props.objects) &&
				(nextProps.infos === this.props.infos) &&
				(nextProps.preferences === this.props.preferences) &&
				(nextProps.icons === this.props.icons) &&
				(nextState.selected === this.state.selected) &&
				(nextState.contexted === this.state.contexted) &&
				(nextState.moved === this.state.moved)
		);
	}

	componentDidMount() {
		this.getIconPath('starred');

		this.graphViewElement = document.querySelector('#graph .view-wrapper');
		this.graphViewElement.setAttribute('tabindex', '-1');
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

	onBackgroundMouseDown(event) {
		if (event.button === 1) {
			this.toggleAllMute(this.props.infos.sinks);
		} else if (event.button === 2) {
			this.setState({
				contexted: backgroundSymbol,
			});
		}
	}

	onSelectNode(selected) {
		this.setState({ selected });
	}

	onCreateNode() {
	}

	onUpdateNode() {
	}

	onDeleteNode(selected) {
		this.onDelete(selected);
	}

	onNodeMouseDown(event, data) {
		const pai = dgoToPai.get(data);
		if (pai && event.button === 1) {
			if (pai.type === 'sink' ||
				pai.type === 'source' ||
				pai.type === 'client' ||
				pai.type === 'module'
			) {
				this.toggleMute(pai);
			}
		} else if (pai && event.button === 2) {
			this.setState({
				selected: data,
				contexted: data,
			});
		}
	}

	onSelectEdge(selected) {
		this.setState({ selected });
	}

	canCreateEdge(source, target) {
		if (!target) {
			return true;
		}

		if (source.type === 'source' && target.type === 'sink') {
			return true;
		}

		return false;
	}

	onCreateEdge(source, target) {
		const sourcePai = dgoToPai.get(source);
		const targetPai = dgoToPai.get(target);
		if (sourcePai && targetPai &&
			source.type === 'source' && target.type === 'sink'
		) {
			this.props.loadModule('module-loopback', `source=${sourcePai.name} sink=${targetPai.name}`);
		} else {
			this.forceUpdate();
		}
	}

	onSwapEdge(sourceNode, targetNode, edge) {
		if (edge.type === 'sinkInput') {
			this.props.moveSinkInput(edge.index, targetNode.index);
		} else if (edge.type === 'sourceOutput') {
			this.props.moveSourceOutput(edge.index, targetNode.index);
		}
	}

	onDeleteEdge(selected) {
		this.onDelete(selected);
	}

	onEdgeMouseDown(event, data) {
		const pai = dgoToPai.get(data);
		if (pai && event.button === 1) {
			if (pai.type === 'sinkInput' ||
				pai.type === 'sourceOutput'
			) {
				this.toggleMute(pai);
			}
		} else if (pai && event.button === 2) {
			this.setState({
				selected: data,
				contexted: data,
			});
		}
	}

	toggleAllMute(pais) {
		pais = values(pais);
		const allMuted = all(prop('muted'), pais);
		pais.forEach(pai => this.toggleMute(pai, !allMuted));
	}

	toggleMute(pai, muted = !pai.muted, sourceBiased = false) {
		if (pai.muted === muted) {
			return;
		}

		if (pai.type === 'sinkInput') {
			this.props.setSinkInputMuteByIndex(pai.index, muted);
		} else if (pai.type === 'sourceOutput') {
			this.props.setSourceOutputMuteByIndex(pai.index, muted);
		} else if (pai.type === 'sink') {
			if (sourceBiased) {
				const sinkInputs = getSinkSinkInputs(pai)({ pulse: this.props });
				this.toggleAllMute(sinkInputs);
			} else {
				this.props.setSinkMute(pai.index, muted);
			}
		} else if (pai.type === 'source') {
			this.props.setSourceMute(pai.index, muted);
		} else if (pai.type === 'client') {
			if (sourceBiased) {
				const sourceOutputs = getClientSourceOutputs(pai)({ pulse: this.props });
				this.toggleAllMute(sourceOutputs);
			} else {
				const sinkInputs = getClientSinkInputs(pai)({ pulse: this.props });
				this.toggleAllMute(sinkInputs);
			}
		} else if (pai.type === 'module') {
			if (sourceBiased) {
				const sourceOutputs = getModuleSourceOutputs(pai)({ pulse: this.props });
				this.toggleAllMute(sourceOutputs);
			} else {
				const sinkInputs = getModuleSinkInputs(pai)({ pulse: this.props });
				this.toggleAllMute(sinkInputs);
			}
		}
	}

	onDelete(selected) {
		const pai = dgoToPai.get(selected);

		if (selected.type === 'client') {
			this.props.killClientByIndex(selected.index);
		} else if (selected.type === 'module') {
			this.props.unloadModuleByIndex(selected.index);
		} else if (selected.type === 'sinkInput') {
			this.props.killSinkInputByIndex(selected.index);
		} else if (selected.type === 'sourceOutput') {
			this.props.killSourceOutputByIndex(selected.index);
		} else if (
			(selected.type === 'sink' || selected.type === 'source') &&
				pai &&
				pai.moduleIndex >= 0
		) {
			this.props.unloadModuleByIndex(pai.moduleIndex);
		}
	}

	canContextMenuDelete() {
		return this.state.contexted !== backgroundSymbol;
	}

	onContextMenuDelete() {
		this.onDelete(this.state.contexted);
	}

	onContextMenuClose() {
		this.setState({
			contexted: null,
		});
	}

	canContextMenuSetAsDefault() {
		const { contexted } = this.state;
		const pai = dgoToPai.get(contexted);

		if (pai && pai.type === 'sink' && pai.name !== this.props.serverInfo.defaultSinkName) {
			return true;
		}

		if (pai && pai.type === 'source' && pai.name !== this.props.serverInfo.defaultSourceName) {
			return true;
		}

		return false;
	}

	setAsDefault(data) {
		const pai = dgoToPai.get(data);

		if (pai.type === 'sink') {
			this.props.setDefaultSinkByName(pai.name);
		}

		if (pai.type === 'source') {
			this.props.setDefaultSourceByName(pai.name);
		}
	}

	onContextMenuSetAsDefault() {
		this.setAsDefault(this.state.contexted);
	}

	hotKeySetAsDefault() {
		this.setAsDefault(this.state.selected);
	}

	focus() {
		this.graphViewElement.focus();
	}

	hotKeyEscape() {
		const { moved } = this.state;

		if (moved) {
			this.setState({
				selected: moved,
				moved: null,
			});
			return;
		}

		this.setState({
			selected: null,
		});
	}

	hotKeyMute({ shiftKey: sourceBiased, ctrlKey: all }) {
		if (!this.state.selected) {
			if (sourceBiased) {
				if (all) {
					this.toggleAllMute(this.props.infos.sources);
				} else {
					const defaultSource = getDefaultSourcePai({ pulse: this.props });
					this.toggleMute(defaultSource);
				}
			} else {
				if (all) { // eslint-disable-line no-lonely-if
					this.toggleAllMute(this.props.infos.sinks);
				} else {
					const defaultSink = getDefaultSinkPai({ pulse: this.props });
					this.toggleMute(defaultSink);
				}
			}
			return;
		}

		const pai = dgoToPai.get(this.state.selected);

		if (!pai) {
			return;
		}

		this.toggleMute(pai, undefined, sourceBiased);
	}

	_volume(pai, direction) {
		const { lockChannelsTogether, maxVolume, volumeStep } = this.props.preferences;

		const d = direction === 'up' ? 1 : -1;

		let newVolumes = map(
			v => clamp(v + (d * (volumeStep * PA_VOLUME_NORM)), 0, maxVolume * PA_VOLUME_NORM),
			pai.channelVolumes,
		);

		if (lockChannelsTogether) {
			const max = maximum(newVolumes);
			newVolumes = map(() => max, newVolumes);
		}

		if (pai.type === 'sink') {
			this.props.setSinkVolumes(pai.index, newVolumes);
		} else if (pai.type === 'source') {
			this.props.setSourceVolumes(pai.index, newVolumes);
		} else if (pai.type === 'sinkInput') {
			this.props.setSinkInputVolumes(pai.index, newVolumes);
		} else if (pai.type === 'sourceOutput') {
			this.props.setSourceOutputVolumes(pai.index, newVolumes);
		}
	}

	_volumeAll(pais, direction) {
		forEach(pai => this._volume(pai, direction), values(pais));
	}

	_hotKeyVolume(direction) {
		let pai;

		if (this.state.selected) {
			pai = dgoToPai.get(this.state.selected);
		} else {
			pai = getDefaultSinkPai({ pulse: this.props });
		}

		if (!pai) {
			return;
		}

		if (pai.type === 'client') {
			const sinkInputs = getClientSinkInputs(pai)({ pulse: this.props });
			this._volumeAll(sinkInputs, direction);
			return;
		}
		if (pai.type === 'module') {
			const sinkInputs = getModuleSinkInputs(pai)({ pulse: this.props });
			this._volumeAll(sinkInputs, direction);
			return;
		}

		if (![ 'sink', 'source', 'sinkInput', 'sourceOutput' ].includes(pai.type)) {
			return;
		}

		this._volume(pai, direction);
	}

	hotKeyVolumeDown() {
		this._hotKeyVolume('down');
	}

	hotKeyVolumeUp() {
		this._hotKeyVolume('up');
	}

	_findNextObjectForSelection(object, direction) {
		const { type } = object || { type: 'client' };
		const predicate = selectionObjectTypes.toPulsePredicate(type);
		const candidates = compose(
			sortBy(prop('index')),
			filter(predicate),
		)(this.state.nodes.concat(this.state.edges));
		return (direction === 'up' ? leftOf : rightOf)(object, candidates);
	}

	hotKeyFocusDown() {
		if (this._hotKeyMovePosition('down')) {
			return;
		}

		const selected = this._findNextObjectForSelection(this.state.selected, 'down');
		this.setState({ selected });
	}

	hotKeyFocusUp() {
		if (this._hotKeyMovePosition('up')) {
			return;
		}

		const selected = this._findNextObjectForSelection(this.state.selected, 'up');
		this.setState({ selected });
	}

	_findAnyObjectForSelection(types, isBest) {
		let node = null;
		for (const type of types) {
			const predicate = selectionObjectTypes.toPulsePredicate(type);
			node =
				(isBest && find(allPass([ predicate, isBest ]), this.state.nodes)) ||
				(isBest && find(allPass([ predicate, isBest ]), this.state.edges)) ||
				find(predicate, this.state.nodes) ||
				find(predicate, this.state.edges);
			if (node) {
				break;
			}
		}
		return node;
	}

	_focusHorizontal(direction) {
		const { selected } = this.state;

		if (!selected) {
			this.setState({
				selected: this._findAnyObjectForSelection(direction === 'left' ? [
					'sourceOutput',
					'source',
				] : [
					'sinkInput',
					'sink',
				]),
			});
			return;
		}

		const next = t => selectionObjectTypes[direction](t);
		const types = scan(
			next,
			next(selectionObjectTypes.fromPulseType(selected.type)),
			range(0, 3)
		);

		const bestSelectionPredicate = x => null ||
			x.source === selected.id ||
			x.target === selected.id ||
			selected.source === x.id ||
			selected.target === x.id;

		this.setState({
			selected: this._findAnyObjectForSelection(types, bestSelectionPredicate),
		});
	}

	hotKeyFocusLeft() {
		if (this._hotKeyMovePosition('left')) {
			return;
		}

		this._focusHorizontal('left');
	}

	hotKeyFocusRight() {
		if (this._hotKeyMovePosition('right')) {
			return;
		}

		this._focusHorizontal('right');
	}

	_hotKeyMovePosition(direction) {
		const { selected, moved } = this.state;

		if (!selected ||
			selected !== moved ||
			![ 'sink', 'source', 'client', 'module' ].includes(moved.type)
		) {
			return false;
		}

		const x = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
		const y = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;

		moved.x += x * (size + (size / 12));
		moved.y += y * (size + (size / 12));

		this.forceUpdate();

		return true;
	}

	hotKeyMove() {
		let { selected, moved } = this.state;

		if (!selected) {
			return;
		}

		if (moved) {
			this.onSwapEdge(null, selected, moved);
			this.setState({
				selected: moved,
				moved: null,
			});
			return;
		}

		moved = selected;

		if (moved.type === 'sinkInput') {
			selected = find(
				node => node.id !== moved.target && node.type === 'sink',
				this.state.nodes,
			);
		} else if (moved.type === 'sourceOutput') {
			selected = find(
				node => node.id !== moved.target && node.type === 'source',
				this.state.nodes,
			);
		}

		this.setState({
			selected,
			moved,
		});
	}

	hotKeyAdd() {
		this.props.openNewGraphObjectModal();
	}

	onLoadModuleLoopback() {
		this.props.loadModule('module-loopback', '');
	}

	onLoadModuleCombineSink() {
		this.props.loadModule('module-combine-sink', '');
	}

	onLoadModuleNullSink() {
		this.props.loadModule('module-null-sink', '');
	}

	render() {
		const { nodes, edges } = this.state;

		return r(HotKeys, {
			handlers: map(f => bind(f, this), pick(keys(keyMap), this)),
		}, r.div({
			id: 'graph',
		}, [
			r(GraphView, {
				nodeKey: 'id',
				edgeKey: 'id',

				nodes,
				edges,

				selected: this.state.selected,
				moved: this.state.moved,

				nodeTypes: {},
				nodeSubtypes: {},
				edgeTypes: {},

				onBackgroundMouseDown: this.onBackgroundMouseDown,

				onSelectNode: this.onSelectNode,
				onCreateNode: this.onCreateNode,
				onUpdateNode: this.onUpdateNode,
				onDeleteNode: this.onDeleteNode,
				onNodeMouseDown: this.onNodeMouseDown,

				onSelectEdge: this.onSelectEdge,
				canCreateEdge: this.canCreateEdge,
				onCreateEdge: this.onCreateEdge,
				onSwapEdge: this.onSwapEdge,
				onDeleteEdge: this.onDeleteEdge,
				onEdgeMouseDown: this.onEdgeMouseDown,

				showGraphControls: false,

				edgeArrowSize: 64,

				layoutEngine,

				renderBackground,

				renderDefs,

				renderNode,
				renderNodeText: renderNodeText(this.props),

				renderEdge,
				renderEdgeText: renderEdgeText(this.props),
			}),

			this.state.contexted && (
				this.state.contexted === backgroundSymbol ?
					r(BackgroundContextMenu, {
						onClose: this.onContextMenuClose,

						onLoadModule: this.props.openLoadModuleModal,

						onLoadModuleLoopback: this.onLoadModuleLoopback,
						onLoadModuleCombineSink: this.onLoadModuleCombineSink,
						onLoadModuleNullSink: this.onLoadModuleNullSink,
					}) :
					r(GraphObjectContextMenu, {
						onClose: this.onContextMenuClose,

						canSetAsDefault: this.canContextMenuSetAsDefault,
						onSetAsDefault: this.onContextMenuSetAsDefault,

						canDelete: this.canContextMenuDelete,
						onDelete: this.onContextMenuDelete,
					})
			),
		]));
	}
}

module.exports = connect(
	state => ({
		serverInfo: state.pulse.serverInfo,

		objects: state.pulse.objects,
		infos: state.pulse.infos,

		derivations: {
			monitorSources: getDerivedMonitorSources(state),
		},

		icons: state.icons,

		preferences: state.preferences,
	}),
	dispatch => bindActionCreators(omit([
		'serverInfo',
		'unloadModuleByIndex',
	], merge(pulseActions, iconsActions)), dispatch),
	null,
	{ withRef: true },
)(Graph);
