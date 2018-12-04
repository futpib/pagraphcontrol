/* global window, performance */

const React = require('react');

const r = require('r-dom');

const PIXI = require('pixi.js');

const theme = require('../../utils/theme');

PIXI.ticker.shared.autoStart = false;

class Peaks extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.containerRef = React.createRef();

		this.handleTick = this.handleTick.bind(this);
		this.handlePeak = this.handlePeak.bind(this);
		this.handleResize = this.handleResize.bind(this);
		this.handleAnimationFrame = this.handleAnimationFrame.bind(this);
	}

	componentDidMount() {
		this.app = new PIXI.Application(window.innerWidth, window.innerHeight, {
			autoStart: false,
			transparent: true,
		});
		this.app.ticker.add(this.handleTick);

		this.trailTexture = PIXI.Texture.fromImage('assets/trail.png');
		this.points = [
			new PIXI.Point(0, 0),
			new PIXI.Point(100, 100),
		];
		this.rope = new PIXI.mesh.Rope(this.trailTexture, this.points);
		this.rope.blendmode = PIXI.BLEND_MODES.ADD;
		this.app.stage.addChild(this.rope);

		this.ropes = {};

		this.containerRef.current.appendChild(this.app.view);

		this.peaks = {};
		this.props.peaks.on('peak', this.handlePeak);

		this.graph = window.document.querySelector('#graph .graph');
		this.view = this.graph.querySelector('.view');

		window.addEventListener('resize', this.handleResize);

		this.lastAnimationFrameTimeStamp = 0;
		this.requestAnimationFrame();
	}

	componentWillUnmount() {
		this.app.destroy();

		this.props.peaks.off('peak', this.handlePeak);

		window.removeEventListener('resize', this.handleResize);

		window.cancelAnimationFrame(this.animationFrameRequest);
	}

	requestAnimationFrame() {
		this.animationFrameRequest = window.requestAnimationFrame(this.handleAnimationFrame);
	}

	get targetDelay() {
		if (window.document.hidden) {
			return 2 * 1000;
		}
		if (this.props.accommodateGraphAnimation) {
			return 1000 / 70;
		}
		return 1000 / 25;
	}

	handleAnimationFrame(timeStamp) {
		if (timeStamp < this.lastAnimationFrameTimeStamp + this.targetDelay) {
			this.requestAnimationFrame();
			return;
		}

		this.lastAnimationFrameTimeStamp = timeStamp;

		this.app.ticker.update(timeStamp);

		this.requestAnimationFrame();
	}

	handleTick() {
		const matrix = this.view.getScreenCTM();
		const point = this.graph.createSVGPoint();

		const p = ({ x = 0, y = 0 }) => {
			point.x = x;
			point.y = y;

			const p = point.matrixTransform(matrix);

			return new PIXI.Point(p.x, p.y);
		};

		const ropes = this.props.edges
			.filter(edge => {
				return edge.type === 'sinkInput' || edge.type === 'sourceOutput';
			})
			.map(edge => {
				const source = this.props.nodes.find(n => n.id === edge.source);
				const target = this.props.nodes.find(n => n.id === edge.target);

				const peak = this.peaks[target.target] || this.peaks[target.edge];

				const points = [
					p(target),
					p(source),
				];
				const rope = new PIXI.mesh.Rope(this.trailTexture, points);
				rope.blendmode = PIXI.BLEND_MODES.ADD;
				rope.alpha = peak === undefined ? 0 : peak ** (1 / 3);
				rope.tint = parseInt(theme.colors.themeSelectedBgColor.replace(/#/g, ''), 16);

				return rope;
			});

		this.app.stage.removeChildren();
		ropes.forEach(r => this.app.stage.addChild(r));
	}

	handlePeak(type, id, peak) {
		this.peaks[`${type}-${id}`] = peak;
	}

	handleResize() {
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		this.app.ticker.update(performance.now());
	}

	render() {
		return r.div({
			className: 'peaks',
			ref: this.containerRef,
		});
	}
}

module.exports = Peaks;
