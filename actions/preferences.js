
const { createActions: createActionCreators } = require('redux-actions');

module.exports = createActionCreators({
	PREFERENCES: {
		SET: null,
		TOGGLE: null,
		RESET_DEFAULTS: null,
		SET_ADD: (key, value) => ({ key, value }),
		SET_DELETE: (key, value) => ({ key, value }),
	},
});
