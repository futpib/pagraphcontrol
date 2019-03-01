
const {
	values,
	map,
	path,
	sortBy,
	filter,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { pulse: pulseActions } = require('../../actions');

const { primaryPulseServer } = require('../../reducers/pulse');

const { createGetCardSinks, createGetCardSources } = require('../../selectors');

const Button = require('../button');
const Label = require('../label');
const Select = require('../select');

const SinksOrSourcesPresenter = ({ sinksOrSources, setSinkOrSourcePort }) => map(sinkOrSource => r(Label, {
	key: sinkOrSource.index,
	title: sinkOrSource.name,
}, [
	r(Label, [
		path([ 'properties', 'device', 'description' ], sinkOrSource),
	]),

	r(Select, {
		options: sortBy(p => -p.priority, sinkOrSource.ports),
		optionValue: p => p.name,
		optionText: p => [
			p.description,
			p.availability === 'unavailable' && '(unavailable)',
		]
			.filter(Boolean)
			.join(' '),
		value: sinkOrSource.activePortName,
		onChange: e => setSinkOrSourcePort(sinkOrSource.index, e.target.value),
	}),
]), values(filter(s => s.ports.length > 0, sinksOrSources)));

const CardSinks = connect(
	(state, { cardIndex }) => ({
		kind: 'sinks',
		sinksOrSources: createGetCardSinks(cardIndex)(state),
	}),
	dispatch => ({
		setSinkOrSourcePort: (...args) => dispatch(pulseActions.setSinkPort(...args)),
	}),
)(SinksOrSourcesPresenter);

const CardSources = connect(
	(state, { cardIndex }) => ({
		kind: 'sources',
		sinksOrSources: createGetCardSources(cardIndex)(state),
	}),
	dispatch => ({
		setSinkOrSourcePort: (...args) => dispatch(pulseActions.setSourcePort(...args)),
	}),
)(SinksOrSourcesPresenter);

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
			!this.props.preferences.hideOnScreenButtons && r(React.Fragment, [
				r(Button, {
					style: { width: '100%' },
					autoFocus: true,
					onClick: toggle,
				}, 'Close'),

				r.hr(),
			]),

			...map(card => r(React.Fragment, [
				r(Label, {
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
				]),

				r(CardSinks, { cardIndex: card.index }),

				r(CardSources, { cardIndex: card.index }),

				r.hr(),
			]), values(this.props.cards)),

			this.props.preferences.showDebugInfo && r.pre({
				style: {
					fontSize: '0.75em',
				},
			}, [
				JSON.stringify(this.props.cards, null, 2),
			]),
		] : []);
	}
}

module.exports = connect(
	state => ({
		cards: state.pulse[primaryPulseServer].infos.cards,
		preferences: state.preferences,
	}),
	dispatch => ({
		actions: bindActionCreators(pulseActions, dispatch),
	}),
	null,
	{ withRef: true },
)(Cards);
