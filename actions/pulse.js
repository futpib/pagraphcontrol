
const { map } = require('ramda');

const { createActions: createActionCreators } = require('redux-actions');

const withMetaPulseServerId = payloadCreator => {
	const metaCreator = (...args) => ({
		pulseServerId: args[payloadCreator.length],
	});

	return [
		payloadCreator,
		metaCreator,
	];
};

const noop = () => null;
const identity = x => x;

module.exports = createActionCreators({
	PULSE: map(withMetaPulseServerId, {
		READY: noop,
		CLOSE: noop,

		CONNECT: noop,
		DISCONNECT: noop,

		ERROR: identity,

		NEW: identity,
		CHANGE: identity,
		REMOVE: identity,

		INFO: identity,

		SERVER_INFO: identity,

		MOVE_SINK_INPUT: (sinkInputIndex, destSinkIndex) => ({ sinkInputIndex, destSinkIndex }),
		MOVE_SOURCE_OUTPUT: (sourceOutputIndex, destSourceIndex) => ({ sourceOutputIndex, destSourceIndex }),

		KILL_CLIENT_BY_INDEX: clientIndex => ({ clientIndex }),

		KILL_SINK_INPUT_BY_INDEX: sinkInputIndex => ({ sinkInputIndex }),
		KILL_SOURCE_OUTPUT_BY_INDEX: sourceOutputIndex => ({ sourceOutputIndex }),

		LOAD_MODULE: (name, argument) => ({ name, argument }),
		UNLOAD_MODULE_BY_INDEX: moduleIndex => ({ moduleIndex }),

		SET_SINK_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SOURCE_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SINK_INPUT_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SOURCE_OUTPUT_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),

		SET_SINK_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SOURCE_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SINK_INPUT_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SOURCE_OUTPUT_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),

		SET_CARD_PROFILE: (index, profileName) => ({ index, profileName }),

		SET_SINK_MUTE: (index, muted) => ({ index, muted }),
		SET_SOURCE_MUTE: (index, muted) => ({ index, muted }),
		SET_SINK_INPUT_MUTE_BY_INDEX: (index, muted) => ({ index, muted }),
		SET_SOURCE_OUTPUT_MUTE_BY_INDEX: (index, muted) => ({ index, muted }),

		SET_DEFAULT_SINK_BY_NAME: name => ({ name }),
		SET_DEFAULT_SOURCE_BY_NAME: name => ({ name }),
	}),
});
