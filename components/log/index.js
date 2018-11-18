
const {
	compose,
	map,
	filter,
	differenceWith,
	takeLast,
} = require('ramda');

const React = require('react');

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const r = require('r-dom');

const { connect } = require('react-redux');

const weakmapId = require('../../utils/weakmap-id');

class Log extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			removedErrors: [],
		};
	}

	removeError(error) {
		this.setState({
			removedErrors: takeLast(10, this.state.removedErrors.concat(weakmapId(error))),
		});
	}

	shouldShowError(error) {
		return !this.state.removedErrors.includes(weakmapId(error));
	}

	componentDidUpdate(prevProps) {
		const newErrors = differenceWith((a, b) => a === b, this.props.log.errors, prevProps.log.errors);
		newErrors.forEach(error => setTimeout(() => {
			this.removeError(error);
		}, this.props.itemLifetime));
	}

	render() {
		return r.div({
			className: 'log',
		}, r(ReactCSSTransitionGroup, {
			transitionName: 'log-item-transition',
			transitionEnterTimeout: 300,
			transitionLeaveTimeout: 2000,
		}, compose(
			map(e => r.div({
				key: weakmapId(e),
				className: 'log-item-error',
			}, `${e.name}: ${e.message}`)),
			filter(e => this.shouldShowError(e)),
		)(this.props.log.errors)));
	}
}

Log.defaultProps = {
	itemLifetime: 5000,
};

module.exports = connect(
	state => ({
		log: state.pulse.log,
	}),
)(Log);
