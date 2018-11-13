
const {
	values,
	map,
	path,
} = require('ramda');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { withStateHandlers } = require('recompose');

const { pulse: pulseActions } = require('../../actions');

const Button = require('../button');
const Label = require('../label');
const Select = require('../select');

const Preferences = withStateHandlers(
	{
		open: false,
	},
	{
		toggle: ({ open }) => () => ({ open: !open }),
	},
)(({ open, toggle, ...props }) => r.div({
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
			options: card.profiles,
			optionValue: p => p.name,
			optionText: p => p.description,
			value: card.activeProfileName,
			onChange: e => {
				props.actions.setCardProfile(card.index, e.target.value);
			},
		}),
	]), values(props.cards)),

	props.preferences.showDebugInfo && r.pre({
		style: {
			fontSize: '0.75em',
		},
	}, [
		JSON.stringify(props, null, 2),
	]),
] : [
	r(Button, {
		autoFocus: true,
		onClick: toggle,
	}, 'Cards'),
]));

module.exports = connect(
	state => ({
		cards: state.pulse.infos.cards,
		preferences: state.preferences,
	}),
	dispatch => ({
		actions: bindActionCreators(pulseActions, dispatch),
	}),
)(Preferences);
