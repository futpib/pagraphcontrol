
const {
	merge,
	over,
	lensProp,
	not,
	omit,
} = require('ramda');

const { handleActions } = require('redux-actions');

const { preferences } = require('../actions');

const initialState = {
	hideOnScreenButtons: false,

	hideDisconnectedClients: true,
	hideDisconnectedModules: true,
	hideDisconnectedSources: false,
	hideDisconnectedSinks: false,

	hideMonitorSourceEdges: false,
	hideMonitors: false,
	hidePulseaudioApps: true,

	hideVolumeThumbnails: false,
	lockChannelsTogether: true,

	maxVolume: 1.5,
	volumeStep: 1 / 20,

	hideLiveVolumePeaks: false,

	doNotAskForConfirmations: false,
	showDebugInfo: false,

	remoteServerAddresses: {},
};

const reducer = handleActions({
	[preferences.set]: (state, { payload }) => merge(state, payload),
	[preferences.toggle]: (state, { payload }) => over(lensProp(payload), not, state),

	[preferences.setAdd]: (state, { payload: { key, value } }) => over(lensProp(key), merge({ [value]: true }), state),
	[preferences.setDelete]: (state, { payload: { key, value } }) => over(lensProp(key), omit([ value ]), state),

	[preferences.resetDefaults]: () => initialState,
}, initialState);

module.exports = {
	initialState,
	reducer,
};
