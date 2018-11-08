
const { createActions: createActionCreators } = require('redux-actions');

module.exports = createActionCreators({
	PREFERENCES: {
		SET: null,
		TOGGLE: null,
		RESET_DEFAULTS: null,
	},
});
