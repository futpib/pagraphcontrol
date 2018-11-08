
const {
	map,
	values,
	flatten,
	merge,
	indexBy,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');

const d3 = require('d3');

const key = pao => `${pao.type}-${pao.index}`;

class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.container = React.createRef();

		this.connectionToPao = new WeakMap();
	}

	componentDidMount() {
		this.svg = d3
			.select(this.container.current)
			.append('svg');
	}

	_connectSinkInput(sinkInput) {
		const connection = this.jsPlumb.connect({
			source: `client-${sinkInput.info.clientIndex}`,
			target: `sink-${sinkInput.info.sinkIndex}`,
			anchor: 'Continuous',
			overlays: [ [ 'Arrow', { location: -1 } ] ],
		});
		this.connectionToPao.set(connection, sinkInput);
	}

	_connectSourceOutput(sourceOutput) {
		const connection = this.jsPlumb.connect({
			source: `source-${sourceOutput.info.sourceIndex}`,
			target: `client-${sourceOutput.info.clientIndex}`,
			anchor: 'Continuous',
			overlays: [ [ 'Arrow', { location: -1 } ] ],
		});
		this.connectionToPao.set(connection, sourceOutput);
	}

	_connectByType(pao) {
		if (pao.type === 'sinkInput') {
			this._connectSinkInput(pao);
		} else {
			this._connectSourceOutput(pao);
		}
	}

	_handleResize() {
		this.svg
			.attr('width', this.container.current.clientWidth)
			.attr('height', this.container.current.clientHeight);
	}

	componentDidUpdate() {
		this._handleResizeBound = this._handleResize.bind(this);
		this.container.current.ownerDocument.defaultView.addEventListener('resize', this._handleResizeBound);

		/*
		this.jsPlumb.batch(() => {
			const propsPaos = merge(
				indexBy(key, values(this.props.sinkInputs)),
				indexBy(key, values(this.props.sourceOutputs)),
			);
			this.jsPlumb.getAllConnections().forEach(connection => {
				const connectionPao = this.connectionToPao.get(connection);
				const k = key(connectionPao);
				const propsPao = propsPaos[k];
				if (!propsPao) {
					this.jsPlumb.deleteConnection(connection);
				} else if (propsPao === connectionPao) {
					// Noop
				} else if (propsPao.info) {
					this.jsPlumb.deleteConnection(connection);
					this._connectByType(propsPao);
				}
				delete propsPaos[k];
			});
			values(propsPaos).forEach(propsPao => {
				if (propsPao.info) {
					this._connectByType(propsPao);
				}
			});
		});
		*/

		/*
		flatten(
			map(paos => map(pao => r.div({
				id: key(pao),
				key: key(pao),
				className: 'jtk-node',
				style: {
					border: '1px solid black',
					userSelect: 'none',
					cursor: 'default',
				},
				ref: el => {
					if (el) {
						this.jsPlumb.draggable(el, {});
						/// this.jsPlumb.addEndpoint();
					}
				},
			}, [
				key(pao),
			]), values(paos)), [
				this.props.sinks,
				this.props.sources,
				this.props.clients,
			]),
		)
		*/
	}

	componentWillUnmount() {
		this.container.current.ownerDocument.defaultView.removeEventListener('resize', this._handleResizeBound);
	}

	render() {
		return r.div({
			ref: this.container,
			style: {
				position: 'absolute',
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
		});
	}
}

module.exports = connect(
	state => state.pulse,
)(Graph);
