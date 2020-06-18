
const {
	compose,
	map,
	filter,
	differenceWith,
	takeLast,
} = require('ramda');

const React = require('react');

const { TransitionGroup, CSSTransition } = require('react-transition-group');

const r = require('r-dom');

const { connect } = require('react-redux');

const weakmapId = require('../../utils/weakmap-id');

const { pulse: pulseActions } = require('../../actions');

const { primaryPulseServer } = require('../../reducers/pulse');

const actionTypeText = {
	[pulseActions.ready]: 'Connected to PulseAudio',
	[pulseActions.close]: 'Disconnected from PulseAudio',
};

class Log extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			removedItems: [],
		};
	}

	removeItem(item) {
		this.setState({
			removedItems: takeLast(10, this.state.removedItems.concat(weakmapId(item))),
		});
	}

	shouldShowItem(item) {
		return !this.state.removedItems.includes(weakmapId(item));
	}

	itemText(item) {
		if (item.type === 'error') {
			return `${item.error.name}: ${item.error.message}`;
		}

		return actionTypeText[item.action] || item.action;
	}

	componentDidUpdate(previousProps) {
		const newItems = differenceWith((a, b) => a === b, this.props.log.items, previousProps.log.items);
		newItems.forEach(item => setTimeout(() => {
			this.removeItem(item);
		}, this.props.itemLifetime));
	}

	render() {
		return r.div({
			className: 'log',
		}, r(TransitionGroup, compose(
			map(item => r(CSSTransition, {
				key: weakmapId(item),
				className: 'log-item-transition',
				timeout: { enter: 300, leave: 2000 },
			}, r.div({
				classSet: {
					'log-item': true,
					'log-item-error': item.type === 'error',
					'log-item-info': item.type === 'info',
				},
			}, this.itemText(item)))),
			filter(item => this.shouldShowItem(item)),
		)(this.props.log.items)));
	}
}

Log.defaultProps = {
	itemLifetime: 5000,
};

module.exports = connect(
	state => ({
		log: state.pulse[primaryPulseServer].log,
	}),
)(Log);
