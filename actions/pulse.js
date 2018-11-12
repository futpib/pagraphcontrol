
const { createActions: createActionCreators } = require('redux-actions');

module.exports = createActionCreators({
	PULSE: {
		READY: null,
		CLOSE: null,

		NEW: null,
		CHANGE: null,
		REMOVE: null,

		INFO: null,

		MOVE_SINK_INPUT: (sinkInputIndex, destSinkIndex) => ({ sinkInputIndex, destSinkIndex }),
		MOVE_SOURCE_OUTPUT: (sourceOutputIndex, destSourceIndex) => ({ sourceOutputIndex, destSourceIndex }),

		KILL_CLIENT_BY_INDEX: clientIndex => ({ clientIndex }),

		KILL_SINK_INPUT_BY_INDEX: sinkInputIndex => ({ sinkInputIndex }),
		KILL_SOURCE_OUTPUT_BY_INDEX: sourceOutputIndex => ({ sourceOutputIndex }),

		UNLOAD_MODULE_BY_INDEX: moduleIndex => ({ moduleIndex }),

		SET_SINK_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SOURCE_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SINK_INPUT_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),
		SET_SOURCE_OUTPUT_VOLUMES: (index, channelVolumes) => ({ index, channelVolumes }),

		SET_SINK_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SOURCE_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SINK_INPUT_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
		SET_SOURCE_OUTPUT_CHANNEL_VOLUME: (index, channelIndex, volume) => ({ index, channelIndex, volume }),
	},
});
