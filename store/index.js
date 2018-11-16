
const { createStore, applyMiddleware } = require('redux');

// const { createLogger } = require('redux-logger');
const { composeWithDevTools } = require('remote-redux-devtools');

const { default: thunkMiddleware } = require('redux-thunk');
const { default: createPromiseMiddleware } = require('redux-promise-middleware');

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
		createPromiseMiddleware(),
		pulseMiddleware,
		// dev && createLogger(),
	].filter(Boolean);

	const reducer_ = persistReducer(persistConfig, reducer);

	const store = createStore(
		reducer_,
		state,
		composeWithDevTools({
			realtime: dev,
			// hostname: 'localhost', port: 8000,
		})(applyMiddleware(...middlewares)),
	);

	persistStore(store);

	return store;
};
