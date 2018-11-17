
const {
	values,
	map,
	path,
	sortBy,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { pulse: pulseActions } = require('../../actions');

const Button = require('../button');
const Label = require('../label');
const Select = require('../select');

class Cards extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false,
		};
	}

	toggle() {
		this.setState({ open: !this.state.open });
	}

	close() {
		this.setState({ open: false });
	}

	isOpen() {
		return this.state.open;
	}

	render() {
		const { open } = this.state;
		const toggle = this.toggle.bind(this);

		return r.div({
			classSet: {
				panel: true,
				cards: true,
				open,
			},
		}, open ? [
			r.div([
				r(Button, {
					style: { width: '100%' },
					autoFocus: true,
					onClick: toggle,
				}, 'Close'),
			]),

			r.hr(),

			...map(card => r(Label, {
				title: card.name,
			}, [
				r(Label, [
					path([ 'properties', 'device', 'description' ], card),
				]),

				r(Select, {
					options: sortBy(p => -p.priority, card.profiles),
					optionValue: p => p.name,
					optionText: p => [
						p.description,
						!p.available && '(unavailable)',
					]
						.filter(Boolean)
						.join(' '),
					value: card.activeProfileName,
					onChange: e => {
						this.props.actions.setCardProfile(card.index, e.target.value);
					},
				}),
			]), values(this.props.cards)),

			this.props.preferences.showDebugInfo && r.pre({
				style: {
					fontSize: '0.75em',
				},
			}, [
				JSON.stringify(this.props, null, 2),
			]),
		] : [
			r(Button, {
				autoFocus: true,
				onClick: toggle,
			}, 'Cards'),
		]);
	}
}

module.exports = connect(
	state => ({
		cards: state.pulse.infos.cards,
		preferences: state.preferences,
	}),
	dispatch => ({
		actions: bindActionCreators(pulseActions, dispatch),
	}),
	null,
	{ withRef: true },
)(Cards);
