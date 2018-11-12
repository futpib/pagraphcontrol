
const {
	merge,
} = require('ramda');

const { handleActions } = require('redux-actions');

const { preferences } = require('../actions');

const initialState = {
	hideDisconnectedClients: true,
	hideDisconnectedModules: true,
	hideDisconnectedSources: false,
	hideDisconnectedSinks: false,

	hideMonitors: false,
	hidePulseaudioApps: true,

	hideVolumeThumbnails: false,
	lockChannelsTogether: true,

	maxVolume: 1.5,

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
