
const { createStore, applyMiddleware } = require('redux');

const { composeWithDevTools } = require('redux-devtools-extension');

const { default: thunkMiddleware } = require('redux-thunk');
const { default: promiseMiddleware } = require('redux-promise-middleware');

const { persistStore, persistReducer } = require('redux-persist');
const createElectronStorage = require('redux-persist-electron-storage');

const { reducer, initialState } = require('../reducers');

const pulseMiddleware = require('./pulse-middleware');

const persistConfig = {
	key: 'redux-persist',
	whitelist: [ 'preferences' ],
	storage: createElectronStorage(),
};

const dev = process.env.NODE_ENV !== 'production';

module.exports = (state = initialState) => {
	const middlewares = [
		thunkMiddleware,
		promiseMiddleware,
		pulseMiddleware,
	].filter(Boolean);

	const reducer_ = persistReducer(persistConfig, reducer);

	const store = createStore(
		reducer_,
		state,
		composeWithDevTools({
			realtime: dev,
		})(applyMiddleware(...middlewares)),
	);

	persistStore(store);

	return store;
};
