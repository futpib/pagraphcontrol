
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
	lensPath,
} = require('ramda');

const { combineReducers } = require('redux');

const { handleActions } = require('redux-actions');

const { pulse } = require('../actions');

const { things } = require('../constants/pulse');

const initialState = {
	state: 'closed',

	serverInfo: {},

	objects: fromPairs(map(({ key }) => [ key, {} ], things)),
	infos: fromPairs(map(({ key }) => [ key, {} ], things)),

	log: { items: [] },

	remoteServers: {},
};

const logMaxItems = 3;

const reducer = combineReducers({
	state: handleActions({
		[pulse.ready]: always('ready'),
		[pulse.close]: always('closed'),
	}, initialState.state),

	serverInfo: handleActions({
		[pulse.serverInfo]: (state, { payload }) => {
			return equals(state, payload) ?
				state :
				payload;
		},
		[pulse.close]: always(initialState.serverInfo),
	}, initialState.serverInfo),

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
		[pulse.close]: () => initialState.objects[key],
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
		[pulse.close]: () => initialState.objects[key],
	}, initialState.infos[key]) ], things))),

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
		}, initialState.log.items),
	}),

	remoteServers: handleActions({
		[pulse.remoteServerConnect]: (state, { payload }) => over(lensPath([ payload, 'targetState' ]), always('ready'), state),
		[pulse.remoteServerDisconnect]: (state, { payload }) => over(lensPath([ payload, 'targetState' ]), always('closed'), state),
	}, initialState.remoteServers),
});

module.exports = {
	initialState,
	reducer,
};
