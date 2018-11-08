
const { combineReducers } = require('redux');

const { reducer: pulse, initialState: pulseInitialState } = require('./pulse');
const { reducer: preferences, initialState: preferencesInitialState } = require('./preferences');

const initialState = {
	pulse: pulseInitialState,
	preferences: preferencesInitialState,
};

const reducer = combineReducers({
	pulse,
	preferences,
});

module.exports = {
	initialState,
	reducer,
};
