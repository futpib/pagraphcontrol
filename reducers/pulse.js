
const {
	always,
	merge,
	omit,
	fromPairs,
	map,
} = require('ramda');

const { combineReducers } = require('redux');

const { handleActions } = require('redux-actions');

const { pulse } = require('../actions');

const { things } = require('../constants/pulse');

const initialState = {
	state: 'closed',

	objects: fromPairs(map(({ key }) => [ key, {} ], things)),
	infos: fromPairs(map(({ key }) => [ key, {} ], things)),
};

const reducer = combineReducers({
	state: handleActions({
		[pulse.ready]: always('ready'),
		[pulse.close]: always('closed'),
	}, initialState.state),

	objects: combineReducers(fromPairs(map(({ key, type }) => [ key, handleActions({
		[pulse.new]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}
			return merge(state, {
				[payload.index]: payload,
			});
		},
		[pulse.remove]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}
			return omit([ payload.index ], state);
		},
	}, initialState.objects[key]) ], things))),

	infos: combineReducers(fromPairs(map(({ key, type }) => [ key, handleActions({
		[pulse.remove]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}
			return omit([ payload.index ], state);
		},
		[pulse.info]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}
			return merge(state, {
				[payload.index]: payload,
			});
		},
	}, initialState.infos[key]) ], things))),
});

module.exports = {
	initialState,
	reducer,
};
