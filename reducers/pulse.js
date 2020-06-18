
const {
	always,
	merge,
	omit,
	fromPairs,
	map,
	pick,
	equals,
	takeLast,
	over,
	lensProp,
} = require('ramda');

const { combineReducers } = require('redux');

const { handleActions } = require('redux-actions');

const { pulse } = require('../actions');

const { things } = require('../constants/pulse');

const primaryPulseServer = '__PRIMARY_PULSE_SERVER__';

const serverInitialState = {
	state: 'closed',
	targetState: 'closed',

	serverInfo: {},

	objects: fromPairs(map(({ key }) => [ key, {} ], things)),
	infos: fromPairs(map(({ key }) => [ key, {} ], things)),

	log: { items: [] },
};

const initialState = {};

const logMaxItems = 3;

const serverReducer = combineReducers({
	state: handleActions({
		[pulse.ready]: always('ready'),
		[pulse.close]: always('closed'),
	}, serverInitialState.state),

	targetState: handleActions({
		[pulse.connect]: always('ready'),
		[pulse.disconnect]: always('closed'),
	}, serverInitialState.targetState),

	serverInfo: handleActions({
		[pulse.serverInfo]: (state, { payload }) => {
			return equals(state, payload)
				? state
				: payload;
		},
		[pulse.close]: always(serverInitialState.serverInfo),
	}, serverInitialState.serverInfo),

	objects: combineReducers(fromPairs(map(({ key, type }) => [ key, handleActions({
		[pulse.new]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}

			if (payload.type === 'sinkInput' || payload.type === 'sourceOutput') {
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
		[pulse.info]: (state, { payload }) => {
			if (payload.type !== type) {
				return state;
			}

			if (payload.type === 'sinkInput' || payload.type === 'sourceOutput') {
				const newPao = pick([
					'type',
					'index',
					'moduleIndex',
					'clientIndex',
					'sinkIndex',
					'sourceIndex',
				], payload);

				const oldPao = state[payload.index];

				if (equals(newPao, oldPao)) {
					return state;
				}

				return merge(state, {
					[newPao.index]: newPao,
				});
			}

			return state;
		},
		[pulse.close]: () => serverInitialState.objects[key],
	}, serverInitialState.objects[key]) ], things))),

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
		[pulse.close]: () => serverInitialState.objects[key],
	}, serverInitialState.infos[key]) ], things))),

	log: combineReducers({
		items: handleActions({
			[pulse.error]: (state, { payload }) => takeLast(logMaxItems, state.concat({
				type: 'error',
				error: payload,
			})),
			[pulse.close]: (state, { type }) => takeLast(logMaxItems, state.concat({
				type: 'info',
				action: type,
			})),
			[pulse.ready]: (state, { type }) => takeLast(logMaxItems, state.concat({
				type: 'info',
				action: type,
			})),
		}, serverInitialState.log.items),
	}),
});

const reducer = (state = initialState, action) => { // eslint-disable-line default-param-last
	const { pulseServerId = primaryPulseServer } = action.meta || {};
	return over(lensProp(pulseServerId), s => serverReducer(s, action), state);
};

module.exports = {
	initialState,
	reducer,

	primaryPulseServer,
};
