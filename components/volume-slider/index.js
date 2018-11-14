/* global window */

const React = require('react');

const r = require('r-dom');

const d3 = require('d3');

const { devicePixelRatio } = window;

const width = 300;
const height = 18;

const clamp = x => Math.min(
	width - (height / 2),
	Math.max(
		(height / 2),
		x,
	),
);

const vol2pix = (v, maxVolume) => (v / maxVolume) * (width - height);
const pix2vol = (x, maxVolume) => (x * maxVolume) / (width - height);

module.exports = class VolumeSlider extends React.Component {
	constructor(props) {
		super(props);

		this.svg = React.createRef();

		this.state = {
			draggingX: null,
		};

		Object.assign(this, {
			handleDragStart: this.handleDragStart.bind(this),
			handleDrag: this.handleDrag.bind(this),
			handleDragEnd: this.handleDragEnd.bind(this),
		});
	}

	componentDidMount() {
		const dragFunction = d3
			.drag()
			.on('start', this.handleDragStart)
			.on('drag', this.handleDrag)
			.on('end', this.handleDragEnd);

		this._selection = d3
			.select(this.svg.current.querySelector('.volume-slider-handle'))
			.call(dragFunction);
	}

	componentWillUnmount() {
		this._selection.on('.node', null);
	}

	handleDragStart() {
		this._startX = d3.event.x;
		this._offsetX = d3.event.sourceEvent.offsetX || (this._lastRenderedX / devicePixelRatio);
		this.setState({
			draggingX: clamp(this._offsetX * devicePixelRatio),
		});
	}

	handleDrag() {
		if (this.state.draggingX !== null) {
			const draggingX = ((d3.event.x - this._startX) + this._offsetX) * devicePixelRatio;
			this.setState({
				draggingX: clamp(draggingX),
			});
		}
	}

	handleDragEnd() {
		this.setState({
			draggingX: null,
		});
	}

	componentDidUpdate() {
		const { draggingX } = this.state;
		const { maxVolume } = this.props;

		if (draggingX === null) {
			return;
		}

		const targetValue = Math.floor(pix2vol(draggingX - (height / 2), maxVolume));

		this.props.onChange(targetValue);
	}

	render() {
		const {
			muted,
			baseVolume,
			normVolume,
			maxVolume,
			value,
		} = this.props;

		const {
			draggingX,
		} = this.state;

		const x = draggingX === null ?
			((height / 2) + vol2pix(value, maxVolume)) :
			draggingX;

		this._lastRenderedX = x;

		const baseX = (height / 2) + vol2pix(baseVolume, maxVolume);
		const normX = (height / 2) + vol2pix(normVolume, maxVolume);

		return r.svg({
			ref: this.svg,
			classSet: {
				'volume-slider': true,
				'volume-slider-muted': muted,
			},
			width,
			height,
		}, [
			baseVolume && r.line({
				className: 'volume-slider-base-mark',
				x1: baseX,
				x2: baseX,
				y1: 0,
				y2: height,
			}),

			r.line({
				className: 'volume-slider-norm-mark',
				x1: normX,
				x2: normX,
				y1: 0,
				y2: height,
			}),

			r.line({
				className: 'volume-slider-bg',
				x1: height / 2,
				x2: width - (height / 2),
				y1: height / 2,
				y2: height / 2,
			}),

			r.line({
				className: 'volume-slider-fill',
				x1: height / 2,
				x2: x,
				y1: height / 2,
				y2: height / 2,
			}),

			r.circle({
				className: 'volume-slider-handle',
				cx: x,
				cy: height / 2,
				r: (height - 2) / 2,
			}),
		]);
	}
};
