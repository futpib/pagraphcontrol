
const {
	merge,
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

	doNotAskForConfirmations: false,
	showDebugInfo: false,
};

const reducer = handleActions({
	[preferences.set]: (state, { payload }) => merge(state, payload),
	[preferences.toggle]: (state, { payload }) => merge(state, { [payload]: !state[payload] }),
	[preferences.resetDefaults]: () => initialState,
}, initialState);

module.exports = {
	initialState,
	reducer,
};
