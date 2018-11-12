
const {
	pick,
	defaultTo,
} = require('ramda');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { withStateHandlers } = require('recompose');

const { preferences: preferencesActions } = require('../../actions');

const Button = require('../button');
const Checkbox = require('../checkbox');
const NumberInput = require('../number-input');

const Preferences = withStateHandlers(
	{
		open: false,
	},
	{
		toggle: ({ open }) => () => ({ open: !open }),
	},
)(({ open, toggle, ...props }) => r.div({
	classSet: {
		preferences: true,
		open,
	},
}, open ? [
	r.div([
		r(Button, {
			style: { width: '100%' },
			onClick: toggle,
		}, 'Close'),
	]),

	r.hr(),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideDisconnectedClients,
			onChange: () => props.actions.toggle('hideDisconnectedClients'),
		}, 'Hide disconnected clients'),
	]),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideDisconnectedModules,
			onChange: () => props.actions.toggle('hideDisconnectedModules'),
		}, 'Hide disconnected modules'),
	]),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideDisconnectedSource,
			onChange: () => props.actions.toggle('hideDisconnectedSource'),
		}, 'Hide disconnected source'),
	]),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideDisconnectedSinks,
			onChange: () => props.actions.toggle('hideDisconnectedSinks'),
		}, 'Hide disconnected sinks'),
	]),

	r.hr(),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideMonitors,
			onChange: () => props.actions.toggle('hideMonitors'),
		}, 'Hide monitors'),
	]),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hidePulseaudioApps,
			onChange: () => props.actions.toggle('hidePulseaudioApps'),
		}, 'Hide pulseaudio applications'),
	]),

	r.hr(),

	r.div([
		r(Checkbox, {
			checked: props.preferences.hideVolumeThumbnails,
			onChange: () => props.actions.toggle('hideVolumeThumbnails'),
		}, 'Hide volume thumbnails'),
	]),

	r.div([
		r(Checkbox, {
			checked: props.preferences.lockChannelsTogether,
			onChange: () => props.actions.toggle('lockChannelsTogether'),
		}, 'Lock channels together'),
	]),

	r.div([
		r(NumberInput, {
			type: 'number',
			value: defaultTo(150, Math.round(props.preferences.maxVolume * 100)),
			onChange: e => {
				const v = defaultTo(150, Math.max(0, parseInt(e.target.value, 10)));
				props.actions.set({ maxVolume: v / 100 });
			},
		}, 'Maximum volume: '),
	]),

	r.hr(),

	r.div([
		r(Checkbox, {
			checked: props.preferences.showDebugInfo,
			onChange: () => props.actions.toggle('showDebugInfo'),
		}, 'Show debug info'),
	]),

	r.hr(),

	r.div([
		r(Button, {
			style: { width: '100%' },
			onClick: props.actions.resetDefaults,
		}, 'Reset to defaults'),
	]),
] : [
	r(Button, {
		onClick: toggle,
	}, 'Preferences'),
]));

module.exports = connect(
	state => pick([ 'preferences' ], state),
	dispatch => ({
		actions: bindActionCreators(preferencesActions, dispatch),
	}),
)(Preferences);
