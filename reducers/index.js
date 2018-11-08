
const { combineReducers } = require('redux');

const { reducer: pulse, initialState: pulseInitialState } = require('./pulse');

const initialState = {
	pulse: pulseInitialState,
};

const reducer = combineReducers({
	pulse,
});

module.exports = {
	initialState,
	reducer,
};
