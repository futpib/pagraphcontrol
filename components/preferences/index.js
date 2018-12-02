
const {
	pick,
	defaultTo,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const { preferences: preferencesActions } = require('../../actions');

const Button = require('../button');
const Checkbox = require('../checkbox');
const NumberInput = require('../number-input');

const VolumeRatioInput = ({ pref, fallback, preferences, actions, children }) => r(NumberInput, {
	type: 'number',
	value: defaultTo(fallback, Math.round(preferences[pref] * 100)),
	onChange: e => {
		const v = defaultTo(fallback, Math.max(0, parseInt(e.target.value, 10)));
		actions.set({ [pref]: v / 100 });
	},
}, children);

class Preferences extends React.Component {
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
				preferences: true,
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

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideDisconnectedClients,
					onChange: () => this.props.actions.toggle('hideDisconnectedClients'),
				}, 'Hide disconnected clients'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideDisconnectedModules,
					onChange: () => this.props.actions.toggle('hideDisconnectedModules'),
				}, 'Hide disconnected modules'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideDisconnectedSources,
					onChange: () => this.props.actions.toggle('hideDisconnectedSources'),
				}, 'Hide disconnected source'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideDisconnectedSinks,
					onChange: () => this.props.actions.toggle('hideDisconnectedSinks'),
				}, 'Hide disconnected sinks'),
			]),

			r.hr(),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideMonitorSourceEdges,
					onChange: () => this.props.actions.toggle('hideMonitorSourceEdges'),
				}, 'Hide monitor source edges'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideMonitors,
					onChange: () => this.props.actions.toggle('hideMonitors'),
				}, 'Hide monitors'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hidePulseaudioApps,
					onChange: () => this.props.actions.toggle('hidePulseaudioApps'),
					title: 'Including volume control apps and some internal machinery',
				}, 'Hide pulseaudio applications'),
			]),

			r.hr(),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideVolumeThumbnails,
					onChange: () => this.props.actions.toggle('hideVolumeThumbnails'),
				}, 'Hide volume thumbnails'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.lockChannelsTogether,
					onChange: () => this.props.actions.toggle('lockChannelsTogether'),
				}, 'Lock channels together'),
			]),

			r.div([
				r(VolumeRatioInput, {
					pref: 'maxVolume',
					fallback: 150,
					...this.props,
				}, 'Maximum volume: '),
			]),

			r.div([
				r(VolumeRatioInput, {
					pref: 'volumeStep',
					fallback: 10,
					...this.props,
				}, 'Volume step: '),
			]),

			r.hr(),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideLiveVolumePeaks,
					onChange: () => this.props.actions.toggle('hideLiveVolumePeaks'),
				}, 'Hide live volume peaks'),
			]),

			r.hr(),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.hideOnScreenButtons,
					onChange: () => this.props.actions.toggle('hideOnScreenButtons'),
				}, 'Hide on-screen buttons'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.doNotAskForConfirmations,
					onChange: () => this.props.actions.toggle('doNotAskForConfirmations'),
				}, 'Do not ask for confirmations'),
			]),

			r.div([
				r(Checkbox, {
					checked: this.props.preferences.showDebugInfo,
					onChange: () => this.props.actions.toggle('showDebugInfo'),
				}, 'Show debug info'),
			]),

			r.hr(),

			r.div([
				r(Button, {
					style: { width: '100%' },
					onClick: this.props.actions.resetDefaults,
				}, 'Reset to defaults'),
			]),
		] : [
			!this.props.preferences.hideOnScreenButtons && r(Button, {
				autoFocus: true,
				onClick: toggle,
			}, 'Preferences'),
		]);
	}
}

module.exports = connect(
	state => pick([ 'preferences' ], state),
	dispatch => ({
		actions: bindActionCreators(preferencesActions, dispatch),
	}),
	null,
	{ withRef: true },
)(Preferences);
