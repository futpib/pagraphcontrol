
const { EventEmitter } = require('events');

const { spawn } = require('child_process');

const { connect } = require('react-redux');

const React = require('react');

const r = require('r-dom');

const { primaryPulseServer } = require('../../reducers/pulse');

const PA_SUBSCRIPTION_EVENT_SOURCE = 0x0001;
const PA_SUBSCRIPTION_EVENT_SINK_INPUT = 0x0002;

const VolumePeaksContext = React.createContext(null);

function spawnProcess({ onPeak, onExit }) {
	const process = spawn('papeaks', [
		'--output',
		'binary',
	], {
		shell: true,
		stdio: [ 'ignore', 'pipe', 'inherit' ],
	});

	let leftover = null;
	const handleData = data => {
		if (leftover) {
			data = Buffer.concat([ leftover, data ]);
		}

		let p = 0;
		while (p < data.length) {
			const left = data.length - p;
			if (left >= 12) {
				leftover = null;
			} else {
				leftover = data.slice(p);
				break;
			}

			const type = data.readInt32LE(p);
			p += 4;
			const index = data.readInt32LE(p);
			p += 4;
			const peak = data.readFloatLE(p);
			p += 4;

			const typeStr = type === PA_SUBSCRIPTION_EVENT_SOURCE
				? 'source'
				: type === PA_SUBSCRIPTION_EVENT_SINK_INPUT
					? 'sinkInput'
					: 'unexpected';
			onPeak(typeStr, index, peak);
		}
	};

	const handleExit = () => {
		process.off('data', handleData);
		process.off('exit', handleExit);
		if (onExit) {
			onExit();
		}
	};

	process.stdout.on('data', handleData);
	process.on('exit', handleExit);

	return process;
}

class VolumePeaksProvider extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.emitter = new EventEmitter();
	}

	static getDerivedStateFromProps(props) {
		const state = props.hideLiveVolumePeaks ? 'closed' : props.state;
		return { state };
	}

	componentDidMount() {
		if (this.state.state === 'ready') {
			this._spawnProcess();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.state !== 'ready' && prevState.state === 'ready') {
			this._killProcess();
		} else if (this.state.state === 'ready' && prevState.state !== 'ready') {
			this._spawnProcess();
		}
	}

	componentWillUnmount() {
		this._killProcess();
		this.emitter.removeAllListeners();
	}

	_spawnProcess() {
		this.process = spawnProcess({
			onPeak: (type, index, peak) => {
				this.emitter.emit('peak', type, index, peak);
			},
		});
	}

	_killProcess() {
		if (this.process && !this.process.killed) {
			this.process.kill();
		}
	}

	render() {
		return r(VolumePeaksContext.Provider, {
			value: this.emitter,
		}, this.props.children);
	}
}

module.exports = {
	VolumePeaksProvider: connect(
		state => ({
			state: state.pulse[primaryPulseServer].state,

			hideLiveVolumePeaks: state.preferences.hideLiveVolumePeaks,
		}),
	)(VolumePeaksProvider),

	VolumePeaksConsumer: VolumePeaksContext.Consumer,
};
