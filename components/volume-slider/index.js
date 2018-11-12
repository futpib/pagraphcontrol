/* global document */

const React = require('react');

const r = require('r-dom');

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
			handlePointerDown: this.handlePointerDown.bind(this),
		});
	}

	componentDidMount() {
		this.svg.current.addEventListener('pointerdown', this.handlePointerDown);
	}

	componentWillUnmount() {
		this.svg.current.removeEventListener('pointerdown', this.handlePointerDown);
	}

	handlePointerDown(e) {
		e.preventDefault();
		e.stopPropagation();

		const originX = e.clientX - e.offsetX;

		const move = e => {
			if (this.state.draggingX !== null) {
				this.setState({
					draggingX: clamp(e.clientX - originX),
				});
			}
		};

		const up = e => {
			this.setState({
				draggingX: null,
			});

			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerup', up);

			e.preventDefault();
			e.stopPropagation();
		};

		const click = e => {
			e.preventDefault();
			e.stopPropagation();
			document.removeEventListener('click', click, true);
		};

		document.addEventListener('pointermove', move);
		document.addEventListener('pointerup', up);
		document.addEventListener('click', click, true);

		this.setState({
			draggingX: clamp(e.offsetX),
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
