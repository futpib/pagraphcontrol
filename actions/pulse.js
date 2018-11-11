
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
	},
});
