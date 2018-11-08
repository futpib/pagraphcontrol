
const { combineReducers } = require('redux');

const { reducer: pulse, initialState: pulseInitialState } = require('./pulse');
const { reducer: preferences, initialState: preferencesInitialState } = require('./preferences');
const { reducer: icons, initialState: iconsInitialState } = require('./icons');

const initialState = {
	pulse: pulseInitialState,
	preferences: preferencesInitialState,
	icons: iconsInitialState,
};

const reducer = combineReducers({
	pulse,
	preferences,
	icons,
});

module.exports = {
	initialState,
	reducer,
};
