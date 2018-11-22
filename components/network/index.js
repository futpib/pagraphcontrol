
const {
	values,
	map,
	path,
	filter,
	propEq,
	sortBy,
	prop,
	merge,
	keys,
} = require('ramda');

const React = require('react');

const r = require('r-dom');

const { connect } = require('react-redux');
const { bindActionCreators } = require('redux');

const {
	pulse: pulseActions,
	preferences: preferencesActions,
} = require('../../actions');
const { formatModuleArgs } = require('../../utils/module-args');

const { getRemoteServerByAddress } = require('../../selectors');

const Button = require('../button');
const Label = require('../label');

const RemoteServer = connect(
	(state, props) => ({
		remoteServer: getRemoteServerByAddress(props.address)(state),
	}),
	dispatch => ({
		actions: bindActionCreators(merge(pulseActions, preferencesActions), dispatch),
	}),
)(({ address, remoteServer = {}, actions }) => {
	const { targetState, state } = remoteServer;
	const hostname = path([ 'serverInfo', 'hostname' ], remoteServer);

	return r.div([
		r.div({
			style: { display: 'flex', justifyContent: 'space-between' },
		}, [
			r(Label, {
				userSelect: true,
			}, [
				hostname || address,
			]),

			targetState === 'ready' ? r(Button, {
				onClick: () => {
					actions.remoteServerDisconnect(address);
				},
			}, 'Disconnect') : r(React.Fragment, [
				r(Button, {
					onClick: () => {
						actions.remoteServerDisconnect(address);
						actions.setDelete('remoteServerAddresses', address);
					},
				}, 'Forget'),

				r(Button, {
					onClick: () => {
						actions.remoteServerConnect(address);
					},
				}, 'Connect'),
			]),
		]),

		state === 'ready' ? r(React.Fragment, [
			// TODO
		]) : targetState === 'ready' ? r(Label, [
			'Connecting...',
		]) : null,
	]);
});

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

		const nativeProtocolTcpModules = sortBy(prop('index'), filter(
			propEq('name', 'module-native-protocol-tcp'),
			values(this.props.modules),
		));

		const remoteServerAddresses = keys(this.props.preferences.remoteServerAddresses);

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

			nativeProtocolTcpModules.length > 0 ? r(React.Fragment, [
				r(Label, [
					'This server:',
				]),

				...map(module => r.div([
					r.div({
						style: { display: 'flex', justifyContent: 'space-between' },
					}, [
						r(Label, {
							passive: true,
						}, [
							path([ 'properties', 'module', 'description' ], module),
						]),

						r(Button, {
							onClick: () => {
								this.props.actions.unloadModuleByIndex(module.index);
							},
						}, 'Unload'),
					]),

					r(Label, {
						userSelect: true,
					}, [
						r.code([
							module.name,
							' ',
							module.args,
						]),
					]),
				]), nativeProtocolTcpModules),
			]) : r(Label, {
				title: 'No loaded `module-native-protocol-tcp` found',
			}, [
				'This server does not currently accept tcp connections.',
			]),

			r(Button, {
				onClick: () => {
					this.props.openLoadModuleModal({
						name: 'module-native-protocol-tcp',
						args: formatModuleArgs({
							'auth-ip-acl': [
								'127.0.0.0/8',
								'10.0.0.0/8',
								'172.16.0.0/12',
								'192.168.0.0/16',
							],
						}),
					});
				},
			}, 'Allow incoming connections...'),

			r.hr(),

			remoteServerAddresses.length > 0 ? r(React.Fragment, [
				r(Label, [
					'Remote servers:',
				]),

				...map(address => r(RemoteServer, { address }), remoteServerAddresses),
			]) : r(Label, [
				'No known servers',
			]),

			r(Button, {
				onClick: () => {
					this.props.openAddRemoteServerModal();
				},
			}, 'Add a server...'),

			this.props.preferences.showDebugInfo && r.pre({
				style: {
					fontSize: '0.75em',
				},
			}, [
				JSON.stringify(this.props.modules, null, 2),
			]),
		] : []);
	}
}

module.exports = connect(
	state => ({
		modules: state.pulse.infos.modules,
		preferences: state.preferences,
	}),
	dispatch => ({
		actions: bindActionCreators(pulseActions, dispatch),
	}),
	null,
	{ withRef: true },
)(Cards);
